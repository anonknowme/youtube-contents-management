'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { formatNumber } from '@/lib/formatNumber';
import { calculateViralScore, Video } from '@/lib/viralScore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Panel } from '@/components/ui/Panel';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateAnalysisPrompt } from '@/lib/promptUtils';
interface VideoDetailViewProps {
    videoId: string;
    onBack: () => void;
}

export function VideoDetailView({ videoId, onBack }: VideoDetailViewProps) {

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

    // Memoize the full info text to ensure consistency between display and copy
    const fullInfoText = useMemo(() => {
        if (!video || !transcript) return '';

        // Use centralized prompt generator
        return generateAnalysisPrompt(video, transcript);
    }, [video, transcript]);

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>;
    if (error) return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>;
    if (!video) return null;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Button
                    variant="secondary"
                    onClick={onBack}
                    style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                    ← 뒤로 가기
                </Button>
            </div>

            {/* Video Player */}
            <Card style={{ padding: 0, overflow: 'hidden', marginBottom: '20px' }}>
                <div style={{
                    position: 'relative',
                    paddingBottom: '56.25%', /* 16:9 ratio */
                    height: 0,
                    backgroundColor: '#000'
                }}>
                    <iframe
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </Card>

            {/* Title & Stats */}
            <h1 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '12px',
                lineHeight: '1.4',
                color: 'var(--text-primary)'
            }}>
                {video.title}
            </h1>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--border-secondary)'
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
            <div style={{ marginBottom: '32px' }}>
                <Panel variant="highlighted">
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <h3 style={{
                                margin: '0 0 8px 0',
                                fontSize: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: 'var(--text-primary)'
                            }}>
                                🔥 바이럴 성과 분석
                            </h3>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                                채널 내 최근 영상들의 평균 조회수 대비 성과입니다.
                            </p>
                        </div>
                        <Badge
                            variant={(video.viral_score || 0) >= 100 ? 'success' : 'danger'}
                            style={{
                                padding: '12px 24px',
                                fontSize: '24px',
                                fontWeight: '800'
                            }}
                        >
                            {(video.viral_score || 0).toFixed(0)}%
                        </Badge>
                    </div>
                </Panel>
            </div>

            {/* AI Analysis Section */}
            <div style={{ marginBottom: '40px' }}>
                <h2 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '16px',
                    color: 'var(--text-primary)'
                }}>
                    🤖 AI 심층 분석
                </h2>

                {!aiAnalysis && !aiLoading && (
                    <Card>
                        <div style={{ textAlign: 'center', padding: '10px 0' }}>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                                영상의 자막을 분석하여<br />
                                핵심 내용을 요약해드립니다.
                            </p>
                            {process.env.NODE_ENV === 'development' ? (
                                <Button
                                    onClick={async () => {
                                        setAiLoading(true);
                                        setAiError('');
                                        try {
                                            const response = await fetch(`/api/analyze/${videoId}`, {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify({
                                                    viral_score: video?.viral_score || 0
                                                })
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
                                    variant="primary"
                                >
                                    {aiLoading ? '분석 중...' : '✨ AI 분석 시작하기'}
                                </Button>
                            ) : (
                                <Button
                                    disabled
                                    variant="secondary"
                                >
                                    🧪 AI 분석 기능 준비 중입니다
                                </Button>
                            )}
                            {aiError && (
                                <p style={{ color: 'var(--status-error)', marginTop: '16px', fontSize: '14px' }}>
                                    {aiError}
                                </p>
                            )}
                        </div>
                    </Card>
                )}

                {(aiAnalysis || aiLoading) && (
                    <Panel variant="highlighted">
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '16px'
                        }}>
                            <span style={{ fontSize: '24px', marginRight: '8px' }}>✨</span>
                            <h3 style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: 'var(--accent-primary)',
                                margin: 0
                            }}>
                                AI 분석 결과 (바이럴 인사이트)
                            </h3>
                        </div>
                        <div className="markdown-content" style={{
                            fontSize: '15px',
                            lineHeight: '1.8',
                            color: 'var(--text-primary)'
                        }}>
                            {aiLoading ? (
                                <div style={{ paddingTop: '8px' }}>
                                    <div className="skeleton-line" style={{ width: '60%', height: '1.5em', marginBottom: '1.5em' }} />
                                    <div className="skeleton-line" style={{ width: '100%' }} />
                                    <div className="skeleton-line" style={{ width: '95%' }} />
                                    <div className="skeleton-line" style={{ width: '90%' }} />
                                    <div style={{ height: '1em' }} />
                                    <div className="skeleton-line" style={{ width: '50%', height: '1.5em', marginBottom: '1.5em' }} />
                                    <div className="skeleton-line" style={{ width: '98%' }} />
                                    <div className="skeleton-line" style={{ width: '85%' }} />
                                    <div className="skeleton-line" style={{ width: '92%' }} />
                                </div>
                            ) : (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {aiAnalysis}
                                </ReactMarkdown>
                            )}
                        </div>
                    </Panel>
                )}
            </div>

            {/* Transcript / Full Info Display */}
            <div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                }}>
                    <h3 style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        margin: 0,
                        color: 'var(--text-primary)'
                    }}>
                        📝 상세 정보
                    </h3>
                    {!transcriptLoading && transcript && (
                        <Button
                            variant="secondary"
                            onClick={() => {
                                navigator.clipboard.writeText(fullInfoText);
                                const btn = document.getElementById('copy-btn');
                                if (btn) {
                                    const originalText = btn.innerHTML;
                                    btn.innerHTML = '✅ 복사 완료!';
                                    setTimeout(() => {
                                        btn.innerHTML = originalText;
                                    }, 2000);
                                }
                            }}
                            id="copy-btn"
                            style={{ fontSize: '14px', padding: '8px 16px' }}
                        >
                            📋 복사하기
                        </Button>
                    )}
                </div>
                {transcriptLoading ? (
                    <Card>
                        <div style={{
                            padding: '40px',
                            textAlign: 'center',
                            color: 'var(--text-secondary)'
                        }}>
                            자막을 불러오는 중...
                        </div>
                    </Card>
                ) : transcript ? (
                    <Card>
                        <div style={{
                            whiteSpace: 'pre-wrap',
                            lineHeight: '1.8',
                            color: 'var(--text-primary)',
                            fontSize: '15px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            scrollbarWidth: 'thin',
                            fontFamily: 'monospace'
                        }}>
                            {fullInfoText}
                        </div>
                    </Card>
                ) : (
                    <Card>
                        <div style={{
                            padding: '40px',
                            textAlign: 'center',
                            color: 'var(--text-tertiary)'
                        }}>
                            자막이 없습니다.
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
