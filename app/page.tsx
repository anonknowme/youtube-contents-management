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
import { VideoDetailView } from '@/components/video/VideoDetailView';
import { LightningDonateButton } from '@/components/ui/LightningDonateButton';

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
    const [syncRequiredChannelId, setSyncRequiredChannelId] = useState<string | null>(null);
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'maxi' | 'general'>('maxi');

    const searchSectionRef = useRef<HTMLDivElement>(null);

    // Handle browser back button to close modal
    useEffect(() => {
        const handlePopState = () => {
            // If URL is root, close modal
            if (window.location.pathname === '/') {
                setSelectedVideoId(null);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Function to open video detail overlay
    const openVideoDetail = (videoId: string) => {
        setSelectedVideoId(videoId);
        // Change URL without navigation
        window.history.pushState({ videoId }, '', `/video/${videoId}`);
    };

    // Function to close video detail overlay
    const closeVideoDetail = () => {
        setSelectedVideoId(null);
        // Revert URL
        window.history.pushState(null, '', '/');
    };


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
        setLoading(true);
        setError('');
        setSyncRequiredChannelId(null);
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
                if (res.status === 404) {
                    setSyncRequiredChannelId(idToSearch);
                    setError('아직 분석되지 않은 채널입니다.');
                } else {
                    setError(json.error);
                }
            }
        } catch (err) {
            clearTimeout(timer1);
            setError('오류 발생');
        } finally {
            if (!syncRequiredChannelId) {
                setTimeout(() => setLoading(false), 500);
            } else {
                setLoading(false);
            }
        }
    };

    const handleSync = async () => {
        if (!syncRequiredChannelId) return;

        setLoading(true);
        setLoadingMessage('📡 YouTube에서 데이터 가져오는 중...');
        setError('');

        try {
            // maxVideos=0으로 설정하여 모든 영상 가져오기
            const res = await fetch(`/api/sync/channel?channelId=${syncRequiredChannelId}&maxVideos=0`, {
                method: 'POST'
            });
            const json = await res.json();

            if (json.success) {
                setLoadingMessage('✅ 동기화 완료! 분석을 시작합니다...');
                // 동기화 성공 후 약간의 딜레이 후 재검색
                setTimeout(() => {
                    search(syncRequiredChannelId);
                }, 1000);
            } else {
                setError(json.error || '동기화 실패');
                setLoading(false);
            }
        } catch (e) {
            setError('동기화 중 오류 발생');
            setLoading(false);
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
                <h1 style={{
                    fontSize: '28px',
                    margin: '0 0 8px 0',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.5px',
                    lineHeight: 1.2
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
            <div style={{
                backgroundColor: 'var(--bg-secondary)',
                padding: '20px',
                marginBottom: '16px',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-base)'
            }}>
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '16px'
                }}>
                    <Button
                        variant={activeTab === 'maxi' ? 'primary' : 'secondary'}
                        onClick={() => setActiveTab('maxi')}
                        style={{ fontSize: '14px', flex: 1, height: '40px' }}
                    >
                        비트맥시 전용 💊
                    </Button>
                    <Button
                        variant={activeTab === 'general' ? 'primary' : 'secondary'}
                        onClick={() => setActiveTab('general')}
                        style={{ fontSize: '14px', flex: 1, height: '40px' }}
                    >
                        일반 채널 📺
                    </Button>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '12px'
                }}>
                    {allowedChannels
                        .filter(ch => activeTab === 'maxi' ? ch.is_allowed : !ch.is_allowed)
                        .map(ch => {
                            return (
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
                            );
                        })}
                    {allowedChannels.filter(ch => activeTab === 'maxi' ? ch.is_allowed : !ch.is_allowed).length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '20px',
                            color: 'var(--text-tertiary)',
                            fontSize: '14px'
                        }}>
                            {activeTab === 'maxi' ? '등록된 맥시 채널이 없습니다.' : '등록된 일반 채널이 없습니다.'}
                        </div>
                    )}
                </div>
            </div>

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
                    placeholder="채널 ID 직접 입력"
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

            {/* 동기화 버튼 (데이터 없음 에러 시 표시) */}
            {syncRequiredChannelId && !loading && (
                <div style={{ marginBottom: '16px' }}>
                    <Button
                        onClick={handleSync}
                        style={{
                            width: '100%',
                            padding: '16px',
                            fontSize: '16px',
                            background: 'var(--accent-primary)', // 강조색
                            animation: 'pulse 2s infinite'
                        }}
                    >
                        ✨ 이 채널 분석 시작하기
                    </Button>
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
                                    <div style={{ whiteSpace: 'nowrap' }}>👥 {formatNumber(parseInt(data.channel.subscriber_count || '0'))}</div>
                                    <div style={{ whiteSpace: 'nowrap' }}>🎬 {data.channel.video_count}개</div>
                                    <div style={{ whiteSpace: 'nowrap' }}>👁️ {formatNumber(parseInt(data.channel.view_count || '0'))}</div>
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
                            // 1. 현재 채널이 '일반 채널'인지 확인 (Config에 없는 채널)
                            const isAllowedChannel = allowedChannels.find(ch => ch.id === data.channel.channel_id)?.is_allowed;
                            const isProd = process.env.NODE_ENV === 'production';
                            const isRestricted = !isAllowedChannel && isProd;

                            // 2. 타입 필터링
                            let filteredVideos = filterByVideoType(data.videos || [], videoType);

                            // 3. 정렬 로직
                            if (isRestricted) {
                                // 제한된 모드(일반채널+PROD)에서는 '자막 있는 영상'을 최상단으로 + 그 안에서 바이럴/날짜 정렬
                                filteredVideos.sort((a, b) => {
                                    const aHasTranscript = a.transcript_status === 'available';
                                    const bHasTranscript = b.transcript_status === 'available';

                                    if (aHasTranscript && !bHasTranscript) return -1;
                                    if (!aHasTranscript && bHasTranscript) return 1;

                                    // 자막 유무가 같으면 기존 정렬 기준 따름
                                    if (sortBy === 'viral_high') return (b.viral_score || 0) - (a.viral_score || 0);
                                    if (sortBy === 'viral_low') return (a.viral_score || 0) - (b.viral_score || 0);
                                    if (sortBy === 'latest') return new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime();
                                    return 0;
                                });
                            } else {
                                // 기존 정렬
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
                            }

                            return filteredVideos.map((video: any) => {
                                const hasTranscript = video.transcript_status === 'available';
                                const disableDetail = isRestricted && !hasTranscript;

                                return (
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
                                            style={disableDetail ? { opacity: 0.4 } : undefined}
                                            onClick={disableDetail ? undefined : () => openVideoDetail(video.video_id)}
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
                                                onClick={() => openVideoDetail(video.video_id)}
                                                style={{ flex: 1 }}
                                                disabled={disableDetail}
                                                variant={disableDetail ? 'secondary' : 'primary'}
                                            >
                                                {disableDetail ? '🚧 준비중' : '📊 상세 분석'}
                                            </Button>
                                        </div>
                                    </div>
                                )
                            });
                        })()}
                    </div>
                </>
            )}
            {/* Video Detail Overlay */}
            {selectedVideoId && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    display: 'flex',
                    justifyContent: 'center',
                    pointerEvents: 'auto'
                }} onClick={closeVideoDetail}>
                    <div style={{
                        backgroundColor: 'var(--bg-primary)',
                        width: '100%',
                        maxWidth: '900px',
                        height: '100%',
                        overflowY: 'auto',
                        boxShadow: '-4px 0 16px rgba(0,0,0,0.1)',
                        animation: 'slideIn 0.3s ease-out'
                    }} onClick={e => e.stopPropagation()}>
                        <VideoDetailView
                            videoId={selectedVideoId}
                            onBack={closeVideoDetail}
                        />
                    </div>
                </div>
            )}

            {/* Floating Lightning Donate Button */}
            <div style={{
                position: 'fixed',
                bottom: '24px',
                left: '24px',
                zIndex: 1000
            }}>
                <LightningDonateButton variant="icon" />
            </div>
        </main>
    );
}
