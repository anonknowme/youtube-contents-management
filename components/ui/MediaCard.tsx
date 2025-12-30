/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Badge } from './Badge';

interface MediaCardProps {
    thumbnailUrl: string;
    title: string;
    channelName?: string;
    viewCount: string;
    likeCount?: string;
    commentCount?: string;
    publishedAt: string;
    viralScore?: number;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
}

export const MediaCard = ({
    thumbnailUrl,
    title,
    channelName,
    viewCount,
    likeCount,
    commentCount,
    publishedAt,
    viralScore,
    onClick,
    className = '',
    style
}: MediaCardProps) => {
    return (
        <div
            className={`card-base ${className}`}
            style={{
                cursor: onClick ? 'pointer' : 'default',
                padding: '0',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                ...style
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
                    margin: '0 0 12px 0',
                    fontSize: '16px',
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

                {/* Stats Row */}
                <div style={{
                    marginTop: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '15px',
                    color: 'var(--text-secondary)'
                }}>
                    {channelName && (
                        <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>
                            {channelName}
                        </span>
                    )}

                    {/* View, Like, Comment stats */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ opacity: 0.7 }}>👁️</span>
                            <span>{viewCount}</span>
                        </span>

                        {likeCount && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ opacity: 0.7 }}>👍</span>
                                <span>{likeCount}</span>
                            </span>
                        )}

                        {commentCount && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ opacity: 0.7 }}>💬</span>
                                <span>{commentCount}</span>
                            </span>
                        )}
                    </div>

                    {/* Published date */}
                    <span style={{ opacity: 0.6, fontSize: '14px' }}>{publishedAt}</span>
                </div>
            </div>
        </div>
    );
};
