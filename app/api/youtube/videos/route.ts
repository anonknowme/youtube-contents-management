/**
 * YouTube 영상 목록 가져오기 API
 * 
 * URL: /api/youtube/videos?channelId=UCT_RhM-i6or1qS1JRm4Bqrw&maxResults=10
 */

import { NextRequest, NextResponse } from 'next/server';
import { getChannelVideos } from '@/lib/youtubeService';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const channelId = searchParams.get('channelId');
        const maxResults = parseInt(searchParams.get('maxResults') || '10');

        if (!channelId) {
            return NextResponse.json(
                { error: 'channelId 파라미터가 필요합니다!' },
                { status: 400 }
            );
        }

        console.log(`📹 영상 목록 요청: ${channelId} (${maxResults}개)`);

        const videos = await getChannelVideos(channelId, maxResults);

        return NextResponse.json({
            success: true,
            count: videos.length,
            data: videos,
        });

    } catch (error) {
        console.error('❌ 에러 발생:', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : '알 수 없는 에러'
            },
            { status: 500 }
        );
    }
}
