import React, { useEffect } from 'react';
import { Sparkles, X, CheckCircle2, AlertCircle } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 300,
        backgroundColor: '#161616',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 12px 36px rgba(0,0,0,0.85), 0 0 20px rgba(212, 175, 55, 0.1)',
        maxWidth: '380px',
        color: '#ffffff',
        animation: 'toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'rgba(212, 175, 55, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-gold)',
          flexShrink: 0
        }}
      >
        {toast.type === 'success' ? (
          <CheckCircle2 size={18} style={{ color: '#4ade80' }} />
        ) : toast.type === 'warning' ? (
          <AlertCircle size={18} style={{ color: '#f87171' }} />
        ) : (
          <Sparkles size={18} />
        )}
      </div>

      <div style={{ flex: 1, fontSize: '0.85rem', lineHeight: 1.4, color: '#e5e5e5' }}>
        {toast.message}
      </div>

      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <X size={16} />
      </button>

      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
