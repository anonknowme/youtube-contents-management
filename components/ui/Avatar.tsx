/* eslint-disable @next/next/no-img-element */
import React from 'react';

interface AvatarProps {
    src?: string;
    alt: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    status?: 'active' | 'offline' | 'busy';
}

export const Avatar = ({
    src,
    alt,
    size = 'md',
    className = '',
    status
}: AvatarProps) => {
    const sizeStyles = {
        sm: { width: '32px', height: '32px', fontSize: '12px' },
        md: { width: '48px', height: '48px', fontSize: '16px' },
        lg: { width: '64px', height: '64px', fontSize: '24px' },
        xl: { width: '96px', height: '96px', fontSize: '36px' }
    };

    const statusColors = {
        active: 'var(--accent-green)',
        offline: 'var(--text-tertiary)',
        busy: 'var(--accent-red)'
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }} className={className}>
            <div style={{
                ...sizeStyles[size],
                borderRadius: '50%',
                backgroundColor: 'var(--bg-tertiary)',
                border: '2px solid var(--border-secondary)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                fontWeight: 'bold',
                textTransform: 'uppercase'
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

            {status && (
                <span style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: size === 'sm' ? '8px' : '12px',
                    height: size === 'sm' ? '8px' : '12px',
                    backgroundColor: statusColors[status],
                    borderRadius: '50%',
                    border: '2px solid var(--bg-primary)',
                    boxShadow: '0 0 4px rgba(0,0,0,0.5)'
                }} />
            )}
        </div>
    );
};
