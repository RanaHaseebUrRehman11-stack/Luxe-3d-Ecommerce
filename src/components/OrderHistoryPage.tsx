import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Package, Clock, CheckCircle2, Truck, Sparkles, ArrowRight, ArrowLeft, MapPin, Phone, User, ShoppingBag } from 'lucide-react';

interface OrderHistoryPageProps {
  onNavigateHome: () => void;
  onNavigateCategory: (category: string) => void;
  onRequireAuth: (msg: string) => void;
}

export default function OrderHistoryPage({
  onNavigateHome,
  onNavigateCategory,
  onRequireAuth
}: OrderHistoryPageProps) {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!currentUser) {
      onRequireAuth('Please sign in to view your private vault order history.');
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetched: Order[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetched.push({
            id: data.id || docSnap.id,
            userId: data.userId,
            items: data.items || [],
            shippingInfo: data.shippingInfo || { fullName: '', phone: '', address: '', city: '', postalCode: '' },
            totalAmount: data.totalAmount || 0,
            status: data.status || 'pending',
            paymentMethod: data.paymentMethod || 'Cash on Delivery',
            createdAt: data.createdAt || new Date().toISOString()
          });
        });

        // Sort client-side by createdAt desc
        fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(fetched);
      } catch (err) {
        console.error('Error fetching order history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const formatPKR = (amount: number) => `PKR ${amount.toLocaleString()}`;

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return {
          label: 'DELIVERED',
          bg: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.4)',
          color: '#4ade80'
        };
      case 'shipped':
        return {
          label: 'SHIPPED VIA COURIER',
          bg: 'rgba(168, 85, 247, 0.1)',
          border: '1px solid rgba(168, 85, 247, 0.4)',
          color: '#c084fc'
        };
      case 'processing':
        return {
          label: 'ARTISANAL PREPARATION',
          bg: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          color: '#38bdf8'
        };
      default:
        return {
          label: 'CONFIRMED & PENDING',
          bg: 'rgba(212, 175, 55, 0.12)',
          border: '1px solid var(--border-gold)',
          color: 'var(--accent-gold)'
        };
    }
  };

  return (
    <div style={{ paddingTop: '110px', paddingBottom: '6rem', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <div className="container-luxe">
        
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <button
              onClick={onNavigateHome}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
            >
              Home
            </button>
            <span>/</span>
            <span style={{ color: 'var(--accent-gold)' }}>Vault Order Records</span>
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
            padding: '3rem 2rem',
            background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.08) 0%, rgba(13, 13, 13, 0.95) 75%)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '16px'
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Package size={16} color="var(--accent-gold)" />
            <span className="subtitle" style={{ margin: 0 }}>Client Vault Archive</span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.4rem, 5vw, 3.5rem)',
              margin: '0.5rem 0 0.75rem 0'
            }}
          >
            Your Acquisition History
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '580px', margin: '0 auto' }}>
            A verified ledger of your haute fragrance acquisitions and bespoke 18K solitaire jewelry commissions.
          </p>

          <div className="gold-divider" style={{ margin: '1.5rem auto 0 auto' }} />
        </div>

        {/* Content Body */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--accent-gold)' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid rgba(212, 175, 55, 0.2)',
                borderTop: '3px solid var(--accent-gold)',
                borderRadius: '50%',
                margin: '0 auto 1rem auto',
                animation: 'spin 0.8s linear infinite'
              }}
            />
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Loading client order vault records...</p>
          </div>
        ) : orders.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '5rem 2rem',
              backgroundColor: 'rgba(255, 255, 255, 0.015)',
              border: '1px dashed rgba(212, 175, 55, 0.25)',
              borderRadius: '16px',
              maxWidth: '580px',
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
              <ShoppingBag size={32} />
            </div>

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#ffffff', margin: 0 }}>
              No Prior Orders Recorded
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
              You have not placed any orders with Maison LUXE yet. Explore our handcrafted catalog to make your first acquisition.
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => onNavigateCategory('perfume')}
                className="btn-luxe"
                style={{ padding: '0.8rem 1.6rem', fontSize: '0.78rem' }}
              >
                <span>Explore Perfumes</span>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {orders.map((order) => {
              const badge = getStatusBadge(order.status);
              return (
                <div
                  key={order.id}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.018)',
                    border: '1px solid var(--border-gold)',
                    borderRadius: '16px',
                    padding: '2rem',
                    transition: 'border-color 0.3s ease'
                  }}
                >
                  {/* Order Top Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      paddingBottom: '1.25rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      marginBottom: '1.5rem'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>
                        Vault Reference Code
                      </div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--accent-gold)', fontWeight: 600, marginTop: '2px' }}>
                        {order.id}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
                          Placed On
                        </div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                          {formatDate(order.createdAt)}
                        </div>
                      </div>

                      <span
                        style={{
                          backgroundColor: badge.bg,
                          border: badge.border,
                          color: badge.color,
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          letterSpacing: '0.15em'
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '64px 1fr auto',
                          gap: '1.25rem',
                          alignItems: 'center',
                          padding: '0.75rem',
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.03)'
                        }}
                      >
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800'}
                          alt={item.productName}
                          style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: '#111' }}
                        />

                        <div>
                          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: '#ffffff', margin: '0 0 4px 0' }}>
                            {item.productName}
                          </h4>
                          {item.variant && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', display: 'block' }}>
                              {item.variant.name}: {item.variant.value}
                            </span>
                          )}
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Quantity: {item.quantity}
                          </span>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1rem', color: 'var(--accent-gold-light)', fontWeight: 600 }}>
                            {formatPKR(item.price * item.quantity)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {formatPKR(item.price)} each
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Bottom Section: Delivery & Total */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      paddingTop: '1.25rem',
                      borderTop: '1px solid var(--border-subtle)',
                      backgroundColor: 'rgba(212, 175, 55, 0.02)',
                      padding: '1rem 1.25rem',
                      borderRadius: '10px'
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Destination: <strong style={{ color: '#ffffff' }}>{order.shippingInfo.fullName}</strong> ({order.shippingInfo.city}) • Payment: <strong style={{ color: 'var(--accent-gold)' }}>{order.paymentMethod}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order Total:</span>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                        {formatPKR(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
