import React, { useState } from 'react';
import { CartItem } from '../types';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Sparkles, Plus, Minus } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onExploreCollections?: () => void;
  onProceedCheckout?: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onExploreCollections,
  onProceedCheckout
}: CartDrawerProps) {
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const formatPKR = (amount: number) => `PKR ${amount.toLocaleString()}`;

  const handleAnimateRemove = (index: number) => {
    setRemovingIndex(index);
    setTimeout(() => {
      onRemoveItem(index);
      setRemovingIndex(null);
    }, 280);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 250,
        backgroundColor: 'rgba(5, 5, 5, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'cartBackdropFade 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          backgroundColor: '#111111',
          borderLeft: '1px solid rgba(212, 175, 55, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          padding: '2rem 1.75rem',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.95)',
          position: 'relative',
          animation: 'cartDrawerSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid rgba(212, 175, 55, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} color="var(--accent-gold)" />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', margin: 0, letterSpacing: '0.05em' }}>
              Your Vault Bag ({totalItemCount})
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Cart"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              color: 'var(--text-primary)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Cart Items List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          {cartItems.length === 0 ? (
            <div
              style={{
                margin: 'auto 0',
                textAlign: 'center',
                color: 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.25rem',
                padding: '2rem 1rem'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(212, 175, 55, 0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-gold)'
                }}
              >
                <ShoppingBag size={28} />
              </div>

              <div>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: '#ffffff', margin: '0 0 0.5rem 0' }}>
                  Your vault bag is empty.
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '280px', margin: '0 auto', lineHeight: 1.5 }}>
                  Select an exquisite fragrance or fine solitaire creation to begin your collection.
                </p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  if (onExploreCollections) onExploreCollections();
                }}
                className="btn-luxe btn-outline"
                style={{ marginTop: '0.5rem', padding: '0.75rem 1.5rem', fontSize: '0.78rem' }}
              >
                <span>Explore Haute Collections</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            cartItems.map((item, idx) => {
              const isRemoving = removingIndex === idx;
              return (
                <div
                  key={`${item.product.id}-${item.selectedVariant?.value || 'default'}-${idx}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '84px 1fr auto',
                    gap: '1rem',
                    alignItems: 'center',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(212, 175, 55, 0.15)',
                    borderRadius: '10px',
                    transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                    opacity: isRemoving ? 0 : 1,
                    transform: isRemoving ? 'translateX(40px) scale(0.95)' : 'translateX(0) scale(1)',
                    maxHeight: isRemoving ? '0px' : '200px',
                    overflow: 'hidden'
                  }}
                >
                  {/* Image */}
                  <div style={{ width: '84px', height: '84px', borderRadius: '8px', overflow: 'hidden', background: '#1a1a1a', flexShrink: 0 }}>
                    <img
                      src={item.product.images[0] || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800'}
                      alt={item.product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Details */}
                  <div style={{ minWidth: 0 }}>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.98rem', margin: '0 0 4px 0', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.product.name}
                    </h4>

                    {item.selectedVariant && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', display: 'block', marginBottom: '4px' }}>
                        {item.selectedVariant.name}: {item.selectedVariant.value}
                      </span>
                    )}

                    <div style={{ fontSize: '0.88rem', color: 'var(--accent-gold-light)', fontWeight: 600, marginBottom: '8px' }}>
                      {formatPKR(item.product.price)}
                    </div>

                    {/* Quantity Stepper */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '4px', padding: '2px 6px' }}>
                      <button
                        onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: item.quantity <= 1 ? 'rgba(255, 255, 255, 0.2)' : 'var(--text-primary)',
                          cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '2px'
                        }}
                      >
                        <Minus size={12} />
                      </button>

                      <span style={{ fontSize: '0.82rem', fontWeight: 600, minWidth: '20px', textAlign: 'center', color: '#ffffff' }}>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '2px'
                        }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleAnimateRemove(idx)}
                    aria-label="Remove item"
                    title="Remove item"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.4)',
                      cursor: 'pointer',
                      padding: '8px',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary */}
        {cartItems.length > 0 && (
          <div
            style={{
              borderTop: '1px solid rgba(212, 175, 55, 0.2)',
              paddingTop: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Estimated Vault Total</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '1.35rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                {formatPKR(subtotal)}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={15} color="var(--accent-gold)" />
              <span>Complimentary insured express delivery & bespoke luxury gift presentation</span>
            </div>

            <button
              onClick={() => {
                if (onProceedCheckout) {
                  onProceedCheckout();
                } else {
                  alert(`Vault Bag Order Initiated! Total subtotal: ${formatPKR(subtotal)}. Payment & address checkout module enabled.`);
                }
              }}
              className="btn-luxe"
              style={{ width: '100%', marginTop: '0.25rem' }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

      </div>

      <style>{`
        @keyframes cartBackdropFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cartDrawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

