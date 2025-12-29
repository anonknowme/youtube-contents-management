'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { MediaCard } from '@/components/ui/MediaCard';

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

                {/* Media Cards Grid */}
                <section>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-tertiary)' }}>Media Cards</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        <MediaCard
                            thumbnailUrl="https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
                            title="Never Gonna Give You Up (Official Music Video)"
                            channelName="Rick Astley"
                            viewCount="1.4B"
                            publishedAt="2009. 10. 25."
                            viralScore={142}
                        />
                        <MediaCard
                            thumbnailUrl="https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg"
                            title="Me at the zoo"
                            channelName="jawed"
                            viewCount="304M"
                            publishedAt="2005. 4. 24."
                            viralScore={85}
                        />
                    </div>
                </section>

            </div>
        </div>
    );
}
