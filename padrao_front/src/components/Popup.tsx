import React, { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { PopupProps } from '../types';

export const Popup: React.FC<PopupProps> = ({
  isOpen,
  onClose,
  title,
  variant = 'info',
  size = 'md',
  children,
  actions
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const variantConfigs = {
    info: {
      color: '#3b82f6',
      bgLight: 'rgba(59, 130, 246, 0.1)',
      icon: Info
    },
    success: {
      color: '#10b981',
      bgLight: 'rgba(16, 185, 129, 0.1)',
      icon: CheckCircle
    },
    warning: {
      color: '#f59e0b',
      bgLight: 'rgba(245, 158, 11, 0.1)',
      icon: AlertTriangle
    },
    danger: {
      color: '#ef4444',
      bgLight: 'rgba(239, 68, 68, 0.1)',
      icon: AlertCircle
    }
  };

  const activeConfig = variantConfigs[variant];
  const IconComponent = activeConfig.icon;

  const sizeWidths = {
    sm: '400px',
    md: '550px',
    lg: '750px'
  };

  const activeWidth = sizeWidths[size];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(7, 10, 19, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1000,
        padding: '1.5rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="animate-scale-up"
        style={{
          width: '100%',
          maxWidth: activeWidth,
          background: 'var(--semob-surface)',
          border: '1px solid var(--semob-border)',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 40px rgba(37, 99, 235, 0.02)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--semob-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '0.5rem',
                background: activeConfig.bgLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: activeConfig.color,
                flexShrink: 0
              }}
            >
              <IconComponent size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--semob-text)', margin: 0 }}>
              {title}
            </h3>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--semob-text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--semob-text)';
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--semob-text-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: '70vh', color: 'var(--semob-text)', fontSize: '0.92rem', lineHeight: '1.6' }}>
          {children}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--semob-border)',
            background: 'var(--semob-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem'
          }}
        >
          {actions ? (
            actions
          ) : (
            <Button variant="outline" size="sm" onClick={onClose}>
              Fechar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
export default Popup;
