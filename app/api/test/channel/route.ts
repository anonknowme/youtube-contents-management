/**
 * 간단한 DB 조회 테스트
 * URL: /api/test/channel?channelId=UCT_RhM-i6or1qS1JRm4Bqrw
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const channelId = request.nextUrl.searchParams.get('channelId');

        if (!channelId) {
            return NextResponse.json({ error: 'channelId 필요' }, { status: 400 });
        }

        console.log('🔍 DB에서 검색:', channelId);

        // 1단계: 채널 검색
        const { data, error } = await supabase
            .from('channels')
            .select('id, channel_id, title')
            .eq('channel_id', channelId)
            .single();

        console.log('결과:', { data, error });

        if (error) {
            return NextResponse.json({
                success: false,
                error: error.message,
                details: error,
            });
        }

        if (!data) {
            return NextResponse.json({
                success: false,
                message: '채널을 찾을 수 없습니다',
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                supabase_id: data.id,
                youtube_channel_id: data.channel_id,
                title: data.title,
            },
        });

    } catch (error) {
        console.error('❌ 에러:', error);
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}
