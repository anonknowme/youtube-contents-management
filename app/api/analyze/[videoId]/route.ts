import { NextRequest, NextResponse } from 'next/server';
import { summarizeTranscript } from '@/lib/gemini';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ videoId: string }> }
) {
    const { videoId } = await params;

    try {
        console.log(`[AI Analysis] Starting analysis for ${videoId}...`);

        // Fetch transcript from our API
        const transcriptResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/transcript/${videoId}`
        );

        if (!transcriptResponse.ok) {
            throw new Error('Failed to fetch transcript');
        }

        const transcriptData = await transcriptResponse.json();

        if (!transcriptData.success || !transcriptData.data.transcript) {
            throw new Error('No transcript available');
        }

        const transcript = transcriptData.data.transcript;

        // Fetch comments for analysis
        let comments = [];
        try {
            const commentsResponse = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/comments/${videoId}`
            );

            if (commentsResponse.ok) {
                const commentsData = await commentsResponse.json();
                if (commentsData.success) {
                    comments = commentsData.data.comments;
                    console.log(`[AI Analysis] Retrieved ${comments.length} comments for analysis`);
                }
            }
        } catch (commentError) {
            console.warn('[AI Analysis] Failed to fetch comments, proceeding without them:', commentError);
        }

        console.log(`[AI Analysis] Transcript length: ${transcript.length} characters`);

        // Generate summary using Gemini (with comments)
        const summary = await summarizeTranscript(transcript, comments);

        console.log(`[AI Analysis] Summary generated successfully`);

        return NextResponse.json({
            success: true,
            data: {
                videoId,
                summary,
                analyzedAt: new Date().toISOString()
            }
        });
    } catch (error: any) {
        console.error('[AI Analysis] Error:', error);

        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to analyze video',
            message: 'AI 분석에 실패했습니다. 잠시 후 다시 시도해주세요.'
        }, { status: 500 });
    }
}
