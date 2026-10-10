import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Menu, X, Heart, User, LogOut, ChevronDown, Sparkles, ShieldCheck, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenOrders?: () => void;
  onOpenAdmin?: () => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  onNavigateHome: () => void;
}

export default function Navbar({
  cartCount,
  onOpenCart,
  onOpenWishlist,
  onOpenOrders,
  onOpenAdmin,
  onOpenAuth,
  activeCategory,
  onSelectCategory,
  onNavigateHome
}: NavbarProps) {
  const { currentUser, userProfile, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [badgeAnimate, setBadgeAnimate] = useState(false);

  const prevCartCountRef = useRef(cartCount);

  useEffect(() => {
    if (cartCount > prevCartCountRef.current) {
      setBadgeAnimate(true);
      const timer = setTimeout(() => setBadgeAnimate(false), 600);
      return () => clearTimeout(timer);
    }
    prevCartCountRef.current = cartCount;
  }, [cartCount]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const wishlistCount = userProfile?.wishlist?.length || 0;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (cat: string, elementId?: string) => {
    onSelectCategory(cat);
    setMobileMenuOpen(false);
    if (elementId) {
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleWishlistClick = () => {
    if (!currentUser) {
      onOpenAuth('login');
    } else {
      onOpenWishlist();
    }
  };

  const userInitial = userProfile?.displayName
    ? userProfile.displayName.charAt(0).toUpperCase()
    : currentUser?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        backgroundColor: isScrolled ? 'rgba(13, 13, 13, 0.94)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(16px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(212, 175, 55, 0.18)' : '1px solid transparent',
        padding: isScrolled ? '0.85rem 0' : '1.35rem 0'
      }}
    >
      <div className="container-luxe" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Logo */}
        <button
          onClick={() => {
            onNavigateHome();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span
            className="text-gradient-gold"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.75rem',
              fontWeight: '700',
              letterSpacing: '0.22em',
              textTransform: 'uppercase'
            }}
          >
            LUXE
          </span>
        </button>

        {/* Desktop Nav Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2.5rem'
          }}
          className="desktop-nav"
        >
          <button
            onClick={() => {
              onNavigateHome();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="nav-link"
            style={{
              background: 'none',
              border: 'none',
              color: activeCategory === 'all' ? 'var(--accent-gold)' : 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.82rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              cursor: 'pointer',
              position: 'relative',
              padding: '4px 0',
              transition: 'var(--transition-fast)'
            }}
          >
            Home
          </button>

          <button
            onClick={() => handleNavClick('perfume', 'collection-section')}
            className="nav-link"
            style={{
              background: 'none',
              border: 'none',
              color: activeCategory === 'perfume' ? 'var(--accent-gold)' : 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.82rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              cursor: 'pointer',
              position: 'relative',
              padding: '4px 0',
              transition: 'var(--transition-fast)'
            }}
          >
            Perfumes
          </button>

          <button
            onClick={() => handleNavClick('jewelry', 'collection-section')}
            className="nav-link"
            style={{
              background: 'none',
              border: 'none',
              color: activeCategory === 'jewelry' ? 'var(--accent-gold)' : 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.82rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              cursor: 'pointer',
              position: 'relative',
              padding: '4px 0',
              transition: 'var(--transition-fast)'
            }}
          >
            Jewelry
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('about-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="nav-link"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.82rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              cursor: 'pointer',
              position: 'relative',
              padding: '4px 0',
              transition: 'var(--transition-fast)'
            }}
          >
            Heritage
          </button>
        </nav>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            aria-label="Wishlist Vault"
            title="Wishlist Vault"
            style={{
              background: 'rgba(212, 175, 55, 0.06)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-gold)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'var(--transition-smooth)'
            }}
          >
            <Heart size={18} />
            {wishlistCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--accent-gold)',
                  color: 'var(--bg-dark)',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            aria-label="Shopping Bag"
            title="Shopping Cart"
            style={{
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1px solid var(--border-gold)',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-gold)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'var(--transition-smooth)'
            }}
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--accent-gold)',
                  color: 'var(--bg-dark)',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: badgeAnimate ? 'badgeBounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none',
                  boxShadow: badgeAnimate ? '0 0 12px var(--accent-gold)' : 'none'
                }}
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* User Auth Controls */}
          {currentUser ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05))',
                  border: '1px solid var(--accent-gold)',
                  borderRadius: '30px',
                  padding: '4px 12px 4px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  color: '#ffffff',
                  transition: 'all 0.2s ease'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-gold)',
                    color: '#0d0d0d',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {userInitial}
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    maxWidth: '100px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  className="user-name-label"
                >
                  {userProfile?.displayName?.split(' ')[0] || 'Member'}
                </span>
                <ChevronDown size={14} style={{ color: 'var(--accent-gold)' }} />
              </button>

              {/* User Dropdown */}
              {profileDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 12px)',
                    right: 0,
                    width: '240px',
                    backgroundColor: '#141414',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '12px',
                    padding: '1rem',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.9), 0 0 20px rgba(212, 175, 55, 0.1)',
                    zIndex: 110,
                    animation: 'dropdownFade 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {/* Dropdown Header */}
                  <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={14} style={{ color: 'var(--accent-gold)' }} />
                      <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-gold)' }}>
                        {userProfile?.role === 'admin' ? 'MAISON ADMIN' : 'PRIVILEGED MEMBER'}
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '0.98rem', color: '#ffffff', margin: '4px 0 0 0' }}>
                      {userProfile?.displayName || 'Valued Member'}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentUser.email}
                    </p>
                  </div>

                  {/* Options */}
                  <div style={{ padding: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenWishlist();
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        padding: '0.6rem 0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: 'var(--text-primary)',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.08)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Heart size={15} style={{ color: 'var(--accent-gold)' }} />
                        <span>Saved Wishlist</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', background: 'rgba(212, 175, 55, 0.2)', color: 'var(--accent-gold)', padding: '2px 6px', borderRadius: '10px', fontWeight: 600 }}>
                        {wishlistCount}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        if (onOpenOrders) onOpenOrders();
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        padding: '0.6rem 0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--text-primary)',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.08)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Package size={15} style={{ color: 'var(--accent-gold)' }} />
                      <span>Vault Order History</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        if (onOpenAdmin) onOpenAdmin();
                      }}
                      style={{
                        background: userProfile?.role === 'admin' ? 'rgba(212, 175, 55, 0.1)' : 'none',
                        border: 'none',
                        width: '100%',
                        padding: '0.6rem 0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: 'var(--accent-gold)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        borderRadius: '6px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.15)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = userProfile?.role === 'admin' ? 'rgba(212, 175, 55, 0.1)' : 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={15} style={{ color: 'var(--accent-gold)' }} />
                        <span>Admin Console</span>
                      </div>
                      <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--accent-gold)', color: '#0d0d0d', fontWeight: 700 }}>
                        {userProfile?.role === 'admin' ? 'ADMIN' : 'PANEL'}
                      </span>
                    </button>
                  </div>

                  {/* Sign Out */}
                  <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <button
                      onClick={async () => {
                        setProfileDropdownOpen(false);
                        await logout();
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#f87171',
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        borderRadius: '6px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              style={{
                background: 'transparent',
                border: '1px solid var(--accent-gold)',
                color: 'var(--accent-gold)',
                borderRadius: '30px',
                padding: '0.5rem 1.25rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
                e.currentTarget.style.color = 'var(--bg-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--accent-gold)';
              }}
            >
              <User size={14} />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'none'
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '70px',
            left: 0,
            right: 0,
            background: 'rgba(13, 13, 13, 0.98)',
            borderBottom: '1px solid var(--border-gold)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            zIndex: 99
          }}
        >
          {currentUser && (
            <div style={{ paddingBottom: '1rem', borderBottom: '1px solid rgba(212, 175, 55, 0.2)' }}>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-gold)', letterSpacing: '0.1em', margin: 0 }}>
                Logged in as
              </p>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: '#ffffff', margin: '2px 0 0 0' }}>
                {userProfile?.displayName || currentUser.email}
              </p>
            </div>
          )}

          <button
            onClick={() => {
              onNavigateHome();
              setMobileMenuOpen(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-serif)',
              fontSize: '1.2rem',
              textAlign: 'left'
            }}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('perfume', 'collection-section')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-serif)',
              fontSize: '1.2rem',
              textAlign: 'left'
            }}
          >
            Haute Perfumes
          </button>
          <button
            onClick={() => handleNavClick('jewelry', 'collection-section')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-serif)',
              fontSize: '1.2rem',
              textAlign: 'left'
            }}
          >
            Fine Jewelry
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleWishlistClick();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-gold)',
              fontFamily: 'var(--font-serif)',
              fontSize: '1.2rem',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Heart size={18} />
            <span>Wishlist Vault ({wishlistCount})</span>
          </button>

          {currentUser && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenOrders) onOpenOrders();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-gold)',
                fontFamily: 'var(--font-serif)',
                fontSize: '1.2rem',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Package size={18} />
              <span>Vault Order History</span>
            </button>
          )}

          {!currentUser ? (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth('login');
              }}
              style={{
                marginTop: '1rem',
                padding: '0.85rem',
                borderRadius: '8px',
                background: 'var(--accent-gold)',
                color: '#0d0d0d',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                border: 'none',
                textAlign: 'center'
              }}
            >
              Sign In to LUXE
            </button>
          ) : (
            <button
              onClick={async () => {
                setMobileMenuOpen(false);
                await logout();
              }}
              style={{
                marginTop: '1rem',
                padding: '0.85rem',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                textAlign: 'center'
              }}
            >
              Sign Out
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes badgeBounce {
          0% { transform: scale(1); }
          50% { transform: scale(1.45); }
          100% { transform: scale(1); }
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--accent-gold);
          transition: width 0.3s ease;
        }
        .nav-link:hover::after {
          width: 100%;
        }
        @keyframes dropdownFade {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
          .user-name-label {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
