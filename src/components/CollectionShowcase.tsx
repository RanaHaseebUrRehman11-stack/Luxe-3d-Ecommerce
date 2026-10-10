import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db, seedProductsIfEmpty, SAMPLE_PRODUCTS } from '../lib/firebase';
import { Product } from '../types';
import { Eye, ShoppingBag, Check, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CollectionShowcaseProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onRequireAuth: (msg: string) => void;
}

export default function CollectionShowcase({
  activeCategory,
  onSelectCategory,
  onQuickView,
  onAddToCart,
  onRequireAuth
}: CollectionShowcaseProps) {
  const { currentUser, toggleWishlist, isInWishlist } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let unsubscribe: () => void;

    async function initAndFetch() {
      setLoading(true);

      const fallbackList: Product[] = SAMPLE_PRODUCTS.map((p, idx) => ({
        ...p,
        id: `sample-${idx + 1}`
      }));

      // Ensure products are seeded if Firestore collection is currently empty
      await seedProductsIfEmpty();

      try {
        const q = query(collection(db, 'products'));
        unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedProducts: Product[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            fetchedProducts.push({
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
          });
          if (fetchedProducts.length > 0) {
            setProducts(fetchedProducts);
          } else {
            setProducts(fallbackList);
          }
          setLoading(false);
        }, (error) => {
          console.error("Firestore listener error:", error);
          setProducts(fallbackList);
          setLoading(false);
        });
      } catch (err) {
        console.error("Error setting up firestore listener:", err);
        setProducts(fallbackList);
        setLoading(false);
      }
    }

    initAndFetch();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const filteredProducts = products.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
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

  const formatPKR = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  return (
    <section
      id="collection-section"
      style={{
        padding: '6rem 0',
        background: 'var(--bg-surface)',
        position: 'relative'
      }}
    >
      <div className="container-luxe">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="subtitle">Live Firestore Catalog</span>
          <h2
            style={{
              fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
              fontFamily: 'var(--font-serif)',
              fontWeight: 400
            }}
          >
            The Permanent Collection
          </h2>
          <div className="gold-divider" />
        </div>

        {/* Category Filter Tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '3.5rem',
            flexWrap: 'wrap'
          }}
        >
          {[
            { id: 'all', label: 'All Masterpieces' },
            { id: 'perfume', label: 'Haute Perfumes' },
            { id: 'jewelry', label: 'Fine Jewelry' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectCategory(tab.id)}
              style={{
                padding: '0.75rem 1.75rem',
                background: activeCategory === tab.id ? 'var(--accent-gold)' : 'transparent',
                color: activeCategory === tab.id ? 'var(--bg-dark)' : 'var(--text-primary)',
                border: activeCategory === tab.id ? '1px solid var(--accent-gold)' : '1px solid var(--border-gold)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State Skeleton */}
        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '2.5rem'
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                style={{
                  height: '420px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  animation: 'pulseGold 2s infinite ease-in-out'
                }}
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 0',
              color: 'var(--text-muted)'
            }}
          >
            No creations found in this category.
          </div>
        ) : (
          /* Products Grid */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '2.5rem'
            }}
          >
            {filteredProducts.map((product) => {
              const inWishlist = isInWishlist(product.id);
              return (
                <div
                  key={product.id}
                  className="luxe-card"
                  onClick={() => onQuickView(product)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer'
                  }}
                >
                  {/* Product Image Area */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '320px',
                      overflow: 'hidden',
                      background: '#111'
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
                        background: 'rgba(13, 13, 13, 0.8)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid var(--border-gold)',
                        padding: '4px 10px',
                        fontSize: '0.65rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.18em',
                        color: 'var(--accent-gold)'
                      }}
                    >
                      {product.category}
                    </span>

                    {/* Wishlist Toggle Heart Button */}
                    <button
                      onClick={(e) => handleWishlistToggle(product, e)}
                      aria-label="Save to Wishlist"
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        zIndex: 4,
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: inWishlist ? 'var(--accent-gold)' : 'rgba(13, 13, 13, 0.75)',
                        border: '1px solid var(--accent-gold)',
                        backdropFilter: 'blur(8px)',
                        color: inWishlist ? '#0d0d0d' : 'var(--accent-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    >
                      <Heart size={16} fill={inWishlist ? '#0d0d0d' : 'none'} />
                    </button>

                    {/* Hover Quick Action overlay */}
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
                          onQuickView(product);
                        }}
                        className="btn-luxe btn-outline"
                        style={{
                          flex: 1,
                          padding: '0.6rem 0.8rem',
                          fontSize: '0.7rem',
                          background: 'rgba(13, 13, 13, 0.85)',
                          backdropFilter: 'blur(8px)'
                        }}
                      >
                        <Eye size={14} />
                        <span>Details</span>
                      </button>

                      <button
                        onClick={(e) => handleAddWithFeedback(product, e)}
                        className="btn-luxe"
                        style={{
                          padding: '0.6rem 1rem',
                          fontSize: '0.7rem'
                        }}
                      >
                        {addedIds[product.id] ? <Check size={14} /> : <ShoppingBag size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Product Meta Info */}
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <h3
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.25rem',
                        color: 'var(--text-primary)'
                      }}
                    >
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
                        lineHeight: 1.5
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
                      <span
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          color: 'var(--accent-gold)'
                        }}
                      >
                        {formatPKR(product.price)}
                      </span>

                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {product.variants[0] ? `${product.variants[0].name}: ${product.variants[0].value}` : ''}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
