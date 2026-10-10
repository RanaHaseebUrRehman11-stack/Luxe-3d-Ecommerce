import React from 'react';
import { Product } from '../types';
import { ShoppingBag, Heart, Trash2, Sparkles, ArrowLeft, ArrowRight, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface WishlistPageProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onSelectProduct: (productId: string) => void;
  onRequireAuth: (msg: string) => void;
  onNavigateHome: () => void;
  onNavigateCategory: (category: string) => void;
  onShowToast?: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function WishlistPage({
  products,
  onAddToCart,
  onSelectProduct,
  onRequireAuth,
  onNavigateHome,
  onNavigateCategory,
  onShowToast
}: WishlistPageProps) {
  const { currentUser, userProfile, toggleWishlist, isInWishlist } = useAuth();

  const wishlistIds = userProfile?.wishlist || [];
  // Match products in wishlist. If full catalog isn't yet loaded, we fall back to products array
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  const formatPKR = (amount: number) => `PKR ${amount.toLocaleString()}`;

  const handleRemove = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      onRequireAuth('Please sign in to manage your wishlist vault.');
      return;
    }
    await toggleWishlist(product.id);
    if (onShowToast) {
      onShowToast(`Removed "${product.name}" from your Wishlist Vault`, 'info');
    }
  };

  const handleMoveToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      onRequireAuth('Please sign in to add items to your cart.');
      return;
    }
    onAddToCart(product);
    if (onShowToast) {
      onShowToast(`✨ "${product.name}" acquired into your Vault Bag!`, 'success');
    }
  };

  return (
    <div style={{ paddingTop: '110px', paddingBottom: '6rem', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <div className="container-luxe">
        
        {/* Breadcrumb Navigation */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <button
              onClick={onNavigateHome}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-gold)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              Home
            </button>
            <span>/</span>
            <span style={{ color: 'var(--accent-gold)' }}>Wishlist Vault</span>
          </div>

          <button
            onClick={onNavigateHome}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-gold)',
              color: 'var(--accent-gold)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={14} />
            <span>Continue Shopping</span>
          </button>
        </div>

        {/* Hero Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '3.5rem',
            padding: '3.5rem 2rem',
            background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.08) 0%, rgba(13, 13, 13, 0.95) 75%)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={16} color="var(--accent-gold)" />
            <span className="subtitle" style={{ margin: 0 }}>Private Curator Collection</span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
              fontWeight: 400,
              margin: '0.5rem 0 1rem 0'
            }}
          >
            Wishlist Vault
          </h1>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              maxWidth: '640px',
              margin: '0 auto',
              lineHeight: 1.7
            }}
          >
            Your hand-selected vault of haute perfumerie and 18K fine jewelry creations.
          </p>

          <div className="gold-divider" style={{ margin: '1.75rem auto 0 auto' }} />
        </div>

        {/* Wishlist Items Count Bar */}
        {wishlistProducts.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '2.5rem',
              padding: '1rem 1.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-gold)',
              borderRadius: '12px'
            }}
          >
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Saved Creations in Vault: <strong style={{ color: 'var(--accent-gold)' }}>{wishlistProducts.length}</strong>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Reserved for your session • Free armored express shipping
            </div>
          </div>
        )}

        {/* Wishlist Grid or Empty State */}
        {wishlistProducts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '5rem 2rem',
              backgroundColor: 'rgba(255, 255, 255, 0.015)',
              border: '1px dashed rgba(212, 175, 55, 0.25)',
              borderRadius: '16px',
              maxWidth: '600px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.25rem'
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(212, 175, 55, 0.08)',
                border: '1px solid var(--border-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)'
              }}
            >
              <Heart size={32} />
            </div>

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#ffffff', margin: 0 }}>
              Your Wishlist Vault is Empty
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
              Explore our master-crafted fragrances and fine solitaire jewelry to save your desired pieces.
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => onNavigateCategory('perfume')}
                className="btn-luxe"
                style={{ padding: '0.8rem 1.6rem', fontSize: '0.78rem' }}
              >
                <span>Explore Haute Perfumes</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => onNavigateCategory('jewelry')}
                className="btn-luxe btn-outline"
                style={{ padding: '0.8rem 1.6rem', fontSize: '0.78rem' }}
              >
                <span>Explore Fine Jewelry</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '2.5rem'
            }}
          >
            {wishlistProducts.map((product) => {
              const inWishlist = isInWishlist(product.id);
              return (
                <div
                  key={product.id}
                  className="luxe-card"
                  onClick={() => onSelectProduct(product.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {/* Image Container */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '320px',
                      overflow: 'hidden',
                      background: '#0e0e0e'
                    }}
                  >
                    <img
                      src={product.images[0] || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800'}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                      onMouseOver={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)';
                      }}
                      onMouseOut={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                      }}
                    />

                    {/* Category Tag */}
                    <span
                      style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        background: 'rgba(13, 13, 13, 0.85)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid var(--border-gold)',
                        padding: '4px 10px',
                        fontSize: '0.65rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.18em',
                        color: 'var(--accent-gold)',
                        borderRadius: '4px'
                      }}
                    >
                      {product.category === 'perfume' ? 'FLACON DE PARFUM' : 'HAUTE JOAILLERIE'}
                    </span>

                    {/* Wishlist Heart Toggle */}
                    <button
                      onClick={(e) => handleRemove(product, e)}
                      title="Remove from Wishlist Vault"
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        zIndex: 4,
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-gold)',
                        border: '1px solid var(--accent-gold)',
                        backdropFilter: 'blur(8px)',
                        color: '#0d0d0d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      <Heart size={16} fill="#0d0d0d" />
                    </button>

                    {/* Quick View Button Overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '16px',
                        left: '16px',
                        right: '16px',
                        display: 'flex',
                        gap: '8px',
                        zIndex: 3
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(product.id);
                        }}
                        className="btn-luxe btn-outline"
                        style={{
                          flex: 1,
                          padding: '0.65rem 0.8rem',
                          fontSize: '0.72rem',
                          background: 'rgba(13, 13, 13, 0.85)',
                          backdropFilter: 'blur(8px)'
                        }}
                      >
                        <Eye size={14} />
                        <span>View Details</span>
                      </button>

                      <button
                        onClick={(e) => handleMoveToCart(product, e)}
                        className="btn-luxe"
                        style={{
                          padding: '0.65rem 1rem',
                          fontSize: '0.72rem'
                        }}
                        title="Acquire Into Vault Bag"
                      >
                        <ShoppingBag size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--text-primary)', margin: 0 }}>
                      {product.name}
                    </h3>

                    <p
                      style={{
                        fontSize: '0.825rem',
                        color: 'var(--text-muted)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.5,
                        margin: 0
                      }}
                    >
                      {product.description}
                    </p>

                    <div
                      style={{
                        marginTop: 'auto',
                        paddingTop: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid var(--border-subtle)'
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--accent-gold)' }}>
                        {formatPKR(product.price)}
                      </span>

                      <button
                        onClick={(e) => handleRemove(product, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
