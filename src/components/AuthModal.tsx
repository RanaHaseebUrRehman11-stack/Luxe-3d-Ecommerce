import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  promptMessage?: string | null;
  onSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  promptMessage,
  onSuccess
}: AuthModalProps) {
  const { signInWithGoogle } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      await signInWithGoogle();
      setSuccessMessage('Authenticated successfully. Welcome to Maison LUXE.');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        setLoading(false);
        setSuccessMessage(null);
      }, 1000);
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please try again when ready.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else {
        setError(err.message || 'Unable to sign in with Google. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: 'rgba(5, 5, 5, 0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#121212',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '16px',
          padding: '2.75rem 2.25rem',
          position: 'relative',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(212, 175, 55, 0.08)',
          animation: 'scaleUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          color: 'var(--text-primary)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            color: 'var(--text-secondary)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: loading ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.color = 'var(--accent-gold)';
              e.currentTarget.style.borderColor = 'var(--accent-gold)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.2)';
          }}
        >
          <X size={18} />
        </button>

        {/* Brand Crest Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.18), rgba(212, 175, 55, 0.04))',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              color: 'var(--accent-gold)',
              marginBottom: '1rem',
              boxShadow: '0 0 20px rgba(212, 175, 55, 0.15)'
            }}
          >
            <Sparkles size={24} />
          </div>
          <h2
            className="text-gradient-gold"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.85rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              margin: '0 0 0.4rem 0'
            }}
          >
            MAISON LUXE
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase'
            }}
          >
            Private Member Vault
          </p>
        </div>

        {/* Prompt Message Banner if redirected */}
        {promptMessage && !successMessage && (
          <div
            style={{
              backgroundColor: 'rgba(212, 175, 55, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--accent-gold-light)',
              fontSize: '0.82rem'
            }}
          >
            <Sparkles size={16} style={{ flexShrink: 0 }} />
            <span>{promptMessage}</span>
          </div>
        )}

        {/* Success Feedback Alert */}
        {successMessage && (
          <div
            style={{
              backgroundColor: 'rgba(74, 222, 128, 0.1)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#4ade80',
              fontSize: '0.85rem',
              animation: 'fadeIn 0.3s ease'
            }}
          >
            <CheckCircle size={20} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#f87171',
              fontSize: '0.82rem',
              animation: 'fadeIn 0.2s ease'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign In Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.95rem 1.25rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
              opacity: loading ? 0.75 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.12)';
                e.currentTarget.style.borderColor = 'var(--accent-gold)';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(212, 175, 55, 0.2)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.35)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="spinner-gold" />
                <span style={{ color: 'var(--accent-gold-light)', fontWeight: 500 }}>Connecting to Google...</span>
              </div>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Security / Trust Footer */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <ShieldCheck size={14} style={{ color: 'var(--accent-gold)' }} />
          <span>Encrypted single-click authentication via Google</span>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .spinner-gold {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(212, 175, 55, 0.2);
          border-top-color: var(--accent-gold);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
