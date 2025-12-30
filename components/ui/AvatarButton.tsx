/* eslint-disable @next/next/no-img-element */
import React from 'react';

interface AvatarButtonProps {
    src?: string;
    alt: string;
    label: string;
    subtitle?: string;
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
}

export const AvatarButton = ({
    src,
    alt,
    label,
    subtitle,
    size = 'md',
    onClick,
    className = '',
    style
}: AvatarButtonProps) => {
    const sizeConfig = {
        sm: { avatar: '32px', fontSize: '13px', gap: '8px', padding: '8px 12px' },
        md: { avatar: '40px', fontSize: '15px', gap: '12px', padding: '12px 16px' },
        lg: { avatar: '48px', fontSize: '16px', gap: '12px', padding: '12px 20px' }
    };

    const config = sizeConfig[size];

    return (
        <button
            onClick={onClick}
            className={className}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: config.gap,
                padding: config.padding,
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-family-base)',
                minHeight: 'var(--touch-target-size)',
                width: '100%',
                textAlign: 'left',
                ...style
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                e.currentTarget.style.borderColor = 'var(--border-active)';
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-primary)';
                e.currentTarget.style.transform = 'none';
            }}
        >
            {/* Avatar */}
            <div style={{
                width: config.avatar,
                height: config.avatar,
                borderRadius: '50%',
                backgroundColor: 'var(--bg-tertiary)',
                border: '2px solid var(--border-secondary)',
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                fontWeight: 'bold',
                fontSize: size === 'sm' ? '12px' : size === 'md' ? '14px' : '16px'
            }}>
                {src ? (
                    <img
                        src={src}
                        alt={alt}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <span>{alt.slice(0, 2)}</span>
                )}
            </div>

            {/* Label & Subtitle */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{
                    fontSize: config.fontSize,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {label}
                </div>
                {subtitle && (
                    <div style={{
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        marginTop: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {subtitle}
                    </div>
                )}
            </div>
        </button>
    );
};
