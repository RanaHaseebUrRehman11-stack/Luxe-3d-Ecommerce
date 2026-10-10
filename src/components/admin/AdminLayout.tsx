import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ArrowLeft,
  LogOut,
  ShieldAlert,
  Sparkles,
  Users,
  Check,
  ChevronRight
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdminDashboard from './AdminDashboard';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import { Product } from '../../types';

interface AdminLayoutProps {
  currentAdminTab: 'dashboard' | 'products' | 'orders';
  onNavigateAdminTab: (tab: 'dashboard' | 'products' | 'orders') => void;
  onNavigateHome: () => void;
  products: Product[];
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function AdminLayout({
  currentAdminTab,
  onNavigateAdminTab,
  onNavigateHome,
  products,
  onShowToast
}: AdminLayoutProps) {
  const { currentUser, userProfile, logout } = useAuth();
  const [grantingRole, setGrantingRole] = useState(false);

  // Auto-promote for demo/testing if user requests
  const handleClaimAdminRole = async () => {
    if (!currentUser) return;
    setGrantingRole(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { role: 'admin' });
      onShowToast('✨ Admin permissions granted to your profile! Welcome to LUXE Console.', 'success');
      window.location.reload();
    } catch (err) {
      console.error('Failed to update admin role:', err);
      onShowToast('Could not set admin role. Please try again.', 'warning');
    } finally {
      setGrantingRole(false);
    }
  };

  // If not logged in or not admin
  if (!currentUser) {
    return (
      <div style={{ paddingTop: '120px', paddingBottom: '6rem', minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            maxWidth: '500px',
            width: '90%',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-gold)',
            borderRadius: '20px',
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-deep)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid var(--border-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              color: 'var(--accent-gold)'
            }}
          >
            <ShieldAlert size={32} />
          </div>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#ffffff', margin: '0 0 0.5rem 0' }}>
            Admin Vault Access Restricted
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            The LUXE Concierge Console requires an authenticated administrator session. Please sign in to proceed.
          </p>

          <button onClick={onNavigateHome} className="btn-luxe" style={{ width: '100%', justifyContent: 'center' }}>
            <ArrowLeft size={16} />
            <span>Return to Boutique Storefront</span>
          </button>
        </div>
      </div>
    );
  }

  // Logged in but not admin role
  if (userProfile?.role !== 'admin') {
    return (
      <div style={{ paddingTop: '120px', paddingBottom: '6rem', minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            maxWidth: '540px',
            width: '90%',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-gold)',
            borderRadius: '20px',
            padding: '3rem 2.5rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-deep)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              color: '#f87171'
            }}
          >
            <ShieldAlert size={32} />
          </div>

          <span className="subtitle" style={{ display: 'inline-block', marginBottom: '8px' }}>
            Access Control Protocol
          </span>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#ffffff', margin: '0 0 0.75rem 0' }}>
            Administrator Privileges Required
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Your account (<strong style={{ color: '#ffffff' }}>{currentUser.email}</strong>) is currently registered as a standard Client account.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={handleClaimAdminRole}
              disabled={grantingRole}
              className="btn-luxe"
              style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}
            >
              <Sparkles size={16} />
              <span>{grantingRole ? 'Promoting Account...' : 'Enable Admin Rights (Demo Mode)'}</span>
            </button>

            <button
              onClick={onNavigateHome}
              className="btn-luxe btn-outline"
              style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}
            >
              <ArrowLeft size={16} />
              <span>Return to Boutique Storefront</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#ffffff', paddingTop: '80px' }}>
      
      {/* Sidebar Navigation */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#0d0d0d',
          borderRight: '1px solid var(--border-gold)',
          padding: '2rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'fixed',
          top: '80px',
          bottom: 0,
          left: 0,
          zIndex: 40
        }}
      >
        <div>
          {/* Header Branding */}
          <div style={{ paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Sparkles size={16} color="var(--accent-gold)" />
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent-gold)' }}>
                LUXE Console
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', letterSpacing: '0.05em', color: '#ffffff' }}>
              Maison Management
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            
            <button
              onClick={() => onNavigateAdminTab('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: currentAdminTab === 'dashboard' ? '1px solid var(--accent-gold)' : '1px solid transparent',
                backgroundColor: currentAdminTab === 'dashboard' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                color: currentAdminTab === 'dashboard' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.88rem',
                fontWeight: currentAdminTab === 'dashboard' ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </div>
              {currentAdminTab === 'dashboard' && <ChevronRight size={14} />}
            </button>

            <button
              onClick={() => onNavigateAdminTab('products')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: currentAdminTab === 'products' ? '1px solid var(--accent-gold)' : '1px solid transparent',
                backgroundColor: currentAdminTab === 'products' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                color: currentAdminTab === 'products' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.88rem',
                fontWeight: currentAdminTab === 'products' ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Package size={18} />
                <span>Product Catalog</span>
              </div>
              {currentAdminTab === 'products' && <ChevronRight size={14} />}
            </button>

            <button
              onClick={() => onNavigateAdminTab('orders')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: currentAdminTab === 'orders' ? '1px solid var(--accent-gold)' : '1px solid transparent',
                backgroundColor: currentAdminTab === 'orders' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                color: currentAdminTab === 'orders' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.88rem',
                fontWeight: currentAdminTab === 'orders' ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShoppingBag size={18} />
                <span>Client Orders</span>
              </div>
              {currentAdminTab === 'orders' && <ChevronRight size={14} />}
            </button>

          </nav>
        </div>

        {/* Sidebar Footer */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {/* User badge */}
          <div style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Administrator
            </div>
            <div style={{ fontSize: '0.82rem', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userProfile?.displayName || currentUser.email}
            </div>
          </div>

          <button
            onClick={onNavigateHome}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-gold)',
              backgroundColor: 'transparent',
              color: 'var(--accent-gold)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <ArrowLeft size={16} />
            <span>View Storefront</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace Area */}
      <main style={{ marginLeft: '260px', flex: 1, padding: '2.5rem 3rem', minHeight: 'calc(100vh - 80px)' }}>
        {currentAdminTab === 'dashboard' && (
          <AdminDashboard
            products={products}
            onNavigateOrders={() => onNavigateAdminTab('orders')}
            onNavigateProducts={() => onNavigateAdminTab('products')}
          />
        )}

        {currentAdminTab === 'products' && (
          <AdminProducts
            products={products}
            onShowToast={onShowToast}
          />
        )}

        {currentAdminTab === 'orders' && (
          <AdminOrders
            onShowToast={onShowToast}
          />
        )}
      </main>

    </div>
  );
}
