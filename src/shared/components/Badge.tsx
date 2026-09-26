import React from 'react';

export interface BadgeProps {
  variant?: 'ready' | 'isolated' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'real' | 'simulated' | 'unsupported';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  title?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  icon,
  className = '',
  title,
}) => {
  const getStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'ready':
      case 'success':
        return {
          backgroundColor: 'rgba(63, 185, 80, 0.15)',
          color: 'var(--color-success)',
          border: '1px solid rgba(63, 185, 80, 0.3)',
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(210, 153, 34, 0.15)',
          color: 'var(--color-warning)',
          border: '1px solid rgba(210, 153, 34, 0.3)',
        };
      case 'danger':
        return {
          backgroundColor: 'rgba(248, 81, 73, 0.15)',
          color: 'var(--color-danger)',
          border: '1px solid rgba(248, 81, 73, 0.3)',
        };
      case 'isolated':
      case 'info':
      case 'real':
        return {
          backgroundColor: 'var(--color-accent-subtle)',
          color: 'var(--color-accent)',
          border: '1px solid rgba(88, 166, 255, 0.3)',
        };
      case 'simulated':
        return {
          backgroundColor: 'rgba(188, 140, 255, 0.15)',
          color: '#bc8cff',
          border: '1px solid rgba(188, 140, 255, 0.3)',
        };
      case 'unsupported':
        return {
          backgroundColor: 'rgba(110, 118, 129, 0.2)',
          color: 'var(--color-text-muted)',
          border: '1px solid var(--color-border-default)',
        };
      case 'neutral':
      default:
        return {
          backgroundColor: 'var(--color-bg-panel)',
          color: 'var(--color-text-secondary)',
          border: '1px solid var(--color-border-default)',
        };
    }
  };

  return (
    <span
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '11px',
        fontWeight: 600,
        fontFamily: 'var(--font-mono)',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...getStyles(),
      }}
      className={className}
    >
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </span>
  );
};
