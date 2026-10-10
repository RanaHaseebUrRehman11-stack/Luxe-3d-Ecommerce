import React, { useState, useEffect } from 'react';
import { Product, Order } from '../../types';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  Package,
  ShoppingBag,
  DollarSign,
  Users,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  Eye
} from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  onNavigateOrders: () => void;
  onNavigateProducts: () => void;
}

export default function AdminDashboard({
  products,
  onNavigateOrders,
  onNavigateProducts
}: AdminDashboardProps) {
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        // 1. Fetch Orders
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const fetchedOrders: Order[] = [];
        let revenueSum = 0;

        ordersSnap.forEach((docSnap) => {
          const data = docSnap.data();
          const ord: Order = {
            id: data.id || docSnap.id,
            userId: data.userId,
            items: data.items || [],
            shippingInfo: data.shippingInfo || { fullName: '', phone: '', address: '', city: '', postalCode: '' },
            totalAmount: data.totalAmount || 0,
            status: data.status || 'pending',
            paymentMethod: data.paymentMethod || 'Cash on Delivery',
            createdAt: data.createdAt || new Date().toISOString()
          };
          fetchedOrders.push(ord);
          revenueSum += ord.totalAmount;
        });

        // Sort descending by date
        fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setTotalOrders(fetchedOrders.length);
        setTotalRevenue(revenueSum);
        setRecentOrders(fetchedOrders.slice(0, 5));

        // 2. Fetch Users Count
        const usersSnap = await getDocs(collection(db, 'users'));
        setTotalUsers(usersSnap.size);

      } catch (err) {
        console.error('Error loading admin dashboard stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const formatPKR = (amount: number) => `PKR ${amount.toLocaleString()}`;

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
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
        return { label: 'Delivered', color: '#4ade80', bg: 'rgba(34, 197, 94, 0.1)' };
      case 'shipped':
        return { label: 'Shipped', color: '#c084fc', bg: 'rgba(168, 85, 247, 0.1)' };
      case 'processing':
        return { label: 'Processing', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)' };
      default:
        return { label: 'Pending', color: 'var(--accent-gold)', bg: 'rgba(212, 175, 55, 0.12)' };
    }
  };

  return (
    <div>
      {/* Top Banner */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Sparkles size={16} color="var(--accent-gold)" />
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent-gold)' }}>
              Executive Overview
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', margin: 0, color: '#ffffff' }}>
            Maison Dashboard
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={onNavigateProducts} className="btn-luxe btn-outline" style={{ padding: '0.65rem 1.25rem', fontSize: '0.8rem' }}>
            <Package size={15} />
            <span>Manage Catalog</span>
          </button>
          <button onClick={onNavigateOrders} className="btn-luxe" style={{ padding: '0.65rem 1.25rem', fontSize: '0.8rem' }}>
            <ShoppingBag size={15} />
            <span>Manage Orders</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Stat 1: Total Products */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-gold)',
            borderRadius: '16px',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
              Catalog Items
            </span>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(212, 175, 55, 0.1)',
                color: 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Package size={20} />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 600, color: '#ffffff' }}>
            {products.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Live products in catalog</span>
          </div>
        </div>

        {/* Stat 2: Total Orders */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-gold)',
            borderRadius: '16px',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
              Total Orders
            </span>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.1)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShoppingBag size={20} />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 600, color: '#ffffff' }}>
            {loadingStats ? '...' : totalOrders}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Client vault purchases
          </div>
        </div>

        {/* Stat 3: Total Revenue */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-gold)',
            borderRadius: '16px',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
              Gross Revenue
            </span>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(74, 222, 128, 0.1)',
                color: '#4ade80',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
            {loadingStats ? '...' : formatPKR(totalRevenue)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Accumulated gross sales
          </div>
        </div>

        {/* Stat 4: Registered Users */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-gold)',
            borderRadius: '16px',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
              Registered Clients
            </span>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(192, 132, 252, 0.1)',
                color: '#c084fc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 600, color: '#ffffff' }}>
            {loadingStats ? '...' : totalUsers}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Vault accounts registered
          </div>
        </div>

      </div>

      {/* Recent Orders Section */}
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.015)',
          border: '1px solid var(--border-gold)',
          borderRadius: '16px',
          padding: '2rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#ffffff', margin: 0 }}>
              Recent Vault Acquisitions
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '4px 0 0 0' }}>
              Latest 5 orders recorded in the system
            </p>
          </div>

          <button
            onClick={onNavigateOrders}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-gold)',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <span>View All Orders</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {loadingStats ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Loading recent order history...
          </div>
        ) : recentOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No order transactions recorded yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-gold)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.1em' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Order Ref</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Recipient</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Items</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Total</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => {
                  const badge = getStatusBadge(ord.status);
                  return (
                    <tr
                      key={ord.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      <td style={{ padding: '1rem', fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)', fontWeight: 600 }}>
                        {ord.id}
                      </td>

                      <td style={{ padding: '1rem', color: '#ffffff' }}>
                        <div>{ord.shippingInfo.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.shippingInfo.city}</div>
                      </td>

                      <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                        {formatDate(ord.createdAt)}
                      </td>

                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                        {ord.items.reduce((acc, i) => acc + i.quantity, 0)} pcs
                      </td>

                      <td style={{ padding: '1rem', color: 'var(--accent-gold-light)', fontWeight: 600 }}>
                        {formatPKR(ord.totalAmount)}
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.color,
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em'
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button
                          onClick={onNavigateOrders}
                          style={{
                            background: 'rgba(212, 175, 55, 0.1)',
                            border: '1px solid var(--border-gold)',
                            color: 'var(--accent-gold)',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
