import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = '540px',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(2px)',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        style={{
          width: '100%',
          maxWidth: width,
          maxHeight: '90vh',
          backgroundColor: 'var(--color-bg-subtle)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-border-default)',
            backgroundColor: 'var(--color-bg-canvas)',
          }}
        >
          <h3
            id="modal-title"
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-text-heading)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '16px',
            overflowY: 'auto',
            flex: 1,
            fontSize: '13px',
            lineHeight: 1.5,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
