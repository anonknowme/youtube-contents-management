import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from '@danielxceron/youtube-transcript';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ videoId: string }> }
) {
    const { videoId } = await params;

    try {
        console.log(`[Transcript] Fetching transcript for ${videoId}...`);

        // Fetch transcript - this library uses HTML scraping with InnerTube API fallback
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);

        console.log(`[Transcript] Success! Got ${transcript.length} segments`);

        // Combine all text segments
        const fullText = transcript.map(item => item.text).join(' ');

        return NextResponse.json({
            success: true,
            data: {
                videoId,
                transcript: fullText,
                segments: transcript
            }
        });
    } catch (error: any) {
        console.error('[Transcript] Fetch error:', error);

        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to fetch transcript',
            message: '자막을 가져올 수 없습니다. 이 영상은 자막이 없거나 비공개일 수 있습니다.'
        }, { status: 500 });
    }
}
