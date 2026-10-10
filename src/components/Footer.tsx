import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer
      style={{
        background: '#080808',
        borderTop: '1px solid var(--border-gold)',
        padding: '5rem 0 2.5rem 0',
        color: 'var(--text-secondary)'
      }}
    >
      <div className="container-luxe">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr',
            gap: '3rem',
            marginBottom: '4rem'
          }}
        >
          {/* Col 1: Brand Info */}
          <div>
            <span
              className="text-gradient-gold"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2rem',
                fontWeight: '700',
                letterSpacing: '0.2em',
                display: 'inline-block',
                marginBottom: '1rem'
              }}
            >
              LUXE
            </span>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '300px' }}>
              Haute Parfumerie & Fine Jewelry. Handcrafted with rare botanicals and certified solitaire diamonds for those who appreciate pure distinction.
            </p>
          </div>

          {/* Col 2: Collections */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
              Collections
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <li><a href="#collection-section" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Parfums de Extrait</a></li>
              <li><a href="#collection-section" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Joaillerie Solitaire</a></li>
              <li><a href="#collection-section" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Limited 24K Flacons</a></li>
              <li><a href="#collection-section" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Bespoke Creations</a></li>
            </ul>
          </div>

          {/* Col 3: Concierge */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
              Concierge
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <li><a href="#about-section" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Authenticity Certificate</a></li>
              <li><a href="#about-section" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>White-Glove Shipping</a></li>
              <li><a href="#about-section" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Private Appointments</a></li>
              <li><a href="#about-section" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Care & Maintenance</a></li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '1rem' }}>
              The Private Gazette
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Receive exclusive invitations to private 3D releases, rare vintage batches, and private salon viewings.
            </p>

            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.825rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                className="btn-luxe"
                style={{ padding: '0.75rem 1rem' }}
                aria-label="Subscribe"
              >
                <Send size={16} />
              </button>
            </form>

            {subscribed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)', fontSize: '0.8rem', marginTop: '8px' }}>
                <CheckCircle2 size={14} />
                <span>You have been added to our VIP register.</span>
              </div>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            © {new Date().getFullYear()} LUXE Maison Inc. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Cookie Preferences</span>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 992px) {
          footer div[style*="grid-template-columns"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 576px) {
          footer div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
