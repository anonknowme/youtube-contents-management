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
                backgroundColor: 'var(--accent-green)',
                color: '#000000',
                border: 'none',
                fontWeight: 700
            };
            break;
        case 'danger':
            variantStyle = {
                backgroundColor: 'var(--accent-red)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700
            };
            break;
        case 'warning':
            variantStyle = {
                backgroundColor: 'var(--accent-orange)',
                color: '#000000',
                border: 'none',
                fontWeight: 700
            };
            break;
        case 'outline':
            variantStyle = {
                backgroundColor: 'var(--bg-secondary)',
                border: '2px solid var(--text-secondary)',
                color: 'var(--text-primary)',
                fontWeight: 600
            };
            break;
        case 'neon':
            variantStyle = {
                backgroundColor: 'var(--text-primary)',
                color: '#000000',
                boxShadow: '0 0 8px var(--text-primary)',
                fontWeight: 700
            };
            break;
        default:
            variantStyle = {
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                fontWeight: 600
            };
    }

    // Increased font sizes for better mobile readability
    const sizeStyle = size === 'sm'
        ? { fontSize: '13px', padding: '4px 10px' }
        : { fontSize: '14px', padding: '6px 14px' };

    return (
        <span
            className={baseClass}
            style={{ ...variantStyle, ...sizeStyle, ...(style || {}) }}
        >
            {children}
        </span>
    );
};
