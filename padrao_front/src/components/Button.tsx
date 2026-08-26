import React from 'react';
import { ButtonProps } from '../types';

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    borderRadius: '0.5rem',
    border: '1px solid transparent',
    cursor: loading || disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    opacity: disabled || loading ? 0.6 : 1,
    transform: 'scale(1)',
  };

  const variants = {
    primary: {
      backgroundColor: '#2563eb',
      color: '#ffffff',
      boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
    },
    secondary: {
      backgroundColor: 'var(--semob-secondary)',
      borderColor: 'var(--semob-border)',
      borderWidth: '1px',
      color: 'var(--semob-text)',
    },
    danger: {
      backgroundColor: 'var(--semob-danger)',
      color: '#ffffff',
      boxShadow: '0 4px 10px rgba(239, 68, 68, 0.25)',
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: 'var(--semob-border)',
      borderWidth: '1px',
      color: 'var(--semob-text)',
    }
  };

  const sizes = {
    sm: { padding: '0.4rem 0.85rem', fontSize: '0.82rem' },
    md: { padding: '0.55rem 1.35rem', fontSize: '0.9rem' },
    lg: { padding: '0.75rem 1.85rem', fontSize: '1.05rem' }
  };

  const activeVariant = variants[variant];
  const activeSize = sizes[size];

  return (
    <button
      style={{ ...baseStyle, ...activeVariant, ...activeSize }}
      disabled={disabled || loading}
      onMouseDown={(e) => { if (!disabled && !loading) e.currentTarget.style.transform = 'scale(0.96)' }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
      onMouseEnter={(e) => { 
        if (!disabled && !loading) {
          e.currentTarget.style.filter = 'brightness(1.12)';
          if (variant === 'outline' || variant === 'secondary') {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
          }
        }
      }}
      onMouseLeave={(e) => { 
        e.currentTarget.style.filter = 'none'; 
        e.currentTarget.style.transform = 'scale(1)';
        if (variant === 'outline' || variant === 'secondary') {
          e.currentTarget.style.backgroundColor = variants[variant].backgroundColor;
        }
      }}
      {...props}
    >
      {loading ? (
        <svg
          style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem', width: '1rem', height: '1rem' }}
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
};
export default Button;
