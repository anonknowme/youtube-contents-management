import React from 'react';

interface SkeletonProps {
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
    className?: string;
}

export const Skeleton = ({
    variant = 'text',
    width,
    height,
    className = ''
}: SkeletonProps) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'circular':
                return {
                    borderRadius: '50%',
                    width: width || '40px',
                    height: height || '40px'
                };
            case 'rectangular':
                return {
                    borderRadius: '8px',
                    width: width || '100%',
                    height: height || '200px'
                };
            case 'text':
            default:
                return {
                    borderRadius: '4px',
                    width: width || '100%',
                    height: height || '16px'
                };
        }
    };

    return (
        <div
            className={className}
            style={{
                ...getVariantStyles(),
                backgroundColor: 'var(--bg-tertiary)',
                position: 'relative',
                overflow: 'hidden',
                ...({
                    animation: 'skeleton-shimmer 1.5s ease-in-out infinite'
                } as React.CSSProperties)
            }}
        >
            <style jsx>{`
        @keyframes skeleton-shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        div {
          background: linear-gradient(
            90deg,
            var(--bg-tertiary) 0%,
            var(--bg-secondary) 50%,
            var(--bg-tertiary) 100%
          );
          background-size: 200% 100%;
        }
      `}</style>
        </div>
    );
};

// Preset skeleton components for common use cases
export const SkeletonText = ({ lines = 1, width }: { lines?: number; width?: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                variant="text"
                width={i === lines - 1 && lines > 1 ? '80%' : width}
            />
        ))}
    </div>
);

export const SkeletonAvatar = ({ size = '40px' }: { size?: string }) => (
    <Skeleton variant="circular" width={size} height={size} />
);

export const SkeletonCard = () => (
    <div style={{
        padding: '16px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '12px',
        border: '1px solid var(--border-primary)'
    }}>
        <Skeleton variant="rectangular" height="200px" />
        <div style={{ marginTop: '12px' }}>
            <SkeletonText lines={2} />
        </div>
    </div>
);
