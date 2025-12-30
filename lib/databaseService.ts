/**
 * YouTube 데이터를 Supabase에 저장하는 서비스
 * 
 * 이 파일은 YouTube API에서 가져온 데이터를
 * Supabase 데이터베이스에 저장하는 함수들을 포함합니다.
 */

import { supabaseAdmin } from './supabase';
import type { YouTubeChannel, YouTubeVideo } from './youtubeService';

// 키 확인 함수 (함수 내부에서 호출)
function checkAdminPermission() {
    if (!supabaseAdmin) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다!');
    }
    return supabaseAdmin;
}

/**
 * 채널 정보를 DB에 저장 또는 업데이트
 * 
 * @param channelData - YouTube API에서 가져온 채널 정보
 * @returns 저장된 채널 ID (Supabase UUID)
 */
export async function saveChannel(channelData: YouTubeChannel): Promise<string> {
    console.log('💾 채널 저장 중:', channelData.title);

    // 이미 존재하는지 확인
    const { data: existing } = await checkAdminPermission()
        .from('channels')
        .select('id')
        .eq('channel_id', channelData.id)
        .single();

    if (existing) {
        // 업데이트
        const { data, error } = await checkAdminPermission()
            .from('channels')
            .update({
                title: channelData.title,
                description: channelData.description,
                custom_url: channelData.customUrl,
                subscriber_count: parseInt(channelData.subscriberCount),
                video_count: parseInt(channelData.videoCount),
                view_count: parseInt(channelData.viewCount),
                thumbnail_url: channelData.thumbnails.high,
                last_synced_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('channel_id', channelData.id)
            .select('id')
            .single();

        if (error) throw error;
        console.log('✅ 채널 업데이트 완료:', existing.id);
        return existing.id;
    } else {
        // 새로 삽입
        const { data, error } = await checkAdminPermission()
            .from('channels')
            .insert({
                channel_id: channelData.id,
                title: channelData.title,
                description: channelData.description,
                custom_url: channelData.customUrl,
                subscriber_count: parseInt(channelData.subscriberCount),
                video_count: parseInt(channelData.videoCount),
                view_count: parseInt(channelData.viewCount),
                thumbnail_url: channelData.thumbnails.high,
                last_synced_at: new Date().toISOString(),
            })
            .select('id')
            .single();

        if (error) throw error;
        console.log('✅ 채널 생성 완료:', data.id);
        return data.id;
    }
}

/**
 * 영상 목록을 DB에 저장 또는 업데이트
 * 
 * @param supabaseChannelId - Supabase의 channels 테이블 ID (UUID)
 * @param subscriberCount - 바이럴 점수 계산을 위한 구독자 수
 * @param videos - YouTube API에서 가져온 영상 목록
 * @returns 저장된 영상 개수
 */
export async function saveVideos(
    supabaseChannelId: string,
    subscriberCount: number,
    videos: YouTubeVideo[]
): Promise<number> {
    console.log(`💾 영상 저장 중: ${videos.length} 개`);

    let savedCount = 0;
    let updatedCount = 0;

    // 배치 처리 (10개씩)
    const batchSize = 10;
    const totalBatches = Math.ceil(videos.length / batchSize);

    for (let i = 0; i < videos.length; i += batchSize) {
        const batch = videos.slice(i, i + batchSize);
        const currentBatchNum = Math.floor(i / batchSize) + 1;

        process.stdout.write(`💾 DB 저장 중 [Batch ${currentBatchNum}/${totalBatches}] (${batch.length}개) ... `);

        for (const video of batch) {
            const viewCount = parseInt(video.statistics.viewCount);

            // 이미 존재하는지 확인
            const { data: existing } = await checkAdminPermission()
                .from('videos')
                .select('id')
                .eq('video_id', video.id)
                .single();

            if (existing) {
                // 통계만 업데이트 (조회수, 좋아요 등은 변할 수 있음)
                const { error } = await checkAdminPermission()
                    .from('videos')
                    .update({
                        view_count: viewCount,
                        like_count: parseInt(video.statistics.likeCount),
                        comment_count: parseInt(video.statistics.commentCount),
                        updated_at: new Date().toISOString(),
                    })
                    .eq('video_id', video.id);

                if (error) {
                    console.error('❌ 영상 업데이트 실패:', video.id, error);
                } else {
                    updatedCount++;
                }
            } else {
                // 새로 삽입
                const { error } = await checkAdminPermission()
                    .from('videos')
                    .insert({
                        video_id: video.id,
                        channel_id: supabaseChannelId,
                        title: video.title,
                        description: video.description,
                        thumbnail_url: video.thumbnails.high,
                        url: video.url,
                        view_count: viewCount,
                        like_count: parseInt(video.statistics.likeCount),
                        comment_count: parseInt(video.statistics.commentCount),
                        duration_seconds: video.contentDetails.durationSeconds,
                        published_at: video.publishedAt,
                        definition: video.contentDetails.definition,
                        has_captions: video.contentDetails.caption === 'true',
                    });

                if (error) {
                    console.error('❌ 영상 저장 실패:', video.id, error);
                } else {
                    savedCount++;
                }
            }
        }

        process.stdout.write(`✅ OK\n`);
    }

    console.log(`✅ 영상 저장 완료: ${savedCount}개 신규, ${updatedCount}개 업데이트`);
    return savedCount + updatedCount;
}

/**
 * 채널의 전체 데이터 동기화
 * (채널 정보 + 영상 목록을 한 번에 저장)
 * 
 * @param channelData - 채널 정보
 * @param videos - 영상 목록
 * @returns 결과 요약
 */
export async function syncChannelData(
    channelData: YouTubeChannel,
    videos: YouTubeVideo[]
) {
    console.log('🔄 채널 동기화 시작:', channelData.title);

    // 1. 채널 저장
    const supabaseChannelId = await saveChannel(channelData);

    // 2. 영상 저장
    const subscriberCount = parseInt(channelData.subscriberCount);
    const videoCount = await saveVideos(supabaseChannelId, subscriberCount, videos);

    console.log('✅ 동기화 완료!');

    return {
        success: true,
        channelId: supabaseChannelId,
        videoCount: videoCount,
    };
}

/**
 * 자막 데이터 저장
 */
export async function saveTranscript(videoId: string, transcript: string) {
    const { error } = await checkAdminPermission()
        .from('video_transcripts')
        .upsert({
            video_id: videoId,
            content: transcript,
            created_at: new Date().toISOString()
        });

    if (error) {
        console.error(`❌ 자막 저장 실패 (${videoId}):`, error);
        throw error;
    }

    // 자막 상태를 'available'로 업데이트
    await updateVideoTranscriptStatus(videoId, 'available');
}

/**
 * 영상의 자막 상태를 업데이트합니다.
 * @param status - 'pending' | 'available' | 'disabled' | 'failed'
 */
export async function updateVideoTranscriptStatus(videoId: string, status: string) {
    const { error } = await checkAdminPermission()
        .from('videos')
        .update({
            transcript_status: status,
            updated_at: new Date().toISOString()
        })
        .eq('video_id', videoId);

    if (error) {
        console.error(`❌ 자막 상태 업데이트 실패 (${videoId} -> ${status}):`, error);
        // 상태 업데이트 실패는 치명적이지 않으므로 throw하지 않음 (로그만 남김)
    }
}
