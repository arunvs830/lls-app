import React from 'react';

/**
 * Skeleton - A simple skeleton loader component for loading states
 * 
 * Usage:
 * <Skeleton width="100px" height="24px" />
 * <Skeleton width="100%" height="40px" borderRadius="12px" />
 * <Skeleton.Text lines={3} />
 * <Skeleton.Circle size="48px" />
 */
const Skeleton = ({
    width = '100%',
    height = '20px',
    borderRadius = '8px',
    className = '',
    style = {}
}) => {
    return (
        <div
            className={`skeleton ${className}`}
            style={{
                width,
                height,
                borderRadius,
                background: 'linear-gradient(90deg, #E3E5E8 25%, #F5F7FA 50%, #E3E5E8 75%)',
                backgroundSize: '200% 100%',
                animation: 'skeleton-shimmer 1.5s infinite',
                ...style
            }}
            aria-hidden="true"
        />
    );
};

// Text skeleton with multiple lines
Skeleton.Text = ({ lines = 1, lineHeight = '16px', gap = '8px' }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                height={lineHeight}
                width={i === lines - 1 && lines > 1 ? '70%' : '100%'}
            />
        ))}
    </div>
);

// Circle skeleton for avatars
Skeleton.Circle = ({ size = '40px' }) => (
    <Skeleton width={size} height={size} borderRadius="50%" />
);

// Card skeleton
Skeleton.Card = ({ height = '120px' }) => (
    <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid #E3E5E8'
    }}>
        <Skeleton height="24px" width="60%" style={{ marginBottom: '12px' }} />
        <Skeleton.Text lines={2} />
    </div>
);

// Stat Card skeleton (matches StatCard component)
Skeleton.StatCard = () => (
    <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid #E3E5E8',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    }}>
        <Skeleton.Circle size="48px" />
        <div style={{ flex: 1 }}>
            <Skeleton height="14px" width="60%" style={{ marginBottom: '8px' }} />
            <Skeleton height="28px" width="40%" />
        </div>
    </div>
);

export default Skeleton;

// Add to index.css:
// @keyframes skeleton-shimmer {
//     0% { background-position: 200% 0; }
//     100% { background-position: -200% 0; }
// }
