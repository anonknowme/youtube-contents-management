'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { MediaCard } from '@/components/ui/MediaCard';
import { Panel } from '@/components/ui/Panel';
import { AvatarButton } from '@/components/ui/AvatarButton';
import { Skeleton, SkeletonText, SkeletonAvatar, SkeletonCard } from '@/components/ui/Skeleton';

export default function ComponentsDemoPage() {
    const [theme, setTheme] = useState('dark');

    // Effect to apply theme to document body
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'var(--font-family-base)' }}>

            {/* Header & Theme Switcher */}
            <header style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px',
                marginBottom: '40px',
                textAlign: 'center'
            }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>
                        Design System V3
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                        Multi-Theme & Mobile Optimized
                    </p>
                </div>

                {/* Theme Switcher Controls */}
                <div style={{
                    display: 'flex',
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '4px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)'
                }}>
                    {['light', 'dark', 'cypherpunk'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTheme(t)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: theme === t ? 'var(--accent-primary)' : 'transparent',
                                color: theme === t ? 'var(--text-inverse)' : 'var(--text-secondary)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                transition: 'all 0.2s'
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </header>

            <div style={{ display: 'grid', gap: '32px' }}>

                {/* Buttons */}
                <section>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-tertiary)' }}>Buttons</h2>
                    <Card>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                            <Button>Primary</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="danger">Danger</Button>
                        </div>
                    </Card>
                </section>

                {/* Inputs */}
                <section>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-tertiary)' }}>Inputs (16px Font)</h2>
                    <Card>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Input label="Email Address" placeholder="hello@example.com" />
                            <Input label="With Error" placeholder="Invalid value" error="Please enter a valid email" />
                        </div>
                    </Card>
                </section>

                {/* Visual Elements */}
                <section>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-tertiary)' }}>Visual Elements</h2>
                    <Card>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Avatar alt="User" size="md" status="active" />
                                <Avatar alt="Bot" size="md" status="offline" />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <Badge variant="success">Viral 98%</Badge>
                                <Badge variant="danger">Low View</Badge>
                                <Badge variant="warning">Analyzing</Badge>
                            </div>
                        </div>
                    </Card>
                </section>

                {/* Avatar Buttons */}
                <section>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-tertiary)' }}>Avatar Buttons (Quick Select)</h2>
                    <Card>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                            <AvatarButton
                                src="https://yt3.googleusercontent.com/ytc/AIdro_mK4ecaF7w51k_yX65SPd5s827M5Q1yO0_F-jSj=s176-c-k-c0x00ffffff-no-rj"
                                alt="Rick Astley"
                                label="Rick Astley"
                                onClick={() => console.log('Rick Astley clicked')}
                            />
                            <AvatarButton
                                alt="오랜지카라멜"
                                label="오랜지카라멜웰빙코인"
                                onClick={() => console.log('Channel clicked')}
                            />
                            <AvatarButton
                                alt="리스펙"
                                label="리스펙"
                                size="sm"
                            />
                            <AvatarButton
                                alt="네딸바"
                                label="네딸바"
                                size="lg"
                            />
                        </div>
                    </Card>
                </section>

                {/* Media Cards Grid */}
                <section>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-tertiary)' }}>Media Cards</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        <MediaCard
                            thumbnailUrl="https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
                            title="Never Gonna Give You Up (Official Music Video)"
                            channelName="Rick Astley"
                            viewCount="1.4B"
                            likeCount="15M"
                            commentCount="2.1M"
                            publishedAt="2009. 10. 25."
                            viralScore={142}
                        />
                        <MediaCard
                            thumbnailUrl="https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg"
                            title="Me at the zoo"
                            channelName="jawed"
                            viewCount="304M"
                            likeCount="11M"
                            commentCount="3.8M"
                            publishedAt="2005. 4. 24."
                            viralScore={85}
                        />
                    </div>
                </section>

                {/* Panels */}
                <section>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-tertiary)' }}>Panels (Section Containers)</h2>
                    <div style={{ display: 'grid', gap: '20px' }}>
                        <Panel
                            icon="🔥"
                            title="바이럴 성과 분석"
                            action={<Badge variant="success" size="md">367%</Badge>}
                        >
                            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                채널 내 최근 영상들의 평균 조회수 대비 성과입니다.
                            </p>
                        </Panel>

                        <Panel
                            icon="🤖"
                            title="AI 심층 분석"
                            action={<Button size="sm">✨ AI 분석 시작하기</Button>}
                        >
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                                영상의 자막을 분석하여 핵심 내용을 요약해드립니다.
                            </div>
                        </Panel>

                        <Panel
                            icon="📝"
                            title="상세 정보"
                            action={<Button variant="secondary" size="sm">📋 복사하기</Button>}
                        >
                            <div style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>심층 분석 요청</strong>
                                <p style={{ marginTop: '12px' }}>
                                    아래의 【영상 정보】, 【성과 분석】, 【초반 스크립트 (1분/300자)】, 【스크립트】 내용을 바탕으로 이 영상의 좋은(혹은 나쁜) 성과의 원인을 심층 분석해주세요.
                                </p>
                            </div>
                        </Panel>
                    </div>
                </section>

                {/* Skeletons */}
                <section>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-tertiary)' }}>Skeleton Loaders</h2>
                    <div style={{ display: 'grid', gap: '20px' }}>
                        <Card>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Text Skeletons</h3>
                            <SkeletonText lines={3} />
                        </Card>

                        <Card>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Avatar + Text</h3>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <SkeletonAvatar size="48px" />
                                <div style={{ flex: 1 }}>
                                    <SkeletonText lines={2} />
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Card Skeleton</h3>
                            <SkeletonCard />
                        </Card>

                        <Card>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Custom Sizes</h3>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <Skeleton variant="rectangular" height="100px" />
                                <Skeleton variant="text" width="60%" />
                                <Skeleton variant="circular" width="60px" height="60px" />
                            </div>
                        </Card>
                    </div>
                </section>

            </div>
        </div>
    );
}
