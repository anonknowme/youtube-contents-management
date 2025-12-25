import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Analyze video transcript and comments using Gemini AI
 */
export async function summarizeTranscript(transcript: string, comments: any[] = []): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    // Get the generative model (using gemini-2.5-flash-lite)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    // Format comments for the prompt
    const commentsText = comments.length > 0
        ? comments.map(c => `- ${c.author}: ${c.text} (👍 ${c.likeCount})`).join('\n')
        : "댓글이 없거나 댓글 사용이 중지된 영상입니다.";

    // Create prompt for viral analysis
    const prompt = `다음은 유튜브 영상의 자막과 시청자 댓글입니다. 
이 영상이 왜 인기 있는지 심층 분석하고, 핵심 인사이트를 도출해주세요.

다음 4가지 항목으로 나누어 분석해주세요:

1. 🎯 후킹 포인트 (Hook)
   - 초반 30초 등 시청자를 사로잡은 연출이나 멘트

2. 🔥 인기 비결 (Viral Factor)
   - 시청 지속 시간을 늘린 스토리텔링, 편집, 소재의 매력

3. 🗣️ 시청자 여론 (Viewer Reaction)
   - 댓글에서 가장 많이 언급되는 키워드나 반응
   - 시청자들이 공감하거나 논쟁하는 포인트

4. 📝 3줄 요약 (Summary)
   - 영상의 핵심 내용

형식은 반드시 이모지를 포함하여 가독성 있게 작성해주세요.

---
[자막]
${transcript.substring(0, 15000)} ... (생략)

[댓글 데이터 (상위 ${comments.length}개)]
${commentsText}
---`;

    // Generate summary
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return summary;
}
