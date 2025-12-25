/**
 * 채널 동기화 API
 * 
 * URL: /api/sync/channel?channelId=UCT_RhM-i6or1qS1JRm4Bqrw&maxVideos=0
 * 
 * maxVideos 파라미터:
 * - 0: 모든 영상 가져오기 (페이지네이션)
 * - 50: 최신 50개만 (기본값)
 * - 100, 200 등: 원하는 개수만큼
 * 
 * YouTube에서 채널 정보와 영상 목록을 가져와서
 * Supabase 데이터베이스에 저장합니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getChannelInfo, getChannelVideos } from '@/lib/youtubeService';
import { syncChannelData } from '@/lib/databaseService';

export async function POST(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const channelId = searchParams.get('channelId');
        const maxVideosParam = searchParams.get('maxVideos');
        const maxVideos = maxVideosParam ? parseInt(maxVideosParam) : 50;

        if (!channelId) {
            return NextResponse.json(
                { error: 'channelId 파라미터가 필요합니다!' },
                { status: 400 }
            );
        }

        console.log('🔄 채널 동기화 요청:', channelId);
        console.log(`📊 영상 개수: ${maxVideos === 0 ? '전체' : maxVideos + '개'}`);

        // 1. YouTube에서 채널 정보 가져오기
        console.log('📺 채널 정보 가져오는 중...');
        const channelData = await getChannelInfo(channelId);
        console.log(`✅ 채널: ${channelData.title} (구독자 ${channelData.subscriberCount}명)`);

        // 2. YouTube에서 영상 목록 가져오기
        console.log(`🎬 영상 목록 가져오는 중... (최대 ${maxVideos === 0 ? '전체' : maxVideos + '개'})`);
        const videos = await getChannelVideos(channelId, maxVideos);
        console.log(`✅ ${videos.length}개 영상 수집 완료`);

        // 3. Supabase에 저장
        console.log('💾 데이터베이스에 저장 중...');
        const result = await syncChannelData(channelData, videos);

        return NextResponse.json({
            success: true,
            message: `채널 동기화 완료! ${videos.length}개 영상 저장됨`,
            data: {
                channel: {
                    id: result.channelId,
                    title: channelData.title,
                    subscriberCount: channelData.subscriberCount,
                    videoCount: channelData.videoCount,
                },
                videos: {
                    total: result.videoCount,
                    fetched: videos.length,
                },
            },
        });

    } catch (error) {
        console.error('❌ 동기화 실패:', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : '알 수 없는 에러',
            },
            { status: 500 }
        );
    }
}
