import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from '@danielxceron/youtube-transcript';
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

        console.log(`[Transcript] Request for ${videoId}`);

        // 1. Check DB first
        const { data: transcriptData } = await supabaseAdmin!
            .from('video_transcripts')
            .select('content')
            .eq('video_id', videoId)
            .single();

        if (transcriptData?.content) {
            console.log(`[Transcript] Found in DB (${transcriptData.content.length} chars)`);
            return NextResponse.json({
                success: true,
                data: {
                    videoId,
                    transcript: transcriptData.content,
                    segments: [] // Segments are lost when storing raw text, but that's okay for analysis
                }
            });
        }

        // 2. Fallback: Fetch from YouTube (All Environments)
        console.log(`[Transcript] Not in DB, fetching from YouTube...`);

        // Fetch transcript
        const transcriptSegments = await YoutubeTranscript.fetchTranscript(videoId);
        const fullText = transcriptSegments.map(item => item.text).join(' ');

        // Save to DB for future use
        if (fullText) {
            await supabaseAdmin!
                .from('video_transcripts')
                .upsert({
                    video_id: videoId,
                    content: fullText,
                    created_at: new Date().toISOString()
                });
            console.log(`[Transcript] Saved to DB (video_transcripts)`);
        }

        return NextResponse.json({
            success: true,
            data: {
                videoId,
                transcript: fullText,
                segments: transcriptSegments
            }
        });
    } catch (error: any) {
        console.error('[Transcript] Fetch error:', error);

        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to fetch transcript',
            message: `자막을 가져올 수 없습니다. (${error.message})`
        }, { status: 500 });
    }
}
