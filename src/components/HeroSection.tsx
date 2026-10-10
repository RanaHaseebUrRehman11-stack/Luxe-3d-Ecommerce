import React from 'react';
import { Sparkles, ArrowDown, ChevronRight } from 'lucide-react';
import Hero3DScene from './3d/Hero3DScene';

interface HeroSectionProps {
  onExploreClick: () => void;
}

export default function HeroSection({ onExploreClick }: HeroSectionProps) {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '90px',
        background: 'radial-gradient(circle at 65% 40%, rgba(212, 175, 55, 0.12) 0%, rgba(13, 13, 13, 1) 65%)',
        overflow: 'hidden'
      }}
    >
      {/* Background Decorative Grid/Lines */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'linear-gradient(rgba(212, 175, 55, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.03) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          pointerEvents: 'none'
        }}
      />

      <div
        className="container-luxe"
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1.1fr',
          gap: '3rem',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* Left Content Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Eyebrow badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={14} color="var(--accent-gold)" />
            <span className="subtitle" style={{ margin: 0 }}>
              Maison de Haute Perfumes & Fine Jewelry
            </span>
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)',
              lineHeight: 1.08,
              fontWeight: 400,
              fontFamily: 'var(--font-serif)'
            }}
          >
            Crafted for <br />
            <span className="text-gradient-gold" style={{ fontStyle: 'italic', fontWeight: 600 }}>
              Eternity
            </span>
          </h1>

          {/* Body Text */}
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1.05rem',
              lineHeight: 1.7,
              maxWidth: '520px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 300
            }}
          >
            An extraordinary convergence of French olfactory mastery and Italian fine jewelry art. Explore interactive 3D masterpieces, rare botanical extracts, and certified solitaire diamonds.
          </p>

          {/* Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              marginTop: '1.5rem',
              flexWrap: 'wrap'
            }}
          >
            <button
              onClick={onExploreClick}
              className="btn-luxe"
            >
              <span>Explore Collection</span>
              <ChevronRight size={16} />
            </button>

            <a
              href="#3d-showroom"
              className="btn-luxe btn-outline"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('brand-teasers');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>Brand Heritage</span>
            </a>
          </div>

          {/* Quick Metrics / Accents */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2.5rem',
              marginTop: '2.5rem',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--accent-gold)' }}>
                100%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Natural Botanicals
              </div>
            </div>
            <div style={{ width: '1px', height: '30px', background: 'var(--border-subtle)' }} />
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--accent-gold)' }}>
                18K
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Solid Gold & VVS Diamonds
              </div>
            </div>
          </div>

        </div>

        {/* Right 3D Interactive Model Canvas Column */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '520px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Subtle Glow backdrop behind 3D model */}
          <div
            style={{
              position: 'absolute',
              width: '350px',
              height: '350px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.18) 0%, transparent 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none'
            }}
          />

          <Hero3DScene />
        </div>

      </div>

      {/* Bottom Scroll Indicator */}
      <button
        onClick={onExploreClick}
        style={{
          position: 'absolute',
          bottom: '25px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          zIndex: 5,
          transition: 'var(--transition-fast)'
        }}
      >
        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.25em' }}>
          Scroll To Discover
        </span>
        <ArrowDown size={14} className="animate-float" style={{ color: 'var(--accent-gold)' }} />
      </button>

      <style>{`
        @media (max-width: 992px) {
          .container-luxe {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </section>
  );
}
