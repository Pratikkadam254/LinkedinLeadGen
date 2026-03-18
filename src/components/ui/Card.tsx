import React from 'react'
import './Card.css'

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'interactive' | 'highlighted';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  onClick,
}: CardProps) {
  const classNames = [
    'card',
    `card--${variant}`,
    `card--padding-${padding}`,
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={classNames} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      {children}
    </div>
  )
}

export default Card
