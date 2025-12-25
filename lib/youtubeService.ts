/**
 * YouTube Data API v3 서비스 - 페이지네이션 지원
 * 
 * 이 파일은 YouTube API와 통신하는 모든 함수를 담고 있습니다.
 * Python의 requests 라이브러리와 비슷하게 생각하시면 됩니다!
 */

// 타입 정의 (TypeScript의 장점!)
export interface YouTubeChannel {
    id: string;
    title: string;
    description: string;
    customUrl: string;
    subscriberCount: string;
    videoCount: string;
    viewCount: string;
    thumbnails: {
        default: string;
        medium: string;
        high: string;
    };
}

export interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    publishedAt: string;
    channelId: string;
    channelTitle: string;
    // 썸네일 정보
    thumbnails: {
        default: string;
        medium: string;
        high: string;
        standard?: string;
        maxres?: string;
    };
    // 통계 정보
    statistics: {
        viewCount: string;
        likeCount: string;
        commentCount: string;
        favoriteCount?: string;
    };
    // 콘텐츠 세부 정보
    contentDetails: {
        duration: string;           // ISO 8601 형식 (예: PT15M51S = 15분 51초)
        durationSeconds: number;    // 초 단위로 변환된 값
        definition: string;         // 'hd' 또는 'sd'
        caption: string;            // 자막 여부
    };
    // 편의를 위한 추가 필드
    url: string;                  // 영상 URL
    embedUrl: string;             // 임베드 URL
}

/**
 * 채널 ID로 채널 정보 가져오기
 * 
 * @param channelId - YouTube 채널 ID (예: "UCX6OQ3DkcsbYNE6H8uQQuVA")
 * @returns 채널 정보 객체
 */
