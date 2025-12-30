import { getChannelInfo, getChannelVideos, fetchTranscript, getVideosStatistics } from './youtubeService';
import { syncChannelData, saveChannel, saveTranscript, updateVideoTranscriptStatus } from './databaseService';
import { getAllowedChannels } from './channelConfig';
import { supabaseAdmin } from './supabase';

function checkAdminPermission() {
    if (!supabaseAdmin) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다!');
    }
    return supabaseAdmin;
}

/**
 * 자막이 없는 영상들을 찾아 자막을 채워넣습니다.
 * @param limit - 한 번에 처리할 영상 개수 제한 (기본값: 50)
 */
export async function syncMissingTranscripts(channelId: string, limit: number = 50) {
    console.log(`📝 자막 보완 작업 시작: ${channelId} (Limit: ${limit})`);

    const { data: channel } = await checkAdminPermission()
        .from('channels')
        .select('id')
        .eq('channel_id', channelId)
        .single();

    if (!channel) return;

    // 1. 상태 기반 쿼리로 변경 (pending 상태인 영상만 조회)
    let offset = 0;
    const BATCH_SIZE = 50;
    let totalTranscriptAdded = 0;
    let processedCount = 0;

    while (processedCount < limit) {
        const currentLimit = Math.min(BATCH_SIZE, limit - processedCount);

        // transcript_status가 'available'이나 'disabled'가 아닌 영상 조회
        // 즉, 'pending' 또는 'failed' 상태인 영상들만 가져옴
        const { data: batchVideos } = await checkAdminPermission()
            .from('videos')
            .select('video_id, title')
            .eq('channel_id', channel.id)
            .neq('transcript_status', 'available')
            .neq('transcript_status', 'disabled')
            .range(offset, offset + currentLimit - 1)
            .order('published_at', { ascending: false });

        if (!batchVideos || batchVideos.length === 0) break;

        console.log(`📊 배치 (${offset}~${offset + batchVideos.length}) 처리 중...`);

        for (const video of batchVideos) {
            try {
                const transcript = await fetchTranscript(video.video_id);

                if (transcript) {
                    // 성공: saveTranscript 내부에서 status='available'로 업데이트됨
                    await saveTranscript(video.video_id, transcript);
                    totalTranscriptAdded++;
                    console.log(`📝 자막 복구 완료: ${video.title.substring(0, 20)}...`);
                } else {
                    // null 반환: Transcript Disabled -> status='disabled' 업데이트
                    console.log(`❌ 자막 불가능 (Disabled): ${video.title.substring(0, 20)}...`);
                    await updateVideoTranscriptStatus(video.video_id, 'disabled');
                }
            } catch (error) {
                // 에러 발생: 일시적 오류 -> status 유지 (또는 failed로 업데이트 가능하지만 재시도를 위해 유지)
                console.error(`⚠️ 자막 가져오기 실패 (일시적 오류): ${video.title.substring(0, 20)}...`);
            }

            await new Promise(resolve => setTimeout(resolve, 800));
        }

        offset += currentLimit;
        processedCount += currentLimit;

        if (batchVideos.length < currentLimit) break;
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`✅ 자막 동기화 완료: 총 ${totalTranscriptAdded}개 추가됨`);
}

/**
 * 단일 채널 동기화 (Light Sync)
 * 최신 영상 확인 후 필요시에만 가져옵니다. 자막/통계는 건드리지 않습니다.
 */
export async function syncNewVideos(channelId: string) {
    console.log(`🔄 Syncing channel (New Videos Only): ${channelId}`);


    try {
        // 1. DB에서 채널 확인
        const { data: existingChannel } = await checkAdminPermission()
            .from('channels')
            .select('id, title, last_synced_at')
            .eq('channel_id', channelId)
            .single();

        let syncMode: 'full' | 'update' | 'none' = 'none';
        let reason = '';

        if (!existingChannel) {
            // 새 채널 -> Full Sync (전체)
            console.log('🆕 새 채널 - 전체 동기화 시작');
            syncMode = 'full';
            reason = 'new_channel';
        } else {
            // 기존 채널 - 최신 영상 비교
            console.log(`📋 기존 채널: ${existingChannel.title}`);

            const { data: latestInDB } = await checkAdminPermission()
                .from('videos')
                .select('published_at')
                .eq('channel_id', existingChannel.id)
                .order('published_at', { ascending: false })
                .limit(1)
                .single();

            if (!latestInDB) {
                // 영상이 하나도 없음 -> Full Sync
                console.log('⚠️  영상 없음 - 전체 동기화 시작');
                syncMode = 'full';
                reason = 'no_videos';
            } else {
                // YouTube에서 최신 1개만 확인
                console.log('🔍 최신 영상 확인 중...');
                const latestVideos = await getChannelVideos(channelId, 1);

                if (latestVideos.length > 0) {
                    const dbDateStr = latestInDB.published_at.endsWith('Z')
                        ? latestInDB.published_at
                        : latestInDB.published_at + 'Z';

                    const ytLatest = new Date(latestVideos[0].publishedAt).getTime();
                    const dbLatest = new Date(dbDateStr).getTime();

                    console.log(`📅 YouTube 최신: ${latestVideos[0].publishedAt}`);
                    console.log(`📅 DB 최신: ${dbDateStr}`);

                    if (ytLatest > dbLatest) {
                        // 새 영상 발견 -> Update Sync (최신 50개만)
                        console.log('🆕 새 영상 발견! 최신 영상 업데이트');
                        syncMode = 'update';
                        reason = 'new_videos';
                    } else {
                        // 최신 상태 -> 채널 정보만 갱신
                        console.log('✅ 새 영상 없음. 채널 정보만 업데이트');
                        syncMode = 'none'; // 비디오 싱크는 안함
                        reason = 'up_to_date';
                    }
                }
            }
        }

        if (syncMode === 'full') {
            const channelData = await getChannelInfo(channelId);
            const videos = await getChannelVideos(channelId, 0);
            await syncChannelData(channelData, videos);
            console.log(`✅ Full sync 완료: ${videos.length}개 영상`);
        } else if (syncMode === 'update') {
            const channelData = await getChannelInfo(channelId);
            const videos = await getChannelVideos(channelId, 50);
            await syncChannelData(channelData, videos);
            console.log(`✅ Update sync 완료: ${videos.length}개 영상 범위 체크`);
        } else {
            const channelData = await getChannelInfo(channelId);
            await saveChannel(channelData);
            console.log(`✅ 채널 정보 단순 갱신 완료`);
        }

        return {
            success: true,
            action: syncMode,
            reason,
            videoCount: syncMode === 'none' ? 0 : (syncMode === 'full' ? 999 : 50)
        };

    } catch (error) {
        console.error(`❌ Sync 실패: ${channelId}`, error);
        throw error;
    }
}

