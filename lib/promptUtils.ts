/**
 * AI 분석 프롬프트 생성 유틸리티
 * VideoDetailView와 Gemini API에서 동일한 프롬프트를 사용하도록 중앙화
 */

interface VideoData {
    title: string;
    video_id: string;
    thumbnail_url?: string;
    viral_score?: number;
    view_count: number;
    like_count: number;
    comment_count: number;
}

// Helper function to format numbers
function formatNumber(num: number): string {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}만`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}천`;
    return num.toString();
}

/**
 * AI 분석용 프롬프트 생성
 */
export function generateAnalysisPrompt(video: VideoData, transcript: string): string {
    return `
<심층 분석 요청>
아래의 [영상 정보], [성과 분석], [초반 스크립트 (1분/300자)], [전체 스크립트] 내용을 바탕으로 이 영상의 좋은(혹은 나쁜) 성과의 원인을 심층 분석해주세요.

바이럴 점수는 비슷한 시기에 올렸던 다른 영상대비 조회수가 얼마나 잘 나왔는지를 평가하는 점수입니다. 100점 근방이면 중립이고, 이보다 높으면 바이럴이 잘된 케이스, 낮으면 잘 안된 케이스입니다.

특히 다음 점을 고려하세요.
- [초반 스크립트 (1분/300자)]와 같은 황금같은 시간을 잘 활용했는지, 혹은 쓸데없는 말을 하느라 낭비하진 않았는지도 평가해주세요.
- 당신은 영상을 보고 판단하고 있지 않습니다. 따라서 영상이 이랬을것이다, 배경음악이 이랬을 것이다와 같은 시청각자료에 대해 가타부타하는 분석은 말이 안되는 분석임을 인지하세요.

분석은 다음 5가지 항목으로 정리해 주세요:
1. 🎯 후킹 포인트 (Hook): 초반부 스크립트에서 시청자를 사로잡은(혹은 사로잡지 못한) 요소
2. 🔥 바이럴 요인 (Viral Factor): 스크립트 구조와 성과 지표(조회수/좋아요/댓글수)를 기반으로 한 인기(혹은 비인기) 비결
3. 📎 바이럴이 잘된 영상이라면 그럼에도 부족했던 점을, 잘 안된 영상이라면 그럼에도 잘했던 점
4. 💡 벤치마킹 포인트: 비슷한 영상을 제작할 때 참고할 점
5. 📝 분석의 핵심 3줄 요약

[영상 정보]
📝제목: ${video.title}
🔗링크: https://www.youtube.com/watch?v=${video.video_id}
🖼썸네일: ${video.thumbnail_url || ''}

[성과 분석]
💯바이럴 점수: ${(video.viral_score || 0).toFixed(0)}점
👀조회수: ${formatNumber(video.view_count)}회
👍좋아요: ${formatNumber(video.like_count)} (조회수 대비 ${video.view_count > 0 ? (video.like_count / video.view_count * 100).toFixed(1) : '0.0'}%)
💬댓글수: ${formatNumber(video.comment_count)} (조회수 대비 ${video.view_count > 0 ? (video.comment_count / video.view_count * 100).toFixed(1) : '0.0'}%)

[초반 스크립트 (1분/300자)]
${transcript.substring(0, 300)}...

[전체 스크립트]
${transcript}
    `.trim();
}
