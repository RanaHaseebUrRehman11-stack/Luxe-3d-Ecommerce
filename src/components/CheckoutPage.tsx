import React, { useState, useEffect } from 'react';
import { CartItem, ShippingInfo, OrderItem } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowLeft,
  ArrowRight,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  MapPin,
  Phone,
  User,
  Building,
  FileText,
  Check
} from 'lucide-react';
import { collection, doc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface CheckoutPageProps {
  cartItems: CartItem[];
  onClearCart: () => void;
  onNavigateHome: () => void;
  onNavigateOrders: () => void;
  onNavigateCart: () => void;
  onRequireAuth: (msg: string) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function CheckoutPage({
  cartItems,
  onClearCart,
  onNavigateHome,
  onNavigateOrders,
  onNavigateCart,
  onRequireAuth,
  onShowToast
}: CheckoutPageProps) {
  const { currentUser, userProfile } = useAuth();

  // Form State
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: userProfile?.displayName || '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  const [errors, setErrors] = useState<{ [key in keyof ShippingInfo]?: string }>({});
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash on Delivery');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const [completedOrderDetails, setCompletedOrderDetails] = useState<{
    items: OrderItem[];
    total: number;
    shipping: ShippingInfo;
  } | null>(null);

  useEffect(() => {
    if (!currentUser) {
      onRequireAuth('Please sign in to proceed with your vault checkout.');
    } else if (userProfile?.displayName && !shippingInfo.fullName) {
      setShippingInfo((prev) => ({ ...prev, fullName: userProfile.displayName || '' }));
    }
  }, [currentUser, userProfile]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingFee = 0; // Complimentary for LUXE
  const grandTotal = subtotal + shippingFee;

  const formatPKR = (amount: number) => `PKR ${amount.toLocaleString()}`;

  const validateForm = (): boolean => {
    const newErrors: { [key in keyof ShippingInfo]?: string } = {};
    if (!shippingInfo.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!shippingInfo.phone.trim()) newErrors.phone = 'Contact Phone Number is required';
    else if (shippingInfo.phone.trim().length < 8) newErrors.phone = 'Enter a valid phone number';
    if (!shippingInfo.address.trim()) newErrors.address = 'Street Address is required';
    if (!shippingInfo.city.trim()) newErrors.city = 'City is required';
    if (!shippingInfo.postalCode.trim()) newErrors.postalCode = 'Postal Code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      onRequireAuth('Please sign in to place your vault order.');
      return;
    }

    if (cartItems.length === 0) {
      onShowToast('Your Vault Bag is empty.', 'warning');
      onNavigateCart();
      return;
    }

    if (!validateForm()) {
      onShowToast('Please complete all required shipping fields correctly.', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Generate Order ID
      const orderDocRef = doc(collection(db, 'orders'));
      const orderId = `LUXE-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString().slice(-4)}`;

      // 2. Map items
      const orderItems: OrderItem[] = cartItems.map((ci) => ({
        productId: ci.product.id,
        productName: ci.product.name,
        image: ci.product.images[0] || '',
        variant: ci.selectedVariant,
        quantity: ci.quantity,
        price: ci.product.price
      }));

      // 3. Save Order Document
      const orderData = {
        id: orderId,
        userId: currentUser.uid,
        userEmail: currentUser.email || '',
        items: orderItems,
        shippingInfo,
        totalAmount: grandTotal,
        status: 'pending',
        paymentMethod,
        createdAt: new Date().toISOString()
      };

      await setDoc(orderDocRef, orderData);

      // 4. Reduce stock for each product if valid
      for (const item of cartItems) {
        if (item.product.id) {
          try {
            const productRef = doc(db, 'products', item.product.id);
            await updateDoc(productRef, {
              stock: increment(-item.quantity)
            });
          } catch (stkErr) {
            console.warn(`Note: Could not adjust stock for item ${item.product.id}:`, stkErr);
          }
        }
      }

      // 5. Clear User Cart in Firestore
      const cartDocRef = doc(db, 'carts', currentUser.uid);
      await setDoc(cartDocRef, {
        userId: currentUser.uid,
        items: [],
        updatedAt: new Date().toISOString()
      });

      // 6. Local State Updates
      setCompletedOrderId(orderId);
      setCompletedOrderDetails({
        items: orderItems,
        total: grandTotal,
        shipping: shippingInfo
      });
      onClearCart();
      onShowToast('✨ Order successfully placed and saved to your Vault!', 'success');
    } catch (err: any) {
      console.error('Order placement error:', err);
      onShowToast('Failed to secure order. Please try again.', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ORDER CONFIRMATION SCREEN
  if (completedOrderId && completedOrderDetails) {
    return (
      <div style={{ paddingTop: '110px', paddingBottom: '6rem', minHeight: '100vh', background: 'var(--bg-dark)' }}>
        <div className="container-luxe" style={{ maxWidth: '800px' }}>
          
          <div
            style={{
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-gold)',
              borderRadius: '20px',
              padding: '3.5rem 2rem',
              boxShadow: 'var(--shadow-deep)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Animated Checkmark Icon */}
            <div
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(13,13,13,0.9) 70%)',
                border: '2px solid var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
                color: 'var(--accent-gold)',
                animation: 'popSuccess 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
            >
              <CheckCircle2 size={48} />
            </div>

            <span className="subtitle" style={{ display: 'inline-block', marginBottom: '8px' }}>
              Handcrafted Order Secured
            </span>

            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2.2rem, 4vw, 3rem)',
                margin: '0 0 1rem 0',
                color: '#ffffff'
              }}
            >
              Thank You for Your Order
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '540px', margin: '0 auto 1.5rem auto', lineHeight: 1.6 }}>
              Your order reference number is <strong style={{ color: 'var(--accent-gold)', letterSpacing: '0.05em' }}>{completedOrderId}</strong>. A concierge confirmation has been logged to your private vault.
            </p>

            <div className="gold-divider" style={{ margin: '1.5rem auto 2.5rem auto' }} />

            {/* Summary Details */}
            <div
              style={{
                textAlign: 'left',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(212, 175, 55, 0.15)',
                borderRadius: '12px',
                padding: '1.75rem',
                marginBottom: '2.5rem'
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--accent-gold)', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PackageCheck size={18} />
                <span>Order Summary</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
                {completedOrderDetails.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={item.image}
                        alt={item.productName}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}
                      />
                      <div>
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', color: '#ffffff' }}>{item.productName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Qty: {item.quantity} {item.variant ? `• ${item.variant.name}: ${item.variant.value}` : ''}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.92rem', color: 'var(--accent-gold-light)', fontWeight: 600 }}>
                      {formatPKR(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping Address Recap */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                    Destination Address
                  </div>
                  <div style={{ color: '#ffffff', fontWeight: 500 }}>{completedOrderDetails.shipping.fullName}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{completedOrderDetails.shipping.address}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {completedOrderDetails.shipping.city}, {completedOrderDetails.shipping.postalCode}
                  </div>
                  <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{completedOrderDetails.shipping.phone}</div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                    Payment & Delivery
                  </div>
                  <div style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>Cash on Delivery</div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Complimentary Armored Courier</div>
                  <div style={{ marginTop: '12px', fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                    Total: {formatPKR(completedOrderDetails.total)}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={onNavigateHome}
                className="btn-luxe"
                style={{ padding: '0.85rem 2rem', fontSize: '0.82rem' }}
              >
                <span>Continue Exploring Collections</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={onNavigateOrders}
                className="btn-luxe btn-outline"
                style={{ padding: '0.85rem 2rem', fontSize: '0.82rem' }}
              >
                <span>View Vault Order History</span>
              </button>
            </div>

          </div>

        </div>

        <style>{`
          @keyframes popSuccess {
            0% { transform: scale(0.5); opacity: 0; }
            70% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // CHECKOUT FORM PAGE
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
            <button
              onClick={onNavigateCart}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
            >
              Vault Bag
            </button>
            <span>/</span>
            <span style={{ color: 'var(--accent-gold)' }}>Secure Concierge Checkout</span>
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
            <span>Back to Shopping</span>
          </button>
        </div>

        {/* Page Header */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Lock size={15} color="var(--accent-gold)" />
            <span className="subtitle" style={{ margin: 0 }}>Encrypted Concierge Protocol</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', margin: '0.25rem 0' }}>
            Vault Acquisition Checkout
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Please confirm your destination address and review your artisanal selections.
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: 'rgba(255, 255, 255, 0.015)',
              border: '1px dashed var(--border-gold)',
              borderRadius: '16px',
              maxWidth: '560px',
              margin: '0 auto'
            }}
          >
            <ShoppingBag size={48} color="var(--accent-gold)" style={{ marginBottom: '1rem', opacity: 0.6 }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#ffffff', marginBottom: '0.5rem' }}>
              Your Vault Bag is Empty
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Add an exquisite fragrance or 18K fine solitaire creation to proceed with checkout.
            </p>
            <button onClick={onNavigateHome} className="btn-luxe">
              <span>Explore Haute Creations</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '3rem', alignItems: 'start' }}>
            
            {/* Left Column: Shipping & Payment Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              
              {/* Section 1: Shipping Address */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.018)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: '16px',
                  padding: '2rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--accent-gold)',
                      color: '#0d0d0d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}
                  >
                    1
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#ffffff', margin: 0 }}>
                    Destination Shipping Address
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  {/* Full Name */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Full Recipient Name *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="e.g. Lady Genevieve Vance"
                        value={shippingInfo.fullName}
                        onChange={(e) => {
                          setShippingInfo({ ...shippingInfo, fullName: e.target.value });
                          if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                        }}
                        style={{
                          width: '100%',
                          padding: '0.8rem 1rem 0.8rem 2.5rem',
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          border: `1px solid ${errors.fullName ? '#f87171' : 'var(--border-subtle)'}`,
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '0.9rem'
                        }}
                      />
                      <User size={16} color="var(--accent-gold)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                    {errors.fullName && <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '4px', display: 'block' }}>{errors.fullName}</span>}
                  </div>

                  {/* Phone */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Contact Phone Number (For Courier) *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="tel"
                        placeholder="+92 300 1234567"
                        value={shippingInfo.phone}
                        onChange={(e) => {
                          setShippingInfo({ ...shippingInfo, phone: e.target.value });
                          if (errors.phone) setErrors({ ...errors, phone: undefined });
                        }}
                        style={{
                          width: '100%',
                          padding: '0.8rem 1rem 0.8rem 2.5rem',
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          border: `1px solid ${errors.phone ? '#f87171' : 'var(--border-subtle)'}`,
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '0.9rem'
                        }}
                      />
                      <Phone size={16} color="var(--accent-gold)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                    {errors.phone && <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '4px', display: 'block' }}>{errors.phone}</span>}
                  </div>

                  {/* Street Address */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Street Address / Residence *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="House No., Street name, Sector / Area"
                        value={shippingInfo.address}
                        onChange={(e) => {
                          setShippingInfo({ ...shippingInfo, address: e.target.value });
                          if (errors.address) setErrors({ ...errors, address: undefined });
                        }}
                        style={{
                          width: '100%',
                          padding: '0.8rem 1rem 0.8rem 2.5rem',
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          border: `1px solid ${errors.address ? '#f87171' : 'var(--border-subtle)'}`,
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '0.9rem'
                        }}
                      />
                      <MapPin size={16} color="var(--accent-gold)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                    {errors.address && <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '4px', display: 'block' }}>{errors.address}</span>}
                  </div>

                  {/* City */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      City *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="e.g. Lahore, Karachi, Islamabad"
                        value={shippingInfo.city}
                        onChange={(e) => {
                          setShippingInfo({ ...shippingInfo, city: e.target.value });
                          if (errors.city) setErrors({ ...errors, city: undefined });
                        }}
                        style={{
                          width: '100%',
                          padding: '0.8rem 1rem 0.8rem 2.5rem',
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          border: `1px solid ${errors.city ? '#f87171' : 'var(--border-subtle)'}`,
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '0.9rem'
                        }}
                      />
                      <Building size={16} color="var(--accent-gold)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                    {errors.city && <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '4px', display: 'block' }}>{errors.city}</span>}
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Postal Code *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="e.g. 54000"
                        value={shippingInfo.postalCode}
                        onChange={(e) => {
                          setShippingInfo({ ...shippingInfo, postalCode: e.target.value });
                          if (errors.postalCode) setErrors({ ...errors, postalCode: undefined });
                        }}
                        style={{
                          width: '100%',
                          padding: '0.8rem 1rem 0.8rem 2.5rem',
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          border: `1px solid ${errors.postalCode ? '#f87171' : 'var(--border-subtle)'}`,
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '0.9rem'
                        }}
                      />
                      <FileText size={16} color="var(--accent-gold)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                    {errors.postalCode && <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '4px', display: 'block' }}>{errors.postalCode}</span>}
                  </div>

                </div>
              </div>

              {/* Section 2: Payment Method */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.018)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: '16px',
                  padding: '2rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--accent-gold)',
                      color: '#0d0d0d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}
                  >
                    2
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#ffffff', margin: 0 }}>
                    Select Payment Protocol
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Option 1: Cash on Delivery */}
                  <div
                    onClick={() => setPaymentMethod('Cash on Delivery')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: '2px solid var(--accent-gold)',
                      backgroundColor: 'rgba(212, 175, 55, 0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'rgba(212, 175, 55, 0.15)',
                          border: '1px solid var(--accent-gold)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--accent-gold)'
                        }}
                      >
                        <Truck size={20} />
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: '#ffffff', fontWeight: 600 }}>
                          Cash on Delivery (Armored Courier)
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Inspect and verify seal upon delivery. Pay in cash directly to concierge.
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'var(--accent-gold)',
                        color: '#0d0d0d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Check size={14} strokeWidth={3} />
                    </div>
                  </div>

                  {/* Disabled Option 2: Online Card Payment */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      opacity: 0.5,
                      cursor: 'not-allowed'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-muted)'
                        }}
                      >
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: 'var(--text-muted)' }}>
                          Luxury Card / Crypto Vault (Phase 2)
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Visa, Mastercard, & Vault Tokens arriving in next update
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Right Column: Order Summary Card */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-gold)',
                borderRadius: '16px',
                padding: '1.75rem',
                position: 'sticky',
                top: '120px'
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--accent-gold)', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} />
                <span>Order Selections ({cartItems.reduce((a, b) => a + b.quantity, 0)})</span>
              </h3>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '6px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
                {cartItems.map((ci, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img
                      src={ci.product.images[0] || ''}
                      alt={ci.product.name}
                      style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: '#111' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.92rem', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ci.product.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>
                        Qty: {ci.quantity} {ci.selectedVariant ? `• ${ci.selectedVariant.value}` : ''}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--accent-gold-light)', fontWeight: 600 }}>
                      {formatPKR(ci.product.price * ci.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal & Delivery Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Selections Subtotal</span>
                  <span style={{ color: '#ffffff' }}>{formatPKR(subtotal)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Armored Express Delivery</span>
                  <span style={{ color: 'var(--accent-gold)' }}>COMPLIMENTARY</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Bespoke Gift Packaging</span>
                  <span style={{ color: 'var(--accent-gold)' }}>INCLUDED</span>
                </div>

                <div style={{ borderTop: '1px solid var(--border-gold)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: '#ffffff' }}>Grand Total</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                    {formatPKR(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Guarantees */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem', background: 'rgba(0, 0, 0, 0.3)', padding: '10px 12px', borderRadius: '8px' }}>
                <ShieldCheck size={16} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                <span>Authenticity Certificate & Insured Seal Included</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-luxe"
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '0.88rem',
                  opacity: isSubmitting ? 0.75 : 1,
                  cursor: isSubmitting ? 'wait' : 'pointer'
                }}
              >
                {isSubmitting ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        border: '2px solid rgba(13, 13, 13, 0.3)',
                        borderTop: '2px solid #0d0d0d',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                      }}
                    />
                    <span>Securing Vault Order...</span>
                  </div>
                ) : (
                  <>
                    <span>Place Order Now</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

            </div>

          </form>
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