/**
 * 채널 내 모든 영상의 통계(조회수, 좋아요, 댓글수)를 최신화
 */
export async function updateChannelStats(channelId: string) {
    console.log('📈 전체 영상 통계 업데이트 시작...');

    // 1. 채널의 모든 영상 ID 가져오기
    // (먼저 channel_id(UUID)를 알아야 함)
    const { data: channel } = await checkAdminPermission()
        .from('channels')
        .select('id')
        .eq('channel_id', channelId)
        .single();

    if (!channel) return;

    // 1. 모든 영상 ID 가져오기 (1000개 제한 돌파를 위한 페이지네이션)
    let allVideoIds: string[] = [];
    let offset = 0;
    const PAGE_SIZE = 1000;

    while (true) {
        const { data: batch, error } = await checkAdminPermission()
            .from('videos')
            .select('video_id')
            .eq('channel_id', channel.id)
            .range(offset, offset + PAGE_SIZE - 1);

        if (error) {
            console.error('❌ 영상 목록 조회 실패:', error);
            break;
        }

        if (!batch || batch.length === 0) break;

        allVideoIds = allVideoIds.concat(batch.map(v => v.video_id));
        offset += PAGE_SIZE;

        // 가져온 개수가 요청한 것보다 적으면 더 이상 데이터가 없는 것
        if (batch.length < PAGE_SIZE) break;
    }

    if (allVideoIds.length === 0) {
        console.log('⚠️ 통계 업데이트할 영상이 없습니다.');
        return;
    }

    const videoIds = allVideoIds;

    // 2. YouTube API로 최신 통계 가져오기
    const statsList = await getVideosStatistics(videoIds);

    // 3. DB 업데이트 (Batch Upsert)
    // video_id가 Unique여야 onConflict가 작동함.
    // 만약 Unique가 아니라면 루프 돌아야 하지만, 보통 video_id는 Unique임.

    // 3. DB 업데이트 (Parallel Update)
    // Upsert는 Not Null 제약(Title 등) 때문에 실패하므로, 개별 Update로 처리합니다.

    // 20개씩 끊어서 병렬 처리 -> 500 에러 방지
    const batchSize = 20;
    let updatedCount = 0;
    const totalBatches = Math.ceil(statsList.length / batchSize);

    for (let i = 0; i < statsList.length; i += batchSize) {
        const batch = statsList.slice(i, i + batchSize);
        const currentBatchNum = Math.floor(i / batchSize) + 1;

        process.stdout.write(`💾 DB 저장 중 [Batch ${currentBatchNum}/${totalBatches}] (${batch.length}개) ... `);

        const updatePromises = batch.map(async (item) => {
            try {
                const { error } = await checkAdminPermission()
                    .from('videos')
                    .update({
                        view_count: parseInt(item.statistics.viewCount),
                        like_count: parseInt(item.statistics.likeCount),
                        comment_count: parseInt(item.statistics.commentCount),
                        updated_at: new Date().toISOString()
                    })
                    .eq('video_id', item.id);

                if (error) throw error;
                return true;
            } catch (err: any) {
                console.error(`\n❌ 업데이트 실패 (${item.id}):`, err.message?.substring(0, 100) || 'Unknown error');
                return false;
            }
        });

        const results = await Promise.all(updatePromises);
        const successCount = results.filter(Boolean).length;
        updatedCount += successCount;

        process.stdout.write(successCount === batch.length ? '✅ OK\n' : `⚠️ ${successCount}/${batch.length} 성공\n`);

        // Rate Limit 및 DB 부하 방지를 위해 대기 시간 증가 (200ms -> 500ms)
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`✅ 통계 업데이트 완료: ${updatedCount}/${statsList.length}개 영상`);
}

export interface SyncResult {
    channelId: string;
    name: string;
    success: boolean;
    error?: string;
    action?: string;
    reason?: string;
    videoCount?: number;
}

/**
 * 모든 허용된 채널 동기화
 */
export async function syncAllAllowedChannels() {
    const channels = getAllowedChannels();
    const results: SyncResult[] = [];

    console.log(`🚀 전체 채널 sync 시작 (${channels.length}개)`);

    for (const channel of channels) {
        try {
            const result = await syncNewVideos(channel.id);
            results.push({
                channelId: channel.id,
                name: channel.name,
                ...result
            });
        } catch (error) {
            console.error(`❌ Sync 실패: ${channel.name}`, error);
            results.push({
                channelId: channel.id,
                name: channel.name,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    console.log(`✅ 전체 sync 완료: 성공 ${results.filter(r => r.success).length}/${channels.length}`);
    return results;
}
