import React from 'react';

interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'glass';
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    onClick?: () => void;
    style?: React.CSSProperties;
}

export const Card = ({
    children,
    variant = 'default',
    className = '',
    padding = 'md',
    onClick,
    style
}: CardProps) => {
    const baseClass = 'card-base';

    const paddingStyles = {
        none: '0',
        sm: '12px',
        md: '20px',
        lg: '32px'
    };

    const glassStyle = variant === 'glass' ? {
        backgroundColor: 'var(--bg-glass)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-secondary)'
    } : {};

    return (
        <div
            className={`${baseClass} ${className}`}
            style={{
                padding: paddingStyles[padding],
                ...glassStyle,
                ...style,
                cursor: onClick ? 'pointer' : 'default'
            }}
            onClick={onClick}
        >
            {children}
        </div>
    );
};
