'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatNumber } from '@/lib/formatNumber';
import { calculateViralScore, Video } from '@/lib/viralScore';

export default function VideoDetailPage() {
    const params = useParams();
    const videoId = params.videoId as string;

    const [video, setVideo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [transcript, setTranscript] = useState<string>('');
    const [transcriptLoading, setTranscriptLoading] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<string>('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');

    useEffect(() => {
        async function fetchVideoData() {
            if (!videoId) return;

            try {
                // 1. 현재 영상 정보 가져오기
                const { data: currentVideo, error: videoError } = await supabase
                    .from('videos')
                    .select('*')
                    .eq('video_id', videoId)
                    .single();

                if (videoError) throw videoError;
                if (!currentVideo) throw new Error('영상을 찾을 수 없습니다.');

                // 2. 같은 채널의 다른 영상들 가져오기 (바이럴 점수 계산용)
                const { data: channelVideos, error: channelError } = await supabase
                    .from('videos')
                    .select('video_id, view_count, like_count, comment_count, published_at')
                    .eq('channel_id', currentVideo.channel_id)
                    .order('published_at', { ascending: false })
                    .limit(1000);

                if (channelError) throw channelError;

                // 3. 바이럴 점수 계산
                const formattedVideos: Video[] = (channelVideos || []).map(v => ({
                    id: v.video_id,
                    view_count: Number(v.view_count),
                    like_count: Number(v.like_count || 0),
                    comment_count: Number(v.comment_count || 0),
                    published_at: v.published_at
                }));

                const currentVideoFormat: Video = {
                    id: currentVideo.video_id,
                    view_count: Number(currentVideo.view_count),
                    like_count: Number(currentVideo.like_count || 0),
                    comment_count: Number(currentVideo.comment_count || 0),
                    published_at: currentVideo.published_at
                };

                // 현재 영상을 목록에 포함 (중복 제거)
                const allVideosForCalc = formattedVideos.filter(v => v.id !== currentVideoFormat.id);
                allVideosForCalc.push(currentVideoFormat);

                // 점수 계산
                const scoreResult = calculateViralScore(
                    currentVideoFormat,
                    allVideosForCalc,
                    'vs_neighbor_avg'
                );

                // 계산된 점수를 포함하여 상태 업데이트
                setVideo({
                    ...currentVideo,
                    viral_score: scoreResult.viral_score
                });

            } catch (err) {
                console.error(err);
                setError('영상 정보를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        }

        fetchVideoData();
    }, [videoId]);

    // Fetch transcript separately
    useEffect(() => {
        async function fetchTranscript() {
            if (!videoId) return;

            setTranscriptLoading(true);
            try {
                const response = await fetch(`/api/transcript/${videoId}`);
                const data = await response.json();

                if (data.success) {
                    setTranscript(data.data.transcript);
                } else {
                    setTranscript('자막을 가져올 수 없습니다.');
                }
            } catch (err) {
                console.error('Transcript fetch error:', err);
                setTranscript('자막을 불러오는 중 오류가 발생했습니다.');
            } finally {
                setTranscriptLoading(false);
            }
        }

        fetchTranscript();
    }, [videoId]);

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>;
    if (error) return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>;
    if (!video) return null;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
                <a href="/" style={{ textDecoration: 'none', color: '#666', fontSize: '14px' }}>
                    ← 뒤로 가기
                </a>
            </div>

            {/* Video Player */}
            <div style={{
                position: 'relative',
                paddingBottom: '56.25%', /* 16:9 ratio */
                height: 0,
                backgroundColor: '#000',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '20px'
            }}>
                <iframe
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>

            {/* Title & Stats */}
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', lineHeight: '1.4' }}>
                {video.title}
            </h1>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#666',
                fontSize: '14px',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid #eee'
            }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <span>👁️ {formatNumber(video.view_count)}</span>
                    <span>👍 {formatNumber(video.like_count)}</span>
                    <span>💬 {formatNumber(video.comment_count)}</span>
                </div>
                <div>
                    {new Date(video.published_at).toLocaleDateString()}
                </div>
            </div>

            {/* Viral Badge */}
            <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: '#333' }}>
                        🔥 바이럴 성과 분석
                    </h3>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                        채널 내 최근 영상들의 평균 조회수 대비 성과입니다.
                    </p>
                </div>
                <div style={{
                    backgroundColor: (video.viral_score || 0) >= 100 ? '#10b981' : '#ef4444',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '50px',
                    fontWeight: '800',
                    fontSize: '24px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    {(video.viral_score || 0).toFixed(0)}%
                </div>
            </div>

            {/* AI Analysis Section */}
            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
                    🤖 AI 심층 분석
                </h2>

                {!aiAnalysis && !aiLoading && (
                    <div style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '12px',
                        padding: '30px',
                        textAlign: 'center',
                        backgroundColor: '#fff'
                    }}>
                        <p style={{ color: '#666', marginBottom: '20px' }}>
                            영상의 자막을 분석하여<br />
                            핵심 내용을 요약해드립니다.
                        </p>
                        <button
                            onClick={async () => {
                                setAiLoading(true);
                                setAiError('');
                                try {
                                    const response = await fetch(`/api/analyze/${videoId}`, {
                                        method: 'POST'
                                    });
                                    const data = await response.json();
                                    if (data.success) {
                                        setAiAnalysis(data.data.summary);
                                    } else {
                                        setAiError(data.message || 'AI 분석에 실패했습니다.');
                                    }
                                } catch (err) {
                                    setAiError('AI 분석 중 오류가 발생했습니다.');
                                } finally {
                                    setAiLoading(false);
                                }
                            }}
                            disabled={aiLoading}
                            style={{
                                background: aiLoading ? '#ccc' : 'linear-gradient(45deg, #2196F3, #21CBF3)',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: aiLoading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                            }}
                        >
                            {aiLoading ? '분석 중...' : '✨ AI 분석 시작하기'}
                        </button>
                        {aiError && (
                            <p style={{ color: '#f44336', marginTop: '16px', fontSize: '14px' }}>
                                {aiError}
                            </p>
                        )}
                    </div>
                )}

                {aiAnalysis && (
                    <div style={{
                        border: '2px solid #2196F3',
                        borderRadius: '12px',
                        padding: '24px',
                        backgroundColor: '#f0f8ff'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '16px'
                        }}>
                            <span style={{ fontSize: '24px', marginRight: '8px' }}>✨</span>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#2196F3', margin: 0 }}>
                                AI 분석 결과 (바이럴 인사이트)
                            </h3>
                        </div>
                        <p style={{
                            fontSize: '15px',
                            lineHeight: '1.8',
                            color: '#333',
                            margin: 0,
                            whiteSpace: 'pre-wrap'
                        }}>
                            {aiAnalysis}
                        </p>
                    </div>
                )}
            </div>

            {/* Transcript */}
            <div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                        📝 영상 자막 (Transcript)
                    </h3>
                    {!transcriptLoading && transcript && (
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(transcript);
                                const btn = document.getElementById('copy-btn');
                                if (btn) {
                                    const originalText = btn.innerText;
                                    btn.innerText = '✅ 복사 완료!';
                                    setTimeout(() => {
                                        btn.innerText = originalText;
                                    }, 2000);
                                }
                            }}
                            id="copy-btn"
                            style={{
                                padding: '6px 12px',
                                fontSize: '14px',
                                borderRadius: '6px',
                                border: '1px solid #ddd',
                                backgroundColor: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.2s'
                            }}
                        >
                            📋 전체 복사
                        </button>
                    )}
                </div>
                {transcriptLoading ? (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#666',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '12px'
                    }}>
                        자막을 불러오는 중...
                    </div>
                ) : transcript ? (
                    <div style={{
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.8',
                        color: '#333',
                        backgroundColor: '#f8f9fa',
                        padding: '24px',
                        borderRadius: '12px',
                        fontSize: '15px',
                        border: '1px solid #eee',
                        maxHeight: '400px',        // 최대 높이 설정
                        overflowY: 'auto',         // 세로 스크롤 활성화
                        scrollbarWidth: 'thin',    // 최신 브라우저 스크롤바 스타일
                    }}>
                        {transcript}
                    </div>
                ) : (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#999',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '12px'
                    }}>
                        자막이 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
