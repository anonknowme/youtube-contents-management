'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { filterByVideoType } from '@/lib/shortsDetection';
import { formatNumber } from '@/lib/formatNumber';
import { AvatarButton } from '@/components/ui/AvatarButton';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MediaCard } from '@/components/ui/MediaCard';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { useTheme } from '@/app/providers/ThemeProvider';

export default function Home() {
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const [channelId, setChannelId] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('로딩 중...');
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState<'viral_high' | 'viral_low' | 'latest'>('viral_high');
    const [allowedChannels, setAllowedChannels] = useState<any[]>([]);
    const [videoType, setVideoType] = useState<'all' | 'regular' | 'shorts'>('all');

    const searchSectionRef = useRef<HTMLDivElement>(null);

    // Restore state from sessionStorage on mount
    useEffect(() => {
        const savedState = sessionStorage.getItem('homePageState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                if (state.data) setData(state.data);
                if (state.channelId) setChannelId(state.channelId);
                if (state.sortBy) setSortBy(state.sortBy);
                if (state.videoType) setVideoType(state.videoType);
                // Clear the saved state after restoring
                sessionStorage.removeItem('homePageState');
            } catch (e) {
                console.error('Failed to restore state:', e);
            }
        }
    }, []);

    // 허용된 채널 목록 불러오기
    useEffect(() => {
        fetch('/api/channels/allowed')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setAllowedChannels(data.channels);
                }
            });
    }, []);

    const search = async (targetChannelId?: string) => {
        const idToSearch = targetChannelId || channelId;
        if (!idToSearch) return;

        setLoading(true);
        setError('');
        setLoadingMessage('🔍 채널 확인 중...');

        const timer1 = setTimeout(() => setLoadingMessage('⏳ 잠시만 기다려주세요...'), 3000);

        try {
            const res = await fetch(`/api/channel/${idToSearch}`);
            const json = await res.json();

            clearTimeout(timer1);

            if (json.success) {
                setData(json.data);

                if (json.isNewChannel) {
                    setLoadingMessage(`✅ 새 채널 분석 완료! (${json.data.videos.length}개 영상)`);
                } else if (json.synced) {
                    setLoadingMessage(`✅ 업데이트 완료! (${json.data.videos.length}개 영상)`);
                } else {
                    setLoadingMessage(`✅ 로드 완료! (${json.data.videos.length}개 영상)`);
                }
            } else {
                setError(json.error);
            }
        } catch (err) {
            clearTimeout(timer1);
            setError('오류 발생');
        } finally {
            setTimeout(() => setLoading(false), 500);
        }
    };

    return (
        <main style={{
            padding: '16px',
            maxWidth: '100%',
            minHeight: '100vh',
            backgroundColor: 'var(--bg-primary)',
            transition: 'background-color 0.3s ease'
        }}>
            {/* 헤더 */}
            <div style={{
                backgroundColor: 'var(--bg-secondary)',
                padding: '20px 16px',
                marginBottom: '16px',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-base)',
                position: 'relative'
            }}>
                {/* Theme Switcher */}
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '16px',
                    display: 'flex',
                    gap: '4px',
                    backgroundColor: 'var(--bg-tertiary)',
                    padding: '4px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)'
                }}>
                    {(['light', 'dark', 'cypherpunk'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTheme(t)}
                            style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: theme === t ? 'var(--accent-primary)' : 'transparent',
                                color: theme === t ? 'var(--text-inverse)' : 'var(--text-secondary)',
                                fontSize: '18px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            title={t}
                        >
                            {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '🕶️'}
                        </button>
                    ))}
                </div>

                <h1 style={{
                    fontSize: '28px',
                    margin: '0 0 8px 0',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.5px'
                }}>
                    유튜브 영상 바이럴 분석
                </h1>
                <p style={{
                    fontSize: '16px',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    fontWeight: 500
                }}>
                    잘 터진 오렌지필🍊💊영상! 데이터로 확인📊
                </p>
            </div>

            {/* 빠른 선택 */}
            {allowedChannels.length > 0 && (
                <div style={{
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '20px',
                    marginBottom: '16px',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-base)'
                }}>
                    <p style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginBottom: '16px',
                        color: 'var(--text-primary)'
                    }}>
                        빠른 선택
                    </p>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: '12px'
                    }}>
                        {allowedChannels.map(ch => (
                            <AvatarButton
                                key={ch.id}
                                src={ch.thumbnail_url}
                                alt={ch.name}
                                label={ch.name}
                                subtitle={ch.subscriber_count ? `구독자 ${formatNumber(ch.subscriber_count)}` : undefined}
                                onClick={() => {
                                    if (!loading) {
                                        search(ch.id);
                                        // Scroll to search section
                                        setTimeout(() => {
                                            searchSectionRef.current?.scrollIntoView({
                                                behavior: 'smooth',
                                                block: 'start'
                                            });
                                        }, 100);
                                    }
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* 검색 */}
            <div
                ref={searchSectionRef}
                style={{
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '20px',
                    marginBottom: '16px',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-base)'
                }}>
                <Input
                    type="text"
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    placeholder="또는 채널 ID 직접 입력"
                    disabled={loading}
                    onKeyPress={(e) => e.key === 'Enter' && !loading && search()}
                />
                <Button
                    onClick={() => search()}
                    disabled={loading}
                    style={{ marginTop: '12px', width: '100%' }}
                >
                    {loading ? loadingMessage : '검색'}
                </Button>

                {/* Loading skeleton - ensures page has enough height and shows loading state */}
                {loading && !data && (
                    <div style={{
                        marginTop: '24px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '16px'
                    }}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                )}
            </div>

            {/* 에러 */}
            {error && (
                <div style={{
                    backgroundColor: '#fee',
                    color: '#c00',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '16px',
                    fontSize: '14px'
                }}>
                    {error}
                </div>
            )}

            {/* 결과 */}
            {data && (
                <>
                    {/* 채널 정보 */}
                    <Card>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                            <Avatar
                                src={data.channel.thumbnail_url}
                                alt={data.channel.title}
                                size="lg"
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{
                                    fontSize: '18px',
                                    margin: '0 0 12px 0',
                                    fontWeight: 'bold',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    color: 'var(--text-primary)'
                                }}>
                                    {data.channel.title}
                                </h3>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '12px',
                                    fontSize: '14px',
                                    color: 'var(--text-secondary)'
                                }}>
                                    <div>👥 {formatNumber(parseInt(data.channel.subscriber_count || '0'))}</div>
                                    <div>🎬 {data.channel.video_count}개</div>
                                    <div>👁️ {formatNumber(parseInt(data.channel.view_count || '0'))}</div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* 필터 */}
                    <Card>
                        <p style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            marginBottom: '16px',
                            color: 'var(--text-primary)'
                        }}>
                            영상 목록 ({filterByVideoType(data.videos || [], videoType).length}개)
                        </p>

                        {/* 타입 필터 */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '8px',
                            marginBottom: '16px'
                        }}>
                            <Button
                                variant={videoType === 'all' ? 'primary' : 'secondary'}
                                onClick={() => setVideoType('all')}
                                style={{ width: '100%' }}
                            >
                                전체
                            </Button>
                            <Button
                                variant={videoType === 'regular' ? 'primary' : 'secondary'}
                                onClick={() => setVideoType('regular')}
                                style={{ width: '100%' }}
                            >
                                📹 일반
                            </Button>
                            <Button
                                variant={videoType === 'shorts' ? 'primary' : 'secondary'}
                                onClick={() => setVideoType('shorts')}
                                style={{ width: '100%' }}
                            >
                                🎬 Shorts
                            </Button>
                        </div>

                        {/* 정렬 */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '8px'
                        }}>
                            <Button
                                variant={sortBy === 'viral_high' ? 'primary' : 'secondary'}
                                onClick={() => setSortBy('viral_high')}
                                style={{ width: '100%' }}
                            >
                                🔥 높음
                            </Button>
                            <Button
                                variant={sortBy === 'viral_low' ? 'primary' : 'secondary'}
                                onClick={() => setSortBy('viral_low')}
                                style={{ width: '100%' }}
                            >
                                📉 낮음
                            </Button>
                            <Button
                                variant={sortBy === 'latest' ? 'primary' : 'secondary'}
                                onClick={() => setSortBy('latest')}
                                style={{ width: '100%' }}
                            >
                                📅 최신
                            </Button>
                        </div>
                    </Card>

                    {/* 영상 목록 */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '20px'
                    }}>
                        {(() => {
                            // 타입 필터링
                            let filteredVideos = filterByVideoType(data.videos || [], videoType);

                            if (sortBy === 'viral_high') {
                                filteredVideos.sort((a, b) => (b.viral_score || 0) - (a.viral_score || 0));
                            } else if (sortBy === 'viral_low') {
                                filteredVideos.sort((a, b) => (a.viral_score || 0) - (b.viral_score || 0));
                            } else if (sortBy === 'latest') {
                                filteredVideos.sort((a, b) => {
                                    const dateA = new Date(a.published_at || 0).getTime();
                                    const dateB = new Date(b.published_at || 0).getTime();
                                    return dateB - dateA;
                                });
                            }

                            return filteredVideos.map((video: any) => (
                                <div key={video.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <MediaCard
                                        thumbnailUrl={video.thumbnail_url}
                                        title={video.title}
                                        channelName={data.channel.title}
                                        viewCount={formatNumber(video.view_count)}
                                        likeCount={formatNumber(video.like_count)}
                                        commentCount={formatNumber(video.comment_count)}
                                        publishedAt={new Date(video.published_at).toLocaleDateString('ko-KR')}
                                        viralScore={video.viral_score}
                                    />
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Button
                                            variant="secondary"
                                            onClick={() => window.open(video.url, '_blank')}
                                            style={{ flex: 1 }}
                                        >
                                            영상 보기
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                // Save state before navigating
                                                sessionStorage.setItem('homePageState', JSON.stringify({
                                                    data,
                                                    channelId,
                                                    sortBy,
                                                    videoType
                                                }));
                                                router.push(`/video/${video.video_id}`);
                                            }}
                                            style={{ flex: 1 }}
                                        >
                                            📊 상세 분석
                                        </Button>
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </>
            )}
        </main>
    );
}
