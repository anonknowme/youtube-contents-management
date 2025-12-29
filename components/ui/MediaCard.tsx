/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Badge } from './Badge';

interface MediaCardProps {
    thumbnailUrl: string;
    title: string;
    channelName?: string;
    viewCount: string;
    publishedAt: string;
    viralScore?: number;
    onClick?: () => void;
    className?: string;
}

export const MediaCard = ({
    thumbnailUrl,
    title,
    channelName,
    viewCount,
    publishedAt,
    viralScore,
    onClick,
    className = ''
}: MediaCardProps) => {
    return (
        <div
            className={`card-base ${className}`}
            style={{
                cursor: onClick ? 'pointer' : 'default',
                padding: '0', // Reset base padding as we structure manually
                display: 'flex',
                flexDirection: 'column',
                height: '100%' // Full height for grid alignment
            }}
            onClick={onClick}
        >
            {/* Thumbnail Container */}
            <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', borderBottom: '1px solid var(--border-secondary)' }}>
                <img
                    src={thumbnailUrl}
                    alt={title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Viral Score Overlay */}
                {viralScore !== undefined && (
                    <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        zIndex: 10
                    }}>
                        <Badge
                            variant={viralScore >= 100 ? 'success' : 'danger'}
                            style={{
                                boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                fontWeight: 700
                            }}
                        >
                            VIRAL: {viralScore.toFixed(0)}%
                        </Badge>
                    </div>
                )}
            </div>

            {/* Content */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '16px', // Mobile readability
                    fontWeight: 600,
                    lineHeight: '1.4',
                    color: 'var(--text-primary)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {title}
                </h3>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {channelName && <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>{channelName}</span>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{viewCount} views</span>
                        <span style={{ opacity: 0.7 }}>{publishedAt}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
