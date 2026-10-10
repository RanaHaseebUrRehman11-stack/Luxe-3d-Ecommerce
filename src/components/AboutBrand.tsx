import React from 'react';
import { Award, Compass, Gem, Feather, ShieldCheck } from 'lucide-react';

export default function AboutBrand() {
  return (
    <section
      id="about-section"
      style={{
        padding: '7rem 0',
        background: 'radial-gradient(circle at 30% 50%, rgba(183, 110, 121, 0.08) 0%, rgba(13, 13, 13, 1) 70%)',
        position: 'relative',
        borderTop: '1px solid var(--border-subtle)'
      }}
    >
      <div className="container-luxe">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            alignItems: 'center'
          }}
        >
          {/* Left Column: Story Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <span className="subtitle">Maison Philosophy</span>
            <h2
              style={{
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                fontFamily: 'var(--font-serif)',
                lineHeight: 1.15
              }}
            >
              The Science of Scent & <br />
              <span className="text-gradient-rosegold">The Art of Eternity</span>
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.7 }}>
              Founded upon an unyielding devotion to rare beauty, LUXE represents the pinnacle of French olfactory artistry and Florentine high jewelry craftsmanship.
            </p>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
              Every fragrance is hand-formulated in Grasse, France using wild-harvested May Rose petals, rare oud resins, and 24K gold foil particles. Every diamond solitaire is individually selected for exceptional VVS clarity and set in 18K solid yellow or rose gold.
            </p>

            {/* Feature Badges */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                marginTop: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Feather size={20} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--text-primary)' }}>
                    Grasse Distillation
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Centuries-old maceration methods preserving pure floral notes.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Gem size={20} color="var(--accent-rosegold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--text-primary)' }}>
                    Conflict-Free Gems
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    GIA-certified solitaire natural diamonds of unmatched radiance.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Composition */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '480px',
                border: '1px solid var(--border-gold)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-deep)'
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1200"
                alt="LUXE Atelier"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(13, 13, 13, 0.8) 0%, transparent 60%)'
                }}
              />
              
              <div
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '24px',
                  right: '24px',
                  padding: '1.25rem',
                  background: 'rgba(13, 13, 13, 0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)', fontSize: '1.1rem' }}>
                  Atelier de Haute Création
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Paris • Grasse • Florence
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 992px) {
          #about-section div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
      `}</style>
    </section>
  );
}
