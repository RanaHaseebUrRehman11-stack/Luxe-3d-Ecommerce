import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export default function WishlistDrawer({
  isOpen,
  onClose,
  products,
  onAddToCart,
  onQuickView
}: WishlistDrawerProps) {
  const { userProfile, toggleWishlist } = useAuth();

  if (!isOpen) return null;

  const wishlistIds = userProfile?.wishlist || [];
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150,
        backgroundColor: 'rgba(5, 5, 5, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '100%',
          backgroundColor: '#121212',
          borderLeft: '1px solid rgba(212, 175, 55, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.9)',
          animation: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          color: 'var(--text-primary)'
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.5rem 2rem',
            borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Heart size={20} className="text-gradient-gold" style={{ color: 'var(--accent-gold)' }} />
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.35rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                margin: 0
              }}
            >
              Saved Treasures ({wishlistProducts.length})
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Wishlist"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              color: 'var(--text-secondary)',
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

        {/* Drawer Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          {wishlistProducts.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '3rem 1rem',
                gap: '1rem',
                color: 'var(--text-secondary)'
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
                <Heart size={28} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#ffffff', margin: 0 }}>
                Your Wishlist Vault is Empty
              </h3>
              <p style={{ fontSize: '0.85rem', maxWidth: '280px', lineHeight: 1.6 }}>
                Explore our haute perfumerie and fine jewelry collections to save your favorite creations.
              </p>
              <button
                onClick={onClose}
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: '1px solid var(--accent-gold)',
                  color: 'var(--accent-gold)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  cursor: 'pointer'
                }}
              >
                Explore Collections
              </button>
            </div>
          ) : (
            wishlistProducts.map((product) => (
              <div
                key={product.id}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(212, 175, 55, 0.15)',
                  borderRadius: '12px',
                  padding: '1rem',
                  alignItems: 'center',
                  transition: 'border-color 0.2s ease'
                }}
              >
                {/* Image */}
                <div
                  onClick={() => onQuickView(product)}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#1a1a1a',
                    flexShrink: 0,
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      color: 'var(--accent-gold)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em'
                    }}
                  >
                    {product.category}
                  </span>
                  <h4
                    onClick={() => onQuickView(product)}
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      margin: '2px 0 4px 0',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {product.name}
                  </h4>
                  <p
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: 'var(--accent-gold-light)',
                      margin: 0
                    }}
                  >
                    PKR {product.price.toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  <button
                    onClick={() => onAddToCart(product)}
                    title="Add to Cart"
                    style={{
                      background: 'rgba(212, 175, 55, 0.12)',
                      border: '1px solid var(--border-gold)',
                      color: 'var(--accent-gold)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                  >
                    <ShoppingBag size={14} />
                    <span>Cart</span>
                  </button>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    title="Remove from wishlist"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.4)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.7rem',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)')}
                  >
                    <Trash2 size={13} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
