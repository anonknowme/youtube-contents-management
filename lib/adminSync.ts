import { getChannelInfo, getChannelVideos } from './youtubeService';
import { syncChannelData, saveChannel } from './databaseService';
import { getAllowedChannels } from './channelConfig';
import { supabaseAdmin } from './supabase';

if (!supabaseAdmin) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다!');
}

/**
 * 단일 채널 동기화 (스마트 sync)
 * 최신 영상 확인 후 필요시에만 full sync
 */
export async function syncSingleChannel(channelId: string) {
    console.log(`🔄 Syncing channel: ${channelId}`);

    try {
        // 1. DB에서 채널 확인
        const { data: existingChannel } = await supabaseAdmin!
            .from('channels')
            .select('id, title, last_synced_at')
            .eq('channel_id', channelId)
            .single();

        let needsFullSync = false;
        let reason = '';

        if (!existingChannel) {
            // 새 채널
            console.log('🆕 새 채널 - Full sync 필요');
            needsFullSync = true;
            reason = 'new_channel';
        } else {
            // 기존 채널 - 최신 영상 비교
            console.log(`📋 기존 채널: ${existingChannel.title}`);

            // DB에서 최신 영상 조회
            const { data: latestInDB } = await supabaseAdmin!
                .from('videos')
                .select('published_at')
                .eq('channel_id', existingChannel.id)
                .order('published_at', { ascending: false })
                .limit(1)
                .single();

            if (!latestInDB) {
                console.log('⚠️  영상 없음 - Full sync 필요');
                needsFullSync = true;
                reason = 'no_videos';
            } else {
                // YouTube에서 최신 1개만 확인
                console.log('🔍 최신 영상 확인 중...');
                const latestVideos = await getChannelVideos(channelId, 1);

                if (latestVideos.length > 0) {
                    // UTC 정규화
                    const dbDateStr = latestInDB.published_at.endsWith('Z')
                        ? latestInDB.published_at
                        : latestInDB.published_at + 'Z';

                    const ytLatest = new Date(latestVideos[0].publishedAt).getTime();
                    const dbLatest = new Date(dbDateStr).getTime();

                    console.log(`📅 YouTube 최신: ${latestVideos[0].publishedAt}`);
                    console.log(`📅 DB 최신: ${dbDateStr}`);

                    if (ytLatest > dbLatest) {
                        console.log('🆕 새 영상 발견! Full sync 시작');
                        needsFullSync = true;
                        reason = 'new_videos';
                    } else {
                        console.log('✅ 새 영상 없음. 채널 정보만 업데이트');
                        needsFullSync = false;
                        reason = 'up_to_date';
                    }
                }
            }
        }

        if (needsFullSync) {
            // Full sync
            const channelData = await getChannelInfo(channelId);
            const videos = await getChannelVideos(channelId, 0);
            await syncChannelData(channelData, videos);

            console.log(`✅ Full sync 완료: ${videos.length}개 영상`);
            return {
                success: true,
                action: 'full_sync',
                reason,
                videoCount: videos.length
            };
        } else {
            // 채널 정보만 업데이트
            const channelData = await getChannelInfo(channelId);
            await saveChannel(channelData);

            console.log(`✅ 채널 정보만 업데이트 완료`);
            return {
                success: true,
                action: 'channel_only',
                reason,
                videoCount: 0
            };
        }

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
