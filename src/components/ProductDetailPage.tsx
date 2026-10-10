import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, SAMPLE_PRODUCTS } from '../lib/firebase';
import { Product, ProductVariant } from '../types';
import Product3DViewer from './3d/Product3DViewer';
import { ShoppingBag, Heart, ShieldCheck, Truck, Sparkles, Box, Check, ArrowLeft, Gem, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProductDetailPageProps {
  productId: string;
  onAddToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  onRequireAuth: (msg: string) => void;
  onNavigateHome: () => void;
  onNavigateCategory: (category: string) => void;
}

export default function ProductDetailPage({
  productId,
  onAddToCart,
  onRequireAuth,
  onNavigateHome,
  onNavigateCategory
}: ProductDetailPageProps) {
  const { currentUser, toggleWishlist, isInWishlist } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // View modes: '3d' or image index (0, 1, etc.)
  const [activeMedia, setActiveMedia] = useState<'3d' | number>('3d');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [isButtonPressed, setIsButtonPressed] = useState<boolean>(false);

  const inWishlist = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);

      // Check if ID matches a sample product
      const sampleMatch = SAMPLE_PRODUCTS.find(
        (p, idx) => `sample-${idx + 1}` === productId || `sample-perfume-${idx + 1}` === productId || `sample-jewelry-${idx + 1}` === productId
      );

      if (sampleMatch) {
        const fullProd: Product = { ...sampleMatch, id: productId };
        setProduct(fullProd);
        if (fullProd.variants.length > 0) {
          setSelectedVariant(fullProd.variants[0]);
        }
        setLoading(false);
        return;
      }

      // Try fetching from Firestore by doc ID
      try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const fetchedProd: Product = {
            id: docSnap.id,
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
          };
          setProduct(fetchedProd);
          if (fetchedProd.variants.length > 0) {
            setSelectedVariant(fetchedProd.variants[0]);
          }
        } else {
          // Fallback to sample
          const fallback = SAMPLE_PRODUCTS[0];
          setProduct({ ...fallback, id: productId });
          if (fallback.variants.length > 0) setSelectedVariant(fallback.variants[0]);
        }
      } catch (err) {
        console.error("Error fetching product detail from Firestore:", err);
        const fallback = SAMPLE_PRODUCTS[0];
        setProduct({ ...fallback, id: productId });
        if (fallback.variants.length > 0) setSelectedVariant(fallback.variants[0]);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  const handleAddToCartClick = () => {
    if (!product) return;
    if (!currentUser) {
      onRequireAuth('Please sign in to acquire masterpieces into your vault bag.');
      return;
    }

    setIsButtonPressed(true);
    onAddToCart(product, selectedVariant, quantity);
    setIsAdded(true);

    setTimeout(() => {
      setIsButtonPressed(false);
    }, 200);

    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleWishlistClick = async () => {
    if (!product) return;
    if (!currentUser) {
      onRequireAuth('Please sign in to save items to your wishlist vault.');
      return;
    }
    await toggleWishlist(product.id);
  };

  const formatPKR = (amount: number) => `PKR ${amount.toLocaleString()}`;

  if (loading) {
    return (
      <div style={{ paddingTop: '120px', paddingBottom: '6rem', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin" style={{ width: '48px', height: '48px', border: '2px solid var(--accent-gold)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 1rem auto' }} />
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}>Loading Masterpiece Details...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const isPerfume = product.category === 'perfume';

  return (
    <div style={{ paddingTop: '110px', paddingBottom: '6rem', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <div className="container-luxe">
        
        {/* Navigation Breadcrumb Bar */}
        <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <button
              onClick={onNavigateHome}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-gold)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              Home
            </button>
            <span>/</span>
            <button
              onClick={() => onNavigateCategory(product.category)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, textTransform: 'capitalize' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-gold)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              {product.category === 'perfume' ? 'Perfumes' : 'Jewelry'}
            </button>
            <span>/</span>
            <span style={{ color: 'var(--accent-gold)', fontWeight: 500 }}>{product.name}</span>
          </div>

          <button
            onClick={() => onNavigateCategory(product.category)}
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
            <span>Back to Collection</span>
          </button>
        </div>

        {/* Main Product Showcase Layout (Responsive Grid: 3D Side-by-Side on Desktop, Stacked on Mobile) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
            gap: '3.5rem',
            alignItems: 'start',
            marginBottom: '6rem'
          }}
          className="product-detail-grid"
        >
          
          {/* Left Side: 3D Viewer / Media Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Viewer Canvas Wrapper */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '500px',
                backgroundColor: '#0a0a0a',
                border: '1px solid var(--border-gold)',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-deep)'
              }}
            >
              {activeMedia === '3d' ? (
                <Product3DViewer
                  category={product.category}
                  accentColor="#d4af37"
                  model3dUrl={product.model3dUrl}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <img
                    src={product.images[activeMedia as number] || product.images[0]}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '16px',
                      background: 'rgba(13, 13, 13, 0.8)',
                      backdropFilter: 'blur(8px)',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: '1px solid var(--border-gold)',
                      color: 'var(--accent-gold)',
                      fontSize: '0.72rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em'
                    }}
                  >
                    Atelier High-Res Photography
                  </div>
                </div>
              )}

              {/* Wishlist Heart Icon Button Overlay */}
              <button
                onClick={handleWishlistClick}
                title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist Vault'}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  zIndex: 10,
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: inWishlist ? 'var(--accent-gold)' : 'rgba(13, 13, 13, 0.8)',
                  border: '1px solid var(--accent-gold)',
                  backdropFilter: 'blur(8px)',
                  color: inWishlist ? '#0d0d0d' : 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
                }}
              >
                <Heart size={20} fill={inWishlist ? '#0d0d0d' : 'none'} />
              </button>
            </div>

            {/* Media Selector Thumbnails (3D Toggle + Image Gallery) */}
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '6px' }}>
              
              {/* 3D Model Selector Tile */}
              <button
                onClick={() => setActiveMedia('3d')}
                style={{
                  minWidth: '80px',
                  height: '80px',
                  borderRadius: '10px',
                  border: activeMedia === '3d' ? '2px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                  background: activeMedia === '3d' ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  color: activeMedia === '3d' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Box size={20} />
                <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
                  3D View
                </span>
              </button>

              {/* High-res Image Tiles */}
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveMedia(idx)}
                  style={{
                    minWidth: '80px',
                    height: '80px',
                    borderRadius: '10px',
                    border: activeMedia === idx ? '2px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                    padding: 0,
                    overflow: 'hidden',
                    background: '#111',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>

            {/* Certification & Delivery Badges */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginTop: '0.5rem',
                padding: '1.25rem',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(212, 175, 55, 0.15)',
                borderRadius: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} color="var(--accent-gold)" />
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>Maison Authenticity</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Certified Hologram Serial Included</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Truck size={20} color="var(--accent-gold)" />
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>White-Glove Shipping</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Armored Courier with Full Insurance</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Side: Product Info & Purchasing Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            
            {/* Category Subtitle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={14} color="var(--accent-gold)" />
              <span className="subtitle" style={{ margin: 0, fontSize: '0.75rem' }}>
                LUXE {product.category.toUpperCase()} MASTERPIECE
              </span>
            </div>

            {/* Product Title */}
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                fontWeight: 500,
                color: '#ffffff',
                lineHeight: 1.1,
                margin: 0
              }}
            >
              {product.name}
            </h1>

            {/* Price Display */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '2.2rem',
                  fontWeight: 700,
                  color: 'var(--accent-gold)',
                  letterSpacing: '0.02em'
                }}
              >
                {formatPKR(product.price * quantity)}
              </span>
              {quantity > 1 && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  ({formatPKR(product.price)} each)
                </span>
              )}
            </div>

            <div style={{ width: '100%', height: '1px', background: 'var(--border-subtle)' }} />

            {/* Full Description */}
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '1rem',
                lineHeight: 1.75,
                fontWeight: 300,
                margin: 0
              }}
            >
              {product.description}
            </p>

            {/* Variant Selector as Elegant Pill-Style Buttons */}
            {product.variants.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label
                    style={{
                      fontSize: '0.78rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.18em',
                      color: 'var(--accent-gold)',
                      fontWeight: 600
                    }}
                  >
                    Select {product.variants[0].name}
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Selected: {selectedVariant?.value}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {product.variants.map((variant, idx) => {
                    const isSelected = selectedVariant?.value === variant.value;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedVariant(variant)}
                        style={{
                          padding: '0.85rem 1.5rem',
                          borderRadius: '30px',
                          background: isSelected ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.22), rgba(212, 175, 55, 0.08))' : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected ? '1px solid var(--accent-gold)' : '1px solid rgba(255, 255, 255, 0.12)',
                          color: isSelected ? 'var(--accent-gold)' : 'var(--text-primary)',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.85rem',
                          fontWeight: isSelected ? 600 : 400,
                          cursor: 'pointer',
                          transition: 'all 0.25s ease',
                          boxShadow: isSelected ? '0 0 15px rgba(212, 175, 55, 0.2)' : 'none'
                        }}
                      >
                        {variant.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                style={{
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  color: 'var(--accent-gold)',
                  fontWeight: 600
                }}
              >
                Quantity
              </label>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: '30px',
                  width: 'fit-content',
                  padding: '4px'
                }}
              >
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  -
                </button>

                <span
                  style={{
                    padding: '0 1.25rem',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    minWidth: '40px',
                    textAlign: 'center'
                  }}
                >
                  {quantity}
                </span>

                <button
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  +
                </button>
              </div>
            </div>

            {/* Main Action Buttons ("Add to Cart" + "Add to Wishlist") */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                onClick={handleAddToCartClick}
                className="btn-luxe"
                style={{
                  flex: 1,
                  padding: '1.2rem 2rem',
                  fontSize: '0.85rem',
                  letterSpacing: '0.18em',
                  transform: isButtonPressed ? 'scale(0.97)' : 'scale(1)',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {isAdded ? (
                  <>
                    <Check size={20} />
                    <span>Acquired Into Vault Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={20} />
                    <span>Acquire Masterpiece</span>
                  </>
                )}
              </button>

              <button
                onClick={handleWishlistClick}
                style={{
                  padding: '0 1.5rem',
                  backgroundColor: inWishlist ? 'var(--accent-gold)' : 'rgba(212, 175, 55, 0.08)',
                  border: '1px solid var(--accent-gold)',
                  borderRadius: '30px',
                  color: inWishlist ? '#0d0d0d' : 'var(--accent-gold)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.25s ease'
                }}
                title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist Vault'}
              >
                <Heart size={22} fill={inWishlist ? '#0d0d0d' : 'none'} />
              </button>
            </div>

          </div>

        </div>

        {/* Scroll-Triggered Craftsmanship Story Section */}
        <section
          style={{
            marginTop: '4rem',
            padding: '4.5rem 3rem',
            backgroundColor: '#121212',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '20px',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
          }}
          className="craftsmanship-story-section"
        >
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Gem size={18} color="var(--accent-gold)" />
              <span className="subtitle" style={{ margin: 0 }}>L'Art de la Haute Perfumerie & Joaillerie</span>
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                fontWeight: 400,
                color: '#ffffff',
                marginBottom: '1.5rem'
              }}
            >
              The Legacy of Master Craftsmanship
            </h2>

            <div className="gold-divider" style={{ margin: '0 auto 2.5rem auto' }} />

            {/* 3 Story Paragraphs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', textAlign: 'left', color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.02rem', fontWeight: 300 }}>
              <p>
                Every single creation bearing the <strong style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>LUXE</strong> seal begins in the legendary ateliers of Grasse and Milan. Our master perfumers select hand-picked May Roses harvested strictly at dawn when their natural oils achieve apex concentration, pairing them with century-aged wild Cambodian Oud resin.
              </p>

              <p>
                In our high jewelry workshops, master goldsmiths meticulously hand-hammer 18K solid yellow gold and hand-set flawless VVS1 brilliant diamonds under high-magnification stereoscopic lenses. Each setting is engineered to capture maximum ambient light, producing an unyielding, ethereal sparkle.
              </p>

              <p>
                When you hold a LUXE creation, you become part of an unbroken lineage of haute artistry. Each flacon and jewelry casing is individually numbered and accompanied by an authenticated Maison hologram certificate, guaranteeing timeless value and white-glove provenance for generations.
              </p>
            </div>

            <div
              style={{
                marginTop: '3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2rem',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <Award size={24} color="var(--accent-gold)" style={{ margin: '0 auto 6px auto' }} />
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>Grasse Guild Certified</div>
              </div>
              <div style={{ width: '1px', height: '36px', background: 'var(--border-subtle)' }} />
              <div style={{ textAlign: 'center' }}>
                <ShieldCheck size={24} color="var(--accent-gold)" style={{ margin: '0 auto 6px auto' }} />
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>VVS1 Solitaire Guarantee</div>
              </div>
            </div>

          </div>
        </section>

      </div>

      <style>{`
        @media (max-width: 992px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
