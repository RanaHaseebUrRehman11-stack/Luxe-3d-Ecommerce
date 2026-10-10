import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db, seedProductsIfEmpty, SAMPLE_PRODUCTS } from '../lib/firebase';
import { Product } from '../types';
import { ShoppingBag, Eye, Heart, Sparkles, ArrowUpDown, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface JewelryCollectionPageProps {
  onSelectProduct: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onRequireAuth: (msg: string) => void;
  onNavigateHome: () => void;
}

export default function JewelryCollectionPage({
  onSelectProduct,
  onAddToCart,
  onRequireAuth,
  onNavigateHome
}: JewelryCollectionPageProps) {
  const { currentUser, toggleWishlist, isInWishlist } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let unsubscribe: () => void;

    async function fetchJewelry() {
      setLoading(true);

      const fallbackJewelry: Product[] = SAMPLE_PRODUCTS
        .filter((p) => p.category === 'jewelry')
        .map((p, idx) => ({ ...p, id: `sample-jewelry-${idx + 1}` }));

      await seedProductsIfEmpty();

      try {
        const q = query(collection(db, 'products'));
        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const fetched: Product[] = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              if (data.category === 'jewelry') {
                fetched.push({
                  id: doc.id,
                  name: data.name,
                  category: data.category,
                  price: data.price,
                  description: data.description,
                  images: data.images || [],
                  model3dUrl: data.model3dUrl || '',
                  variants: data.variants || [],
                  stock: data.stock || 0,
                  createdAt: data.createdAt,
                  isFeatured: data.isFeatured
                });
              }
            });

            if (fetched.length > 0) {
              setProducts(fetched);
            } else {
              setProducts(fallbackJewelry);
            }
            setLoading(false);
          },
          (err) => {
            console.error('Firestore listener error on jewelry:', err);
            setProducts(fallbackJewelry);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Error fetching jewelry:', err);
        setProducts(fallbackJewelry);
        setLoading(false);
      }
    }

    fetchJewelry();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortOrder === 'price-asc') return a.price - b.price;
    if (sortOrder === 'price-desc') return b.price - a.price;
    return 0;
  });

  const handleAddWithFeedback = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      onRequireAuth('Please sign in to add items to your cart.');
      return;
    }
    onAddToCart(product);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  const handleWishlistToggle = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      onRequireAuth('Please sign in to save items to your wishlist vault.');
      return;
    }
    await toggleWishlist(product.id);
  };

  const formatPKR = (amount: number) => `PKR ${amount.toLocaleString()}`;

  return (
    <div style={{ paddingTop: '110px', paddingBottom: '6rem', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <div className="container-luxe">
        
        {/* Breadcrumb Navigation */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <button
            onClick={onNavigateHome}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-gold)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            Home
          </button>
          <span>/</span>
          <span style={{ color: 'var(--accent-gold)' }}>Fine Jewelry</span>
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
            <span className="subtitle" style={{ margin: 0 }}>Italian High Jewelry Ateliers</span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
              fontWeight: 400,
              margin: '0.5rem 0 1rem 0'
            }}
          >
            Fine Jewelry
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
            Masterpieces crafted in 18K solid gold, rare platinum, and ethically sourced certified VVS1 brilliant diamonds.
          </p>

          <div className="gold-divider" style={{ margin: '1.75rem auto 0 auto' }} />
        </div>

        {/* Filter / Sort Control Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2.5rem',
            padding: '1rem 1.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-gold)',
            borderRadius: '12px',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Showing <strong style={{ color: 'var(--accent-gold)' }}>{sortedProducts.length}</strong> Creations
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <ArrowUpDown size={14} color="var(--accent-gold)" />
              <span>Sort By Price:</span>
            </div>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              style={{
                background: '#161616',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-gold)',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                fontSize: '0.8rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="default">Featured Selection</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Grid of Product Cards */}
        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '2.5rem'
            }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: '420px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  animation: 'pulseGold 2s infinite ease-in-out'
                }}
              />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            No jewelry pieces found in live collection.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '2.5rem'
            }}
          >
            {sortedProducts.map((product) => {
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
                      height: '330px',
                      overflow: 'hidden',
                      background: '#0e0e0e'
                    }}
                  >
                    <img
                      src={product.images[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800'}
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
                      HAUTE JOAILLERIE
                    </span>

                    {/* Wishlist Heart */}
                    <button
                      onClick={(e) => handleWishlistToggle(product, e)}
                      aria-label="Wishlist"
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        zIndex: 4,
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: inWishlist ? 'var(--accent-gold)' : 'rgba(13, 13, 13, 0.8)',
                        border: '1px solid var(--accent-gold)',
                        backdropFilter: 'blur(8px)',
                        color: inWishlist ? '#0d0d0d' : 'var(--accent-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      <Heart size={16} fill={inWishlist ? '#0d0d0d' : 'none'} />
                    </button>

                    {/* Quick View buttons */}
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
                        onClick={(e) => handleAddWithFeedback(product, e)}
                        className="btn-luxe"
                        style={{
                          padding: '0.65rem 1rem',
                          fontSize: '0.72rem'
                        }}
                      >
                        {addedIds[product.id] ? <Check size={14} /> : <ShoppingBag size={14} />}
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

                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {product.variants[0] ? `${product.variants[0].name}: ${product.variants[0].value}` : 'Solid 18K Gold'}
                      </span>
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
