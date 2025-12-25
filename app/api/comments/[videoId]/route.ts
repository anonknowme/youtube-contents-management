import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const youtube = google.youtube('v3');

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ videoId: string }> }
) {
    const { videoId } = await params;
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        return NextResponse.json({
            success: false,
            error: 'YOUTUBE_API_KEY is not configured'
        }, { status: 500 });
    }

    try {
        console.log(`[Comments] Fetching comments for ${videoId}...`);

        const response = await youtube.commentThreads.list({
            key: apiKey,
            part: ['snippet'],
            videoId: videoId,
            maxResults: 30, // Analyze top 30 comments
            order: 'relevance', // Get most relevant comments
            textFormat: 'plainText'
        });

        const comments = response.data.items?.map(item => ({
            id: item.id,
            author: item.snippet?.topLevelComment?.snippet?.authorDisplayName,
            text: item.snippet?.topLevelComment?.snippet?.textDisplay,
            likeCount: item.snippet?.topLevelComment?.snippet?.likeCount,
            publishedAt: item.snippet?.topLevelComment?.snippet?.publishedAt
        })) || [];

        console.log(`[Comments] Successfully fetched ${comments.length} comments`);

        return NextResponse.json({
            success: true,
            data: {
                videoId,
                comments
            }
        });

    } catch (error: any) {
        console.error('[Comments] Fetch error:', error);

        // Handle disabled comments or other API errors gracefully
        if (error.code === 403 && error.errors?.[0]?.reason === 'commentsDisabled') {
            return NextResponse.json({
                success: true,
                data: {
                    videoId,
                    comments: [],
                    message: "Comments are disabled for this video"
                }
            });
        }

        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to fetch comments'
        }, { status: 500 });
    }
}
