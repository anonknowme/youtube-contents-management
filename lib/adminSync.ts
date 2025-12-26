import { getChannelInfo, getChannelVideos, fetchTranscript } from './youtubeService';
import { syncChannelData, saveChannel, saveTranscript } from './databaseService';
import { getAllowedChannels } from './channelConfig';
import { supabaseAdmin } from './supabase';

function checkAdminPermission() {
    if (!supabaseAdmin) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다!');
    }
    return supabaseAdmin;
}

/**
 * 단일 채널 동기화 (스마트 sync)
 * 최신 영상 확인 후 필요시에만 full sync
 */
export async function syncSingleChannel(channelId: string) {
    console.log(`🔄 Syncing channel: ${channelId}`);

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

        // ----------------------------------------------------------------
        // [Step 2] 자막 동기화 (Process 분리 - Pagination 적용)
        // 채널 Sync 결과와 무관하게, DB에 있는 영상 중 자막이 없는 것을 찾아 채웁니다.
        // ----------------------------------------------------------------
        console.log('📝 자막 보완 작업 시작 (Missing Transcript Check)...');

        const targetChannelId = existingChannel ? existingChannel.id : (await checkAdminPermission().from('channels').select('id').eq('channel_id', channelId).single()).data!.id;

        const BATCH_SIZE = 50; // 한 번에 처리할 배치 크기
        let offset = 0;
        let hasMore = true;
        let totalTranscriptAdded = 0;

        while (hasMore) {
            // 1. 영상 목록 배치 조회 (Pagination)
            const { data: batchVideos } = await checkAdminPermission()
                .from('videos')
                .select('video_id, title')
                .eq('channel_id', targetChannelId)
                .range(offset, offset + BATCH_SIZE - 1)
                .order('published_at', { ascending: false }); // 최신 영상부터 체크

            if (!batchVideos || batchVideos.length === 0) {
                hasMore = false;
                break;
            }

            // 2. 이 배치의 자막 존재 여부 확인
            const { data: existingTranscripts } = await checkAdminPermission()
                .from('video_transcripts')
                .select('video_id')
                .in('video_id', batchVideos.map(v => v.video_id));

            const existingSet = new Set(existingTranscripts?.map(t => t.video_id));
            const missingVideos = batchVideos.filter(v => !existingSet.has(v.video_id));

            if (missingVideos.length > 0) {
                console.log(`📊 배치 (${offset}~${offset + batchVideos.length}) 중 자막 누락 ${missingVideos.length}개 발견`);

                // 3. 누락된 자막 다운로드
                for (const video of missingVideos) {
                    const transcript = await fetchTranscript(video.video_id);
                    if (transcript) {
                        await saveTranscript(video.video_id, transcript);
                        totalTranscriptAdded++;
                        console.log(`📝 자막 복구 완료: ${video.title.substring(0, 20)}...`);
                    } else {
                        console.log(`❌ 자막 없음 (Skip): ${video.title.substring(0, 20)}...`);
                    }
                    // Rate Limit 방지 (배치 내에서도 딜레이 유지)
                    await new Promise(resolve => setTimeout(resolve, 800));
                }
            } else {
                console.log(`✨ 배치 (${offset}~${offset + batchVideos.length}) - 모두 자막 있음`);
            }

            offset += BATCH_SIZE;
            if (batchVideos.length < BATCH_SIZE) {
                hasMore = false;
            }

            // 배치 사이에도 약간의 숨고르기
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log(`✅ 자막 동기화 최종 완료: 총 ${totalTranscriptAdded}개 추가됨`);

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
            const result = await syncSingleChannel(channel.id);
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
