import React from 'react';

interface PanelProps {
    children: React.ReactNode;
    title?: string;
    icon?: string;
    action?: React.ReactNode;
    className?: string;
    variant?: 'default' | 'highlighted';
}

export const Panel = ({
    children,
    title,
    icon,
    action,
    className = '',
    variant = 'default'
}: PanelProps) => {
    const variantStyles = variant === 'highlighted'
        ? {
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
            borderColor: 'var(--border-active)'
        }
        : {};

    return (
        <div
            className={`card-base ${className}`}
            style={{
                padding: '0',
                ...variantStyles
            }}
        >
            {/* Header */}
            {(title || action) && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px 24px',
                        borderBottom: '1px solid var(--border-secondary)',
                        gap: '16px'
                    }}
                >
                    {/* Left: Icon + Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        {icon && (
                            <span style={{ fontSize: '24px', lineHeight: 1 }}>
                                {icon}
                            </span>
                        )}
                        {title && (
                            <h3
                                style={{
                                    margin: 0,
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    color: 'var(--text-primary)'
                                }}
                            >
                                {title}
                            </h3>
                        )}
                    </div>

                    {/* Right: Action */}
                    {action && <div>{action}</div>}
                </div>
            )}

            {/* Content */}
            <div style={{ padding: '24px' }}>
                {children}
            </div>
        </div>
    );
};
