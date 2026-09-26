import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  icon,
  children,
  style,
  disabled,
  className = '',
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    if (disabled) {
      return {
        backgroundColor: 'var(--color-bg-hover)',
        color: 'var(--color-text-muted)',
        border: '1px solid var(--color-border-default)',
        cursor: 'not-allowed',
        opacity: 0.6,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#238636',
          color: '#ffffff',
          border: '1px solid rgba(240, 246, 252, 0.1)',
        };
      case 'success':
        return {
          backgroundColor: 'rgba(63, 185, 80, 0.2)',
          color: 'var(--color-success)',
          border: '1px solid rgba(63, 185, 80, 0.4)',
        };
      case 'danger':
        return {
          backgroundColor: 'rgba(248, 81, 73, 0.15)',
          color: 'var(--color-danger)',
          border: '1px solid rgba(248, 81, 73, 0.4)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-text-secondary)',
          border: '1px solid transparent',
        };
      case 'secondary':
      default:
        return {
          backgroundColor: 'var(--color-bg-panel)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border-default)',
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return {
          padding: '3px 8px',
          fontSize: '12px',
        };
      case 'lg':
        return {
          padding: '8px 18px',
          fontSize: '14px',
        };
      case 'md':
      default:
        return {
          padding: '6px 14px',
          fontSize: '13px',
        };
    }
  };

  return (
    <button
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        borderRadius: 'var(--radius-md)',
        fontWeight: 500,
        fontFamily: 'inherit',
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
        userSelect: 'none',
        ...getSizeStyles(),
        ...getVariantStyles(),
        ...style,
      }}
      className={`btn-${variant} ${className}`}
      {...props}
    >
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  );
};
