import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export const Button = ({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    ...props
}: ButtonProps) => {
    let variantClass = 'btn-primary';
    if (variant === 'secondary') variantClass = 'btn-secondary';
    if (variant === 'ghost') variantClass = 'btn-ghost';
    if (variant === 'danger') variantClass = 'btn-danger';

    // Danger/Ghost styles fallback if not in global CSS
    const dangerStyle = variant === 'danger' ? {
        backgroundColor: 'var(--accent-red)',
        borderColor: 'var(--accent-red)',
        color: '#ffffff'
    } : {};

    const ghostStyle = variant === 'ghost' ? {
        backgroundColor: 'transparent',
        color: 'var(--text-secondary)',
        border: '1px solid transparent'
    } : {};

    // Mobile-Friendly Sizes (Larger touch targets)
    const sizeStyles = {
        sm: { padding: '6px 12px', fontSize: '13px', minHeight: '36px' },
        md: { padding: '10px 20px', fontSize: '15px', minHeight: '44px' }, // Standard mobile touch target
        lg: { padding: '14px 28px', fontSize: '17px', minHeight: '52px' }
    };

    return (
        <button
            className={`btn-base ${variantClass === 'btn-danger' || variantClass === 'btn-ghost' ? '' : variantClass} ${className}`}
            style={{
                ...sizeStyles[size],
                ...dangerStyle,
                ...ghostStyle,
                ...(props.style || {})
            }}
            {...props}
        >
            {children}
        </button>
    );
};
