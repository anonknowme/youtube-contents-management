'use client';

import { useState, useEffect } from 'react';
import { filterByVideoType } from '@/lib/shortsDetection';
import { formatNumber } from '@/lib/formatNumber';

export default function Home() {
    const [channelId, setChannelId] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('로딩 중...');
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState<'viral_high' | 'viral_low' | 'latest'>('viral_high');
    const [allowedChannels, setAllowedChannels] = useState<any[]>([]);
    const [videoType, setVideoType] = useState<'all' | 'regular' | 'shorts'>('all');

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

    const search = async () => {
        if (!channelId) return;

        setLoading(true);
        setError('');
        setLoadingMessage('🔍 채널 확인 중...');

        const timer1 = setTimeout(() => setLoadingMessage('⏳ 잠시만 기다려주세요...'), 3000);

        try {
            const res = await fetch(`/api/channel/${channelId}`);
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
            backgroundColor: '#f5f5f5'
        }}>
            {/* 헤더 */}
            <div style={{
                backgroundColor: '#fff',
                padding: '20px 16px',
                marginBottom: '16px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{
                    fontSize: '24px',
                    margin: '0 0 8px 0',
                    fontWeight: 'bold'
                }}>
                    📊 YouTube 채널 분석
                </h1>
                <p style={{
                    fontSize: '14px',
                    color: '#666',
                    margin: 0
                }}>
                    채널의 바이럴 영상을 분석해보세요
                </p>
            </div>

            {/* 빠른 선택 */}
            {allowedChannels.length > 0 && (
                <div style={{
                    backgroundColor: '#fff',
                    padding: '16px',
                    marginBottom: '16px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <p style={{
                        fontSize: '13px',
                        fontWeight: 'bold',
                        marginBottom: '12px',
                        color: '#333'
                    }}>
                        빠른 선택
                    </p>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '8px'
                    }}>
                        {allowedChannels.map(ch => (
                            <button
                                key={ch.id}
                                onClick={() => setChannelId(ch.id)}
                                disabled={loading}
                                style={{
                                    padding: '12px 8px',
                                    fontSize: '14px',
                                    backgroundColor: channelId === ch.id ? '#0070f3' : '#f0f0f0',
                                    color: channelId === ch.id ? '#fff' : '#333',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontWeight: channelId === ch.id ? 'bold' : 'normal',
                                    transition: 'all 0.2s',
                                    opacity: loading ? 0.5 : 1
                                }}
                            >
                                {ch.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 검색 */}
            <div style={{
                backgroundColor: '#fff',
                padding: '16px',
                marginBottom: '16px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <input
                    type="text"
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    placeholder="또는 채널 ID 직접 입력"
                    disabled={loading}
                    style={{
                        padding: '14px',
                        fontSize: '16px',
                        width: '100%',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        boxSizing: 'border-box',
                        opacity: loading ? 0.5 : 1,
                        cursor: loading ? 'not-allowed' : 'text'
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && !loading && search()}
                />
                <button
                    onClick={search}
                    disabled={loading}
                    style={{
                        padding: '14px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        width: '100%',
                        backgroundColor: loading ? '#ccc' : '#0070f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                >
                    {loading ? loadingMessage : '검색'}
                </button>
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
                    <div style={{
                        backgroundColor: '#fff',
                        padding: '20px',
                        marginBottom: '16px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                            <img
                                src={data.channel.thumbnail_url}
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    flexShrink: 0
                                }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{
                                    fontSize: '18px',
                                    margin: '0 0 8px 0',
                                    fontWeight: 'bold',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {data.channel.title}
                                </h3>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '8px',
                                    fontSize: '12px',
                                    color: '#666'
                                }}>
                                    <div>👥 {formatNumber(parseInt(data.channel.subscriber_count || '0'))}</div>
                                    <div>🎬 {data.channel.video_count}개</div>
                                    <div>👁️ {formatNumber(parseInt(data.channel.view_count || '0'))}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 필터 */}
                    <div style={{
                        backgroundColor: '#fff',
                        padding: '16px',
                        marginBottom: '16px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <p style={{
                            fontSize: '14px',
                            fontWeight: 'bold',
                            marginBottom: '12px'
                        }}>
                            영상 목록 ({filterByVideoType(data.videos || [], videoType).length}개)
                        </p>

                        {/* 타입 필터 */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '6px',
                            marginBottom: '12px'
                        }}>
                            <button
                                onClick={() => setVideoType('all')}
                                style={{
                                    padding: '10px 8px',
                                    fontSize: '13px',
                                    backgroundColor: videoType === 'all' ? '#555' : '#f0f0f0',
                                    color: videoType === 'all' ? '#fff' : '#333',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: videoType === 'all' ? 'bold' : 'normal'
                                }}
                            >
                                전체
                            </button>
                            <button
                                onClick={() => setVideoType('regular')}
                                style={{
                                    padding: '10px 8px',
                                    fontSize: '13px',
                                    backgroundColor: videoType === 'regular' ? '#555' : '#f0f0f0',
                                    color: videoType === 'regular' ? '#fff' : '#333',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: videoType === 'regular' ? 'bold' : 'normal'
                                }}
                            >
                                📹 일반
                            </button>
                            <button
                                onClick={() => setVideoType('shorts')}
                                style={{
                                    padding: '10px 8px',
                                    fontSize: '13px',
                                    backgroundColor: videoType === 'shorts' ? '#555' : '#f0f0f0',
                                    color: videoType === 'shorts' ? '#fff' : '#333',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: videoType === 'shorts' ? 'bold' : 'normal'
                                }}
                            >
                                🎬 Shorts
                            </button>
                        </div>

                        {/* 정렬 */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '6px'
                        }}>
                            <button
                                onClick={() => setSortBy('viral_high')}
                                style={{
                                    padding: '10px 8px',
                                    fontSize: '12px',
                                    backgroundColor: sortBy === 'viral_high' ? '#0070f3' : '#f0f0f0',
                                    color: sortBy === 'viral_high' ? '#fff' : '#333',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: sortBy === 'viral_high' ? 'bold' : 'normal'
                                }}
                            >
                                🔥 높음
                            </button>
                            <button
                                onClick={() => setSortBy('viral_low')}
                                style={{
                                    padding: '10px 8px',
                                    fontSize: '12px',
                                    backgroundColor: sortBy === 'viral_low' ? '#0070f3' : '#f0f0f0',
                                    color: sortBy === 'viral_low' ? '#fff' : '#333',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: sortBy === 'viral_low' ? 'bold' : 'normal'
                                }}
                            >
                                📉 낮음
                            </button>
                            <button
                                onClick={() => setSortBy('latest')}
                                style={{
                                    padding: '10px 8px',
                                    fontSize: '12px',
                                    backgroundColor: sortBy === 'latest' ? '#0070f3' : '#f0f0f0',
                                    color: sortBy === 'latest' ? '#fff' : '#333',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: sortBy === 'latest' ? 'bold' : 'normal'
                                }}
                            >
                                📅 최신
                            </button>
                        </div>
                    </div>

                    {/* 영상 목록 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(() => {
                            // 타입 필터링 (새로운 헬퍼 함수 사용)
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
                                <div
                                    key={video.id}
                                    style={{
                                        backgroundColor: '#fff',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            src={video.thumbnail_url}
                                            style={{
                                                width: '100%',
                                                aspectRatio: '16/9',
                                                objectFit: 'cover',
                                                display: 'block'
                                            }}
                                        />
                                        {video.viral_score && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                backgroundColor: video.viral_score > 100 ? '#10b981' : '#ef4444',
                                                color: 'white',
                                                padding: '8px 12px',
                                                borderRadius: '8px',
                                                fontSize: '13px',
                                                fontWeight: 'bold',
                                                boxShadow: '0 3px 10px rgba(0,0,0,0.4)',
                                                lineHeight: '1.3',
                                                textAlign: 'center'
                                            }}>
                                                바이럴 점수<br />
                                                {video.viral_score.toFixed(0)}%
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ padding: '12px' }}>
                                        <h4 style={{
                                            fontSize: '14px',
                                            margin: '0 0 8px 0',
                                            lineHeight: '1.4',
                                            fontWeight: '600',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {video.title}
                                        </h4>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(2, 1fr)',
                                            gap: '8px',
                                            fontSize: '12px',
                                            color: '#666',
                                            marginBottom: '12px'
                                        }}>
                                            <div>👁️ {formatNumber(video.view_count)}</div>
                                            <div>👍 {formatNumber(video.like_count)}</div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <a
                                                href={video.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    flex: 1,
                                                    display: 'block',
                                                    padding: '8px 0',
                                                    backgroundColor: '#f0f0f0',
                                                    color: '#333',
                                                    textDecoration: 'none',
                                                    borderRadius: '4px',
                                                    textAlign: 'center',
                                                    fontSize: '13px',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                영상 보기
                                            </a>
                                            <a
                                                href={`/video/${video.video_id}`}
                                                style={{
                                                    flex: 1,
                                                    display: 'block',
                                                    padding: '8px 0',
                                                    backgroundColor: '#e6f0ff',
                                                    color: '#0066cc',
                                                    textDecoration: 'none',
                                                    borderRadius: '4px',
                                                    textAlign: 'center',
                                                    fontSize: '13px',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                📊 상세 분석
                                            </a>
                                        </div>
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
