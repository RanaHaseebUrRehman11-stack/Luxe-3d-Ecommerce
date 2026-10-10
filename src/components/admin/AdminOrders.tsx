import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  ShoppingBag,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  User as UserIcon,
  Clock,
  Sparkles,
  CheckCircle2,
  Truck,
  Box,
  AlertCircle
} from 'lucide-react';

interface AdminOrdersProps {
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function AdminOrders({ onShowToast }: AdminOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered'>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Fetch all orders from Firestore
  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const fetched: Order[] = [];

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
        fetched.push(ord);
      });

      // Sort descending by date
      fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(fetched);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      onShowToast('Could not load orders from Firestore.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  // Update Status Action
  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingOrderId(orderId);
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });

      // Optimistic state update
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      onShowToast(`Order #${orderId} status updated to "${newStatus.toUpperCase()}"`, 'success');
    } catch (err) {
      console.error('Failed to update status in Firestore:', err);
      onShowToast('Failed to update order status. Please try again.', 'warning');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shippingInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shippingInfo.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shippingInfo.city.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatPKR = (amt: number) => `PKR ${amt.toLocaleString()}`;

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  const getStatusStyle = (st: Order['status']) => {
    switch (st) {
      case 'delivered':
        return { label: 'Delivered', color: '#4ade80', bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.3)' };
      case 'shipped':
        return { label: 'Shipped', color: '#c084fc', bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.3)' };
      case 'processing':
        return { label: 'Processing', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.3)' };
      default:
        return { label: 'Pending', color: 'var(--accent-gold)', bg: 'rgba(212, 175, 55, 0.12)', border: 'var(--border-gold)' };
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Sparkles size={16} color="var(--accent-gold)" />
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent-gold)' }}>
              Fulfilment Protocol
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', margin: 0, color: '#ffffff' }}>
            Client Orders ({orders.length})
          </h1>
        </div>

        <button onClick={fetchAllOrders} className="btn-luxe btn-outline" style={{ padding: '0.65rem 1.25rem', fontSize: '0.8rem' }}>
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-gold)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '2rem'
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <input
            type="text"
            placeholder="Search order ID, recipient, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.4rem',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.85rem'
            }}
          />
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['all', 'pending', 'processing', 'shipped', 'delivered'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                border: statusFilter === st ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                backgroundColor: statusFilter === st ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                color: statusFilter === st ? 'var(--accent-gold)' : 'var(--text-secondary)',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {st === 'all' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table Container */}
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.015)',
          border: '1px solid var(--border-gold)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            Retrieving client order ledger...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            No order records match the criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-gold)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.1em' }}>
                  <th style={{ padding: '1rem' }}>Order Ref</th>
                  <th style={{ padding: '1rem' }}>Client Name</th>
                  <th style={{ padding: '1rem' }}>Date & Time</th>
                  <th style={{ padding: '1rem' }}>Total</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Update / Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => {
                  const isExpanded = expandedOrderId === ord.id;
                  const statusStyle = getStatusStyle(ord.status);

                  return (
                    <React.Fragment key={ord.id}>
                      {/* Main Table Row */}
                      <tr
                        style={{
                          borderBottom: isExpanded ? 'none' : '1px solid var(--border-subtle)',
                          backgroundColor: isExpanded ? 'rgba(212, 175, 55, 0.04)' : 'transparent',
                          transition: 'background 0.2s ease'
                        }}
                      >
                        {/* Order Ref */}
                        <td style={{ padding: '1.1rem 1rem', fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)', fontWeight: 600 }}>
                          {ord.id}
                        </td>

                        {/* Recipient */}
                        <td style={{ padding: '1.1rem 1rem', color: '#ffffff' }}>
                          <div style={{ fontWeight: 600 }}>{ord.shippingInfo.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.shippingInfo.city}</div>
                        </td>

                        {/* Date */}
                        <td style={{ padding: '1.1rem 1rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                          {formatDate(ord.createdAt)}
                        </td>

                        {/* Total Amount */}
                        <td style={{ padding: '1.1rem 1rem', color: 'var(--accent-gold-light)', fontWeight: 600 }}>
                          {formatPKR(ord.totalAmount)}
                        </td>

                        {/* Status Dropdown Picker */}
                        <td style={{ padding: '1.1rem 1rem' }}>
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateStatus(ord.id, e.target.value as Order['status'])}
                            disabled={updatingOrderId === ord.id}
                            style={{
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.color,
                              border: `1px solid ${statusStyle.border}`,
                              padding: '5px 12px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              letterSpacing: '0.05em',
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            <option value="pending" style={{ background: '#111', color: '#fff' }}>Pending</option>
                            <option value="processing" style={{ background: '#111', color: '#fff' }}>Processing</option>
                            <option value="shipped" style={{ background: '#111', color: '#fff' }}>Shipped</option>
                            <option value="delivered" style={{ background: '#111', color: '#fff' }}>Delivered</option>
                          </select>
                        </td>

                        {/* Expand Details Button */}
                        <td style={{ padding: '1.1rem 1rem', textAlign: 'right' }}>
                          <button
                            onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid var(--border-subtle)',
                              color: '#ffffff',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <span>{isExpanded ? 'Hide Details' : 'View Items & Address'}</span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Order Details Row */}
                      {isExpanded && (
                        <tr style={{ borderBottom: '1px solid var(--border-gold)', backgroundColor: 'rgba(15, 15, 15, 0.95)' }}>
                          <td colSpan={6} style={{ padding: '1.5rem 2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                              
                              {/* Left Column: Items */}
                              <div>
                                <h4 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Box size={14} />
                                  <span>Acquired Vault Items</span>
                                </h4>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                  {ord.items.map((item, idx) => (
                                    <div
                                      key={idx}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '8px 12px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-subtle)'
                                      }}
                                    >
                                      <img
                                        src={item.image}
                                        alt={item.productName}
                                        style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px' }}
                                      />
                                      <div style={{ flex: 1 }}>
                                        <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.88rem' }}>{item.productName}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                          {item.variant ? item.variant.value : 'Standard'} • Qty: {item.quantity}
                                        </div>
                                      </div>
                                      <div style={{ color: 'var(--accent-gold)', fontWeight: 600, fontSize: '0.88rem' }}>
                                        {formatPKR(item.price * item.quantity)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Right Column: Shipping & Payment Info */}
                              <div>
                                <h4 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <MapPin size={14} />
                                  <span>Delivery Destination & Contact</span>
                                </h4>

                                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', padding: '1rem', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 600, marginBottom: '6px' }}>
                                    <UserIcon size={14} color="var(--accent-gold)" />
                                    <span>{ord.shippingInfo.fullName}</span>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                    <Phone size={14} color="var(--accent-gold)" />
                                    <span>{ord.shippingInfo.phone}</span>
                                  </div>

                                  <div style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                                    <strong>Street Address:</strong> {ord.shippingInfo.address}
                                  </div>

                                  <div style={{ color: 'var(--text-secondary)' }}>
                                    <strong>City / Postal:</strong> {ord.shippingInfo.city}, {ord.shippingInfo.postalCode}
                                  </div>

                                  <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '12px', paddingTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    Payment Method: <strong style={{ color: '#ffffff' }}>{ord.paymentMethod}</strong>
                                  </div>
                                </div>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
