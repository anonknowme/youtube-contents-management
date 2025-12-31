import { NextRequest, NextResponse } from 'next/server';
import { summarizeTranscript } from '@/lib/gemini';
import { supabaseAdmin } from '@/lib/supabase';
import { getComments } from '@/lib/youtubeService';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ videoId: string }> }
) {
    const { videoId } = await params;

    try {
        console.log(`[AI Analysis] Starting analysis for ${videoId}...`);

        if (!supabaseAdmin) {
            throw new Error('Server configuration error: SUPABASE_SERVICE_ROLE_KEY missing');
        }

        // Get viral_score from request body (already calculated on frontend)
        const body = await request.json();
        const viral_score = body.viral_score || 0;

        // 1. Fetch video data from DB
        const { data: videoData, error: videoError } = await supabaseAdmin
            .from('videos')
            .select('title, video_id, thumbnail_url, view_count, like_count, comment_count, published_at')
            .eq('video_id', videoId)
            .single();

        if (videoError) {
            console.error('[AI Analysis] Video query error:', videoError);
            throw new Error(`영상 데이터 조회 실패: ${videoError.message}`);
        }

        if (!videoData) {
            throw new Error('영상 데이터를 찾을 수 없습니다.');
        }

        // Add viral_score from frontend to videoData
        const videoWithScore = { ...videoData, viral_score };

        // 2. Fetch transcript directly from DB
        const { data: transcriptData } = await supabaseAdmin
            .from('video_transcripts')
            .select('content')
            .eq('video_id', videoId)
            .single();

        if (!transcriptData?.content) {
            throw new Error('자막 데이터가 없습니다. 먼저 페이지를 새로고침하여 동기화를 진행해주세요.');
        }

        const transcript = transcriptData.content;

        // 3. Fetch comments directly from YouTube API
        // DB 저장 없이 실시간으로 가져와서 분석에 활용
        let comments: any[] = [];
        try {
            comments = await getComments(videoId, 50); // 상위 50개 댓글 분석
            console.log(`[AI Analysis] Retrieved ${comments.length} comments for analysis`);
        } catch (commentError) {
            console.warn('[AI Analysis] Failed to fetch comments, proceeding without them:', commentError);
        }

        console.log(`[AI Analysis] Transcript length: ${transcript.length} characters`);

        // Generate summary using Gemini (with video metadata and comments)
        const summary = await summarizeTranscript(transcript, videoWithScore, comments);

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
            message: `AI 분석에 실패했습니다. (${error.message})`
        }, { status: 500 });
    }
}
