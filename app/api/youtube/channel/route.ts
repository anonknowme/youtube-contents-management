/**
 * YouTube API 테스트 라우트
 * 
 * URL: /api/youtube/channel?channelId=UCX6OQ3DkcsbYNE6H8uQQuVA
 * 
 * 이것은 Next.js의 API Route입니다.
 * Python Flask로 치면:
 * 
 * @app.route('/api/youtube/channel')
 * def get_channel():
 *     channel_id = request.args.get('channelId')
 *     ...
 */

import { NextRequest, NextResponse } from 'next/server';
import { getChannelInfo } from '@/lib/youtubeService';

// GET 요청 핸들러
export async function GET(request: NextRequest) {
    try {
        // URL 파라미터 가져오기
        const searchParams = request.nextUrl.searchParams;
        const channelId = searchParams.get('channelId');

        // 유효성 검사
        if (!channelId) {
            return NextResponse.json(
                { error: 'channelId 파라미터가 필요합니다!' },
                { status: 400 }
            );
        }

        console.log('📺 채널 정보 요청:', channelId);

        // YouTube API 호출
        const channelInfo = await getChannelInfo(channelId);

        // 성공 응답
        return NextResponse.json({
            success: true,
            data: channelInfo,
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
