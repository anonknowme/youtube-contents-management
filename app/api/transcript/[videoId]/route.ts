import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ videoId: string }> }
) {
    const { videoId } = await params;

    try {
        // 1. Check DB first (transcripts table)
        const { data: transcriptData, error } = await supabase
            .from('video_transcripts')
            .select('content')
            .eq('video_id', videoId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found'
            console.error('Supabase read error:', error);
            throw error;
        }

        if (transcriptData && transcriptData.content) {
            return NextResponse.json({
                success: true,
                data: {
                    videoId,
                    transcript: transcriptData.content,
                    segments: []
                }
            });
        }

        // 2. Check Video Status (videos Table) - NEW LOGIC using transcript_status
        const { data: videoData } = await supabase
            .from('videos')
            .select('transcript_status')
            .eq('video_id', videoId)
            .single();

        if (videoData?.transcript_status === 'disabled') {
            return NextResponse.json({
                success: false,
                message: '자막이 불가능한 영상입니다. (Disabled Status)'
            }, { status: 404 });
        }

        // If status is 'pending' or 'failed', try to fetch again.

        // 3. Try to fetch from YouTube directly
        console.log(`[Transcript] Not found in DB for ${videoId}, fetching from YouTube...`);

        const { fetchTranscript } = await import('@/lib/youtubeService');
        const { saveTranscript, updateVideoTranscriptStatus } = await import('@/lib/databaseService');

        const youtubeTranscript = await fetchTranscript(videoId);

        if (youtubeTranscript) {
            // Save to DB asynchronously (saveTranscript updates status to 'available')
            await saveTranscript(videoId, youtubeTranscript);
            console.log(`[Transcript] Fetched and saved for ${videoId}`);

            return NextResponse.json({
                success: true,
                data: {
                    videoId,
                    transcript: youtubeTranscript,
                    segments: []
                }
            });
        } else {
            // null returned = Disabled
            console.log(`[Transcript] Disabled for ${videoId}`);
            await updateVideoTranscriptStatus(videoId, 'disabled');

            return NextResponse.json({
                success: false,
                message: '자막을 가져올 수 없습니다. (자막 미지원)'
            }, { status: 404 });
        }

    } catch (error: any) {
        console.error('[Transcript] Fetch error:', error);

        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to fetch transcript',
            message: `자막을 조회하는 중 오류가 발생했습니다. (${error.message})`
        }, { status: 500 });
    }
}
