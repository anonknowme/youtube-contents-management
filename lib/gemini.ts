import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateAnalysisPrompt } from './promptUtils';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Analyze video transcript and comments using Gemini AI
 */
export async function summarizeTranscript(
    transcript: string,
    video: {
        title: string;
        video_id: string;
        thumbnail_url?: string;
        viral_score?: number;
        view_count: number;
        like_count: number;
        comment_count: number;
    },
    comments: any[] = []
): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    // Get the generative model (using gemini-2.5-flash-lite)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    // Generate prompt using centralized function
    const prompt = generateAnalysisPrompt(video, transcript);

    // Generate summary
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return summary;
}
