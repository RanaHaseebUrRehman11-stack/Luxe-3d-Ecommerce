import React, { useState } from 'react';
import { Product, ProductVariant } from '../types';
import { X, ShoppingBag, Check, Heart, Shield, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  onRequireAuth: (msg: string) => void;
}

export default function ProductQuickViewModal({
  product,
  onClose,
  onAddToCart,
  onRequireAuth
}: ProductQuickViewModalProps) {
  if (!product) return null;

  const { currentUser, toggleWishlist, isInWishlist } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (!currentUser) {
      onRequireAuth('Please sign in to add items to your cart.');
      return;
    }
    onAddToCart(product, selectedVariant, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1800);
  };

  const handleWishlistClick = async () => {
    if (!currentUser) {
      onRequireAuth('Please sign in to save items to your wishlist vault.');
      return;
    }
    await toggleWishlist(product.id);
  };

  const formatPKR = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-gold)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          position: 'relative',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-deep)',
          borderRadius: '12px'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            background: 'rgba(13, 13, 13, 0.8)',
            border: '1px solid var(--border-gold)',
            color: 'var(--text-primary)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'var(--transition-fast)'
          }}
        >
          <X size={18} />
        </button>

        {/* Left Column: Image Gallery */}
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#0a0a0a' }}>
          <div
            style={{
              width: '100%',
              height: '380px',
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px'
            }}
          >
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />

            {/* Wishlist Heart overlay */}
            <button
              onClick={handleWishlistClick}
              title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: inWishlist ? 'var(--accent-gold)' : 'rgba(13, 13, 13, 0.8)',
                border: '1px solid var(--accent-gold)',
                color: inWishlist ? '#0d0d0d' : 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
            >
              <Heart size={18} fill={inWishlist ? '#0d0d0d' : 'none'} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '10px' }}>
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  style={{
                    width: '60px',
                    height: '60px',
                    border: activeImageIndex === idx ? '2px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                    padding: 0,
                    background: 'none',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    overflow: 'hidden'
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}

          {/* Guarantees */}
          <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <Shield size={14} color="var(--accent-gold)" />
              <span>Certified Authentic</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <Truck size={14} color="var(--accent-gold)" />
              <span>White-Glove Delivery</span>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Purchasing */}
        <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <span className="subtitle" style={{ fontSize: '0.7rem' }}>
              LUXE {product.category.toUpperCase()}
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '0.5rem' }}>
              {product.name}
            </h2>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent-gold)' }}>
              {formatPKR(product.price * quantity)}
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            {product.description}
          </p>

          {/* Variant Selector */}
          {product.variants.length > 0 && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Select {product.variants[0].name}
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {product.variants.map((variant, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedVariant(variant)}
                    style={{
                      padding: '8px 16px',
                      background: selectedVariant?.value === variant.value ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                      border: selectedVariant?.value === variant.value ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                      color: selectedVariant?.value === variant.value ? 'var(--accent-gold)' : 'var(--text-primary)',
                      fontSize: '0.8rem',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    {variant.value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Controls */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Quantity
            </label>
            <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border-gold)', borderRadius: '6px' }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: '8px 16px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                -
              </button>
              <span style={{ padding: '8px 16px', fontSize: '0.9rem', fontWeight: 600 }}>{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                style={{ padding: '8px 16px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                +
              </button>
            </div>
          </div>

          {/* Add To Cart & Wishlist Actions */}
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', gap: '12px' }}>
            <button
              onClick={handleAddToCart}
              className="btn-luxe"
              style={{ flex: 1, padding: '1.1rem' }}
            >
              {isAdded ? (
                <>
                  <Check size={18} />
                  <span>Added To Vault Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  <span>Acquire Masterpiece</span>
                </>
              )}
            </button>

            <button
              onClick={handleWishlistClick}
              style={{
                padding: '0 1.25rem',
                backgroundColor: inWishlist ? 'var(--accent-gold)' : 'rgba(212, 175, 55, 0.1)',
                border: '1px solid var(--accent-gold)',
                borderRadius: '6px',
                color: inWishlist ? '#0d0d0d' : 'var(--accent-gold)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              title="Save to Wishlist"
            >
              <Heart size={20} fill={inWishlist ? '#0d0d0d' : 'none'} />
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
