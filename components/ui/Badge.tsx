import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'danger' | 'warning' | 'outline' | 'neon';
    size?: 'sm' | 'md';
    style?: React.CSSProperties;
}

export const Badge = ({
    children,
    variant = 'default',
    size = 'md',
    style
}: BadgeProps) => {
    const baseClass = 'badge-base';

    let variantStyle: React.CSSProperties = {};

    switch (variant) {
        case 'success':
            variantStyle = {
                backgroundColor: 'rgba(57, 255, 20, 0.15)',
                color: 'var(--accent-green)',
                border: '1px solid var(--accent-green)',
                boxShadow: '0 0 5px rgba(57, 255, 20, 0.2)'
            };
            break;
        case 'danger':
            variantStyle = {
                backgroundColor: 'rgba(255, 51, 51, 0.15)',
                color: 'var(--accent-red)',
                border: '1px solid var(--accent-red)'
            };
            break;
        case 'warning':
            variantStyle = {
                backgroundColor: 'rgba(247, 147, 26, 0.15)',
                color: 'var(--accent-primary)',
                border: '1px solid var(--accent-primary)'
            };
            break;
        case 'outline':
            variantStyle = {
                backgroundColor: 'transparent',
                border: '1px solid var(--text-secondary)',
                color: 'var(--text-secondary)'
            };
            break;
        case 'neon':
            variantStyle = {
                backgroundColor: 'var(--text-primary)',
                color: 'black',
                boxShadow: '0 0 8px var(--text-primary)'
            };
            break;
        default:
            variantStyle = {
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-secondary)'
            };
    }

    const sizeStyle = size === 'sm'
        ? { fontSize: '10px', padding: '1px 6px' }
        : { fontSize: '11px', padding: '3px 10px' };

    return (
        <span
            className={baseClass}
            style={{ ...variantStyle, ...sizeStyle, ...(style || {}) }}
        >
            {children}
        </span>
    );
};
