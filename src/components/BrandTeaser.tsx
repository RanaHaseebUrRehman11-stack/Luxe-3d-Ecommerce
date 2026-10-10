import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface BrandTeaserProps {
  onSelectCategory: (category: 'perfume' | 'jewelry') => void;
}

export default function BrandTeaser({ onSelectCategory }: BrandTeaserProps) {
  const handleTeaserClick = (category: 'perfume' | 'jewelry') => {
    onSelectCategory(category);
    const element = document.getElementById('collection-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="brand-teasers"
      style={{
        padding: '6rem 0',
        background: 'var(--bg-dark)',
        position: 'relative'
      }}
    >
      <div className="container-luxe">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="subtitle">Curated Collections</span>
          <h2
            style={{
              fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
              fontFamily: 'var(--font-serif)',
              fontWeight: 400
            }}
          >
            The Dual Pillars of <span className="text-gradient-gold">LUXE</span>
          </h2>
          <div className="gold-divider" />
          <p
            style={{
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto',
              fontSize: '0.95rem'
            }}
          >
            Explore our signature olfactory compositions and handcrafted high jewelry heirlooms.
          </p>
        </div>

        {/* Side-by-side Teaser Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem'
          }}
        >
          {/* Perfumes Teaser Card */}
          <div
            onClick={() => handleTeaserClick('perfume')}
            className="luxe-card"
            style={{
              height: '480px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '2.5rem',
              cursor: 'pointer',
              position: 'relative',
              borderRadius: '0px',
              backgroundImage: 'linear-gradient(to top, rgba(13, 13, 13, 0.95) 0%, rgba(13, 13, 13, 0.3) 60%, transparent 100%), url("https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1200")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(13, 13, 13, 0.7)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--border-gold)',
                padding: '6px 14px',
                color: 'var(--accent-gold)',
                fontSize: '0.7rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase'
              }}
            >
              Haute Parfumerie
            </div>

            <div style={{ position: 'relative', zIndex: 2 }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', color: 'var(--accent-gold)' }}>
                Collection I
              </span>
              <h3
                style={{
                  fontSize: '2.2rem',
                  fontFamily: 'var(--font-serif)',
                  margin: '0.4rem 0 1rem 0'
                }}
              >
                Parfums de Extrait
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '380px' }}>
                Hand-poured rare botanical essences encapsulated in crystal flacons with 24K gold foil flakes.
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--accent-gold)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em'
                }}
              >
                <span>Discover Perfumes</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>

          {/* Jewelry Teaser Card */}
          <div
            onClick={() => handleTeaserClick('jewelry')}
            className="luxe-card"
            style={{
              height: '480px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '2.5rem',
              cursor: 'pointer',
              position: 'relative',
              borderRadius: '0px',
              backgroundImage: 'linear-gradient(to top, rgba(13, 13, 13, 0.95) 0%, rgba(13, 13, 13, 0.3) 60%, transparent 100%), url("https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(13, 13, 13, 0.7)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--border-gold)',
                padding: '6px 14px',
                color: 'var(--accent-gold)',
                fontSize: '0.7rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase'
              }}
            >
              Joaillerie Royale
            </div>

            <div style={{ position: 'relative', zIndex: 2 }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', color: 'var(--accent-gold)' }}>
                Collection II
              </span>
              <h3
                style={{
                  fontSize: '2.2rem',
                  fontFamily: 'var(--font-serif)',
                  margin: '0.4rem 0 1rem 0'
                }}
              >
                Fine Solitaire Jewelry
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '380px' }}>
                Conflict-free VVS solitaire diamonds set in 18K solid gold and platinum by Italian master goldsmiths.
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--accent-gold)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em'
                }}
              >
                <span>Explore Jewelry</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
