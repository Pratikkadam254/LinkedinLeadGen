import React from 'react'
import './Skeleton.css'

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1,
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  if (variant === 'text' && count > 1) {
    return (
      <div className={`skeleton-group ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="skeleton skeleton--text"
            style={{
              ...style,
              width: i === count - 1 ? '70%' : style.width,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`skeleton skeleton--${variant} ${className}`}
      style={style}
    />
  )
}

export default Skeleton