export async function getChannelInfo(channelId: string): Promise<YouTubeChannel> {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        throw new Error('YOUTUBE_API_KEY가 환경 변수에 설정되지 않았습니다!');
    }

    // API URL 구성
    const url = new URL('https://www.googleapis.com/youtube/v3/channels');
    url.searchParams.append('part', 'snippet,statistics');
    url.searchParams.append('id', channelId);
    url.searchParams.append('key', apiKey);

    console.log('🔍 YouTube API 호출:', url.toString());

    // API 호출 (Python의 requests.get()과 비슷!)
    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error(`YouTube API 에러: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // 데이터가 없는 경우
    if (!data.items || data.items.length === 0) {
        throw new Error('채널을 찾을 수 없습니다!');
    }

    const channel = data.items[0];

    // 필요한 데이터만 추출해서 반환
    return {
        id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        customUrl: channel.snippet.customUrl || '',
        subscriberCount: channel.statistics.subscriberCount,
        videoCount: channel.statistics.videoCount,
        viewCount: channel.statistics.viewCount,
        thumbnails: {
            default: channel.snippet.thumbnails.default.url,
            medium: channel.snippet.thumbnails.medium.url,
            high: channel.snippet.thumbnails.high.url,
        },
    };
}

/**
 * ISO 8601 재생시간을 초 단위로 변환
 * 
 * @param duration - ISO 8601 형식 (예: "PT15M51S", "PT1H2M30S")
 * @returns 초 단위 시간
 * 
 * 예시:
 * - PT15M51S → 951초 (15분 51초)
 * - PT1H2M30S → 3750초 (1시간 2분 30초)
 * - PT45S → 45초
 */
function parseDuration(duration: string): number {
    // PT1H2M30S 형식 파싱
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    if (!match) return 0;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    return hours * 3600 + minutes * 60 + seconds;
}

/**
 * 채널의 영상 목록 가져오기 (페이지네이션 지원)
 * 
 * @param channelId - YouTube 채널 ID
 * @param maxResults - 가져올 최대 영상 개수 (0 = 전체, 기본: 50)
 * @param onProgress - 진행 상황 콜백 (선택사항)
 * @returns 영상 목록 배열
 */
export async function getChannelVideos(
    channelId: string,
    maxResults: number = 50,
    onProgress?: (current: number, total: number) => void
): Promise<YouTubeVideo[]> {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        throw new Error('YOUTUBE_API_KEY가 환경 변수에 설정되지 않았습니다!');
    }

    console.log(`📺 영상 가져오기 시작: ${maxResults === 0 ? '전체' : maxResults + '개'}`);

    // Step 1: 채널의 업로드 재생목록 ID 가져오기
    const channelUrl = new URL('https://www.googleapis.com/youtube/v3/channels');
    channelUrl.searchParams.append('part', 'contentDetails');
    channelUrl.searchParams.append('id', channelId);
    channelUrl.searchParams.append('key', apiKey);

    const channelResponse = await fetch(channelUrl.toString());
    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
        throw new Error('채널을 찾을 수 없습니다!');
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // Step 2: 페이지네이션으로 모든 영상 ID 수집
    const allVideoIds: string[] = [];
    let nextPageToken: string | undefined = undefined;
    let pageCount = 0;

    do {
        const playlistUrl = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
        playlistUrl.searchParams.append('part', 'contentDetails');
        playlistUrl.searchParams.append('playlistId', uploadsPlaylistId);
        playlistUrl.searchParams.append('maxResults', '50'); // YouTube API 최대값
        playlistUrl.searchParams.append('key', apiKey);

        if (nextPageToken) {
            playlistUrl.searchParams.append('pageToken', nextPageToken);
        }

        const playlistResponse = await fetch(playlistUrl.toString());
        const playlistData = await playlistResponse.json();

        if (!playlistData.items) break;

        const videoIds = playlistData.items.map((item: any) => item.contentDetails.videoId);
        allVideoIds.push(...videoIds);

        pageCount++;
        console.log(`📄 페이지 ${pageCount}: ${videoIds.length}개 (총 ${allVideoIds.length}개)`);

        if (onProgress) {
            onProgress(allVideoIds.length, maxResults || allVideoIds.length);
        }

        nextPageToken = playlistData.nextPageToken;

        // maxResults가 0이 아니고, 원하는 개수를 충족했으면 중단
        if (maxResults > 0 && allVideoIds.length >= maxResults) {
            break;
        }

    } while (nextPageToken);

    // 요청한 개수만큼만 자르기
    const videoIdsToFetch = maxResults > 0
        ? allVideoIds.slice(0, maxResults)
        : allVideoIds;

    console.log(`✅ 총 ${videoIdsToFetch.length}개 영상 ID 수집 완료`);

    // Step 3: 영상 ID들로 상세 정보 가져오기 (50개씩 분할)
    const allVideos: YouTubeVideo[] = [];
    const batchSize = 50; // YouTube API는 한 번에 최대 50개

    for (let i = 0; i < videoIdsToFetch.length; i += batchSize) {
        const batch = videoIdsToFetch.slice(i, i + batchSize);

        const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
        videosUrl.searchParams.append('part', 'snippet,statistics,contentDetails');
        videosUrl.searchParams.append('id', batch.join(','));
        videosUrl.searchParams.append('key', apiKey);

        console.log(`🎬 영상 상세 정보 요청 (${i + 1}-${Math.min(i + batchSize, videoIdsToFetch.length)}/${videoIdsToFetch.length})`);

        const videosResponse = await fetch(videosUrl.toString());
        const videosData = await videosResponse.json();

        // 데이터 변환
        const videos = videosData.items.map((video: any) => {
            const duration = video.contentDetails.duration;
            const durationSeconds = parseDuration(duration);

            return {
                id: video.id,
                title: video.snippet.title,
                description: video.snippet.description,
                publishedAt: video.snippet.publishedAt,
                channelId: video.snippet.channelId,
                channelTitle: video.snippet.channelTitle,
                thumbnails: {
                    default: video.snippet.thumbnails.default?.url || '',
                    medium: video.snippet.thumbnails.medium?.url || '',
                    high: video.snippet.thumbnails.high?.url || '',
                    standard: video.snippet.thumbnails.standard?.url,
                    maxres: video.snippet.thumbnails.maxres?.url,
                },
                statistics: {
                    viewCount: video.statistics.viewCount || '0',
                    likeCount: video.statistics.likeCount || '0',
                    commentCount: video.statistics.commentCount || '0',
                    favoriteCount: video.statistics.favoriteCount || '0',
                },
                contentDetails: {
                    duration: duration,
                    durationSeconds: durationSeconds,
                    definition: video.contentDetails.definition,
                    caption: video.contentDetails.caption,
                },
                url: `https://www.youtube.com/watch?v=${video.id}`,
                embedUrl: `https://www.youtube.com/embed/${video.id}`,
            };
        });

        allVideos.push(...videos);
    }

    console.log(`✅ 총 ${allVideos.length}개 영상 상세 정보 수집 완료`);

    return allVideos;
}
