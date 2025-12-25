/**
 * 바이럴 점수 계산 전략들
 * 
 * 여러 가지 방법으로 바이럴 점수를 계산할 수 있습니다.
 * 필요에 따라 추가하거나 교체할 수 있도록 설계되었습니다.
 */

export interface Video {
    id: string;
    view_count: number;
    like_count: number;
    comment_count: number;
    published_at: string;
    [key: string]: any;
}

export interface ViralScoreResult {
    viral_score: number;
    method: string;
    details?: any;
}

/**
 * 방법 1: 구독자 수 대비 (vs_subscribers)
 * 조회수 / 구독자 수 × 100
 * 
 * 장점: 간단, 직관적
 * 단점: 시간에 따른 왜곡 (과거 영상 불리)
 */
export function calculateVsSubscribers(
    video: Video,
    subscriberCount: number
): ViralScoreResult {
    const score = subscriberCount > 0
        ? (video.view_count / subscriberCount) * 100
        : 0;

    return {
        viral_score: score,
        method: 'vs_subscribers',
        details: { subscriberCount },
    };
}

/**
 * 방법 2: 채널 평균 대비 (vs_channel_avg)
 * 조회수 / 채널 전체 평균 조회수 × 100
 * 
 * 장점: 채널 특성 반영, 시간 왜곡 적음
 * 단점: 채널 성장 단계 무시
 */
export function calculateVsChannelAvg(
    video: Video,
    allVideos: Video[]
): ViralScoreResult {
    const avgViews = allVideos.reduce((sum, v) => sum + v.view_count, 0) / allVideos.length;
    const score = avgViews > 0 ? (video.view_count / avgViews) * 100 : 0;

    return {
        viral_score: score,
        method: 'vs_channel_avg',
        details: { channelAvg: avgViews },
    };
}

/**
 * 방법 3: 앞뒤 N개 영상 평균 대비 (vs_neighbor_avg) ⭐ 추천
 * 조회수 / 앞뒤 N개 영상 평균 × 100
 * 
 * 장점: 시간 맥락 반영, 채널 성장 단계 고려
 * 단점: 초기/최신 영상은 샘플 부족
 */
export function calculateVsNeighborAvg(
    video: Video,
    allVideos: Video[],
    windowSize: number = 10
): ViralScoreResult {
    // 시간순 정렬
    const sorted = [...allVideos].sort((a, b) =>
        new Date(a.published_at).getTime() - new Date(b.published_at).getTime()
    );

    const currentIndex = sorted.findIndex(v => v.id === video.id);

    if (currentIndex === -1) {
        return { viral_score: 0, method: 'vs_neighbor_avg', details: { error: 'Video not found' } };
    }

    // 앞뒤 windowSize 개 선택
    const startIdx = Math.max(0, currentIndex - windowSize);
    const endIdx = Math.min(sorted.length, currentIndex + windowSize + 1);
    const neighbors = sorted.slice(startIdx, endIdx).filter(v => v.id !== video.id);

    // 최소 샘플 수 체크
    if (neighbors.length < 3) {
        // 샘플이 너무 적으면 전체 평균 사용
        return calculateVsChannelAvg(video, allVideos);
    }

    const avgViews = neighbors.reduce((sum, v) => sum + v.view_count, 0) / neighbors.length;
    const score = avgViews > 0 ? (video.view_count / avgViews) * 100 : 0;

    return {
        viral_score: score,
        method: 'vs_neighbor_avg',
        details: {
            neighborAvg: avgViews,
            neighborCount: neighbors.length,
            windowSize,
        },
    };
}

/**
 * 방법 4: 백분위 순위 (vs_percentile)
 * 채널 내 상위 몇 %인지 계산
 * 
 * 장점: 직관적, 상대적 비교 쉬움
 * 단점: 절대적 수치 없음
 */
export function calculateVsPercentile(
    video: Video,
    allVideos: Video[]
): ViralScoreResult {
    const sorted = [...allVideos].sort((a, b) => b.view_count - a.view_count);
    const rank = sorted.findIndex(v => v.id === video.id) + 1;
    const percentile = ((allVideos.length - rank + 1) / allVideos.length) * 100;

    return {
        viral_score: percentile,
        method: 'vs_percentile',
        details: {
            rank,
            totalVideos: allVideos.length,
        },
    };
}

/**
 * 통합 계산 함수
 * 원하는 방법으로 바이럴 점수 계산
 */
export function calculateViralScore(
    video: Video,
    allVideos: Video[],
    method: 'vs_subscribers' | 'vs_channel_avg' | 'vs_neighbor_avg' | 'vs_percentile' = 'vs_neighbor_avg',
    subscriberCount?: number
): ViralScoreResult {
    switch (method) {
        case 'vs_subscribers':
            if (!subscriberCount) throw new Error('subscriberCount required for vs_subscribers');
            return calculateVsSubscribers(video, subscriberCount);

        case 'vs_channel_avg':
            return calculateVsChannelAvg(video, allVideos);

        case 'vs_neighbor_avg':
            return calculateVsNeighborAvg(video, allVideos);

        case 'vs_percentile':
            return calculateVsPercentile(video, allVideos);

        default:
            return calculateVsNeighborAvg(video, allVideos);
    }
}

/**
 * 모든 영상에 대해 바이럴 점수 계산
 */
export function calculateViralScores(
    videos: Video[],
    method: 'vs_subscribers' | 'vs_channel_avg' | 'vs_neighbor_avg' | 'vs_percentile' = 'vs_neighbor_avg',
    subscriberCount?: number
) {
    return videos.map(video => {
        const result = calculateViralScore(video, videos, method, subscriberCount);
        return {
            ...video,
            viral_score: result.viral_score,
            viral_method: result.method,
            viral_details: result.details,
        };
    });
}
