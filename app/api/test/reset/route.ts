/**
 * 채널 데이터 삭제 API (테스트용)
 * 
 * URL: /api/test/reset?channelId=UCT_RhM-i6or1qS1JRm4Bqrw
 * 
 * 해당 채널의 모든 영상과 채널 정보를 DB에서 삭제합니다.
 * 새로운 sync 테스트를 위해 사용하세요.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(request: NextRequest) {
    try {
        const channelId = request.nextUrl.searchParams.get('channelId');

        if (!channelId) {
            return NextResponse.json({ error: 'channelId 필요' }, { status: 400 });
        }

        console.log('🗑️ 채널 데이터 삭제:', channelId);

        // 1. 채널 찾기
        const { data: channel } = await supabase
            .from('channels')
            .select('id')
            .eq('channel_id', channelId)
            .single();

        if (!channel) {
            return NextResponse.json({
                success: false,
                message: '채널을 찾을 수 없습니다'
            });
        }

        // 2. 영상 삭제
        const { error: videosError, count: videosCount } = await supabase
            .from('videos')
            .delete({ count: 'exact' })
            .eq('channel_id', channel.id);

        if (videosError) throw videosError;

        // 3. 채널의 last_synced_at 리셋 (또는 채널 삭제)
        const { error: channelError } = await supabase
            .from('channels')
            .update({ last_synced_at: null })
            .eq('id', channel.id);

        if (channelError) throw channelError;

        console.log(`✅ 삭제 완료: 채널 1개, 영상 ${videosCount}개`);

        return NextResponse.json({
            success: true,
            message: `채널과 영상 ${videosCount}개가 삭제되었습니다`,
            deleted: {
                channels: 1,
                videos: videosCount,
            },
        });

    } catch (error) {
        console.error('❌ 삭제 실패:', error);
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}
