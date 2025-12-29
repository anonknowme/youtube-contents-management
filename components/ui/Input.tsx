import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    className?: string;
    error?: string;
}

export const Input = ({
    label,
    className = '',
    error,
    ...props
}: InputProps) => {
    const baseClass = 'input-base';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {label && (
                <label style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    {label}
                </label>
            )}
            <input
                className={`${baseClass} ${className}`}
                style={{
                    borderColor: error ? 'var(--accent-red)' : undefined,
                    boxShadow: error ? '0 0 0 2px rgba(235, 87, 87, 0.2)' : undefined,
                    fontSize: '16px', // Prevents iOS zoom
                    ...(props.style || {})
                }}
                {...props}
            />
            {error && (
                <span style={{ fontSize: '12px', color: 'var(--accent-red)', fontWeight: 500 }}>
                    ⚠ {error}
                </span>
            )}
        </div>
    );
};
