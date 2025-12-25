/**
 * YouTube Shorts 판단 헬퍼 함수
 */

export interface VideoData {
    duration_seconds: number;
    thumbnail_url: string;
    viral_score?: number;
    published_at?: string;
    [key: string]: any;
}

/**
 * 영상이 Shorts인지 판단
 * 
 * 기준:
 * 1. 60초 이하 → 무조건 Shorts
 * 2. 60~180초 + 썸네일 없음 → Shorts
 * 3. 180초 초과 → 일반 영상
 * 
 * @param video - 영상 데이터
 * @returns Shorts 여부
 */
export function isShorts(video: VideoData): boolean {
    // 1분 이하는 무조건 Shorts
    if (video.duration_seconds <= 60) {
        return true;
    }

    // 3분 이하면서 썸네일이 없거나 기본 썸네일인 경우
    if (video.duration_seconds <= 180) {
        // 썸네일이 없거나 빈 문자열
        if (!video.thumbnail_url || video.thumbnail_url.trim() === '') {
            return true;
        }

        // YouTube Shorts는 세로형이라 썸네일 URL 패턴이 다를 수 있음
        // 예: 'vi_webp' 같은 자동 생성 썸네일
        // 또는 기본 썸네일 URL 패턴
        const url = video.thumbnail_url.toLowerCase();

        // 기본 썸네일 패턴들
        const defaultPatterns = [
            'default.jpg',
            'hqdefault.jpg',
            'mqdefault.jpg',
            'sddefault.jpg',
            'maxresdefault.jpg'
        ];

        // URL이 기본 패턴만 포함하는 경우 (커스텀 썸네일이 없음)
        const hasCustomThumbnail = !defaultPatterns.some(pattern =>
            url.includes(pattern) || url.endsWith(pattern)
        );

        // 기본 썸네일이면 Shorts일 가능성 높음
        if (!hasCustomThumbnail) {
            return true;
        }
    }

    // 3분 초과하거나 커스텀 썸네일 있으면 일반 영상
    return false;
}

/**
 * 영상 타입 필터링
 * 
 * @param videos - 영상 목록
 * @param type - 필터 타입 ('all' | 'regular' | 'shorts')
 * @returns 필터링된 영상 목록
 */
export function filterByVideoType<T extends VideoData>(
    videos: T[],
    type: 'all' | 'regular' | 'shorts'
): T[] {
    if (type === 'all') {
        return videos;
    }

    if (type === 'shorts') {
        return videos.filter(v => isShorts(v));
    }

    // regular
    return videos.filter(v => !isShorts(v));
}
