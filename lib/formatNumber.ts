/**
 * 숫자를 한국어 형식으로 표현
 */

/**
 * 숫자를 적절한 단위로 변환
 * 
 * 예시:
 * - 50 → "50"
 * - 500 → "500"
 * - 5000 → "5천"
 * - 50000 → "5만"
 * - 500000 → "50만"
 * - 5000000 → "500만"
 * - 50000000 → "5천만"
 */
export function formatNumber(num: number): string {
    if (num < 1000) {
        return num.toString();
    }

    if (num < 10000) {
        // 1,000 ~ 9,999: "N천"
        const thousands = Math.floor(num / 1000);
        const remainder = num % 1000;
        if (remainder === 0) {
            return `${thousands}천`;
        }
        // 5,500 → "5.5천"
        return `${(num / 1000).toFixed(1)}천`;
    }

    // 10,000 이상: "N만"
    const manValue = num / 10000;
    if (manValue >= 10) {
        return `${Math.floor(manValue)}만`;
    }
    return `${manValue.toFixed(1)}만`;
}

/**
 * 조회수 포맷
 */
export function formatViewCount(count: number): string {
    return formatNumber(count);
}

/**
 * 좋아요 수 포맷
 */
export function formatLikeCount(count: number): string {
    return formatNumber(count);
}

/**
 * 구독자 수 포맷
 */
export function formatSubscriberCount(count: number): string {
    return formatNumber(count);
}
