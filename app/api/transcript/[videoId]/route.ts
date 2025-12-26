import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ videoId: string }> }
) {
    const { videoId } = await params;

    try {
        if (!supabaseAdmin) {
            throw new Error('Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing');
        }

        // 1. Check DB first
        const { data: transcriptData } = await supabaseAdmin!
            .from('video_transcripts')
            .select('content')
            .eq('video_id', videoId)
            .single();

        if (transcriptData?.content) {
            return NextResponse.json({
                success: true,
                data: {
                    videoId,
                    transcript: transcriptData.content,
                    segments: []
                }
            });
        }

        // If not found in DB, return 404 immediately. 
        // The Web App should NOT fetch from YouTube directly.
        return NextResponse.json({
            success: false,
            message: '자막 데이터가 DB에 없습니다. 로컬 Sync를 실행해주세요.'
        }, { status: 404 });

    } catch (error: any) {
        console.error('[Transcript] Fetch error:', error);

        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to fetch transcript',
            message: `자막을 조회하는 중 오류가 발생했습니다. (${error.message})`
        }, { status: 500 });
    }
}
