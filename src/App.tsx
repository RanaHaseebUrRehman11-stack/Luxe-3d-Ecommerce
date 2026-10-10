import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import BrandTeaser from './components/BrandTeaser';
import CollectionShowcase from './components/CollectionShowcase';
import PerfumesCollectionPage from './components/PerfumesCollectionPage';
import JewelryCollectionPage from './components/JewelryCollectionPage';
import ProductDetailPage from './components/ProductDetailPage';
import WishlistPage from './components/WishlistPage';
import CheckoutPage from './components/CheckoutPage';
import OrderHistoryPage from './components/OrderHistoryPage';
import AdminLayout from './components/admin/AdminLayout';
import AboutBrand from './components/AboutBrand';
import Footer from './components/Footer';
import ProductQuickViewModal from './components/ProductQuickViewModal';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import AuthModal from './components/AuthModal';
import Toast, { ToastMessage } from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Product, ProductVariant, CartItem } from './types';
import { collection, onSnapshot, query, doc, getDoc, setDoc } from 'firebase/firestore';
import { db, SAMPLE_PRODUCTS } from './lib/firebase';

function MainApp() {
  const { currentUser } = useAuth();
  
  // Navigation & Path Routing State
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [wishlistOpen, setWishlistOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Auth Modal state
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authPrompt, setAuthPrompt] = useState<string | null>(null);

  // Toast state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Live Products list
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isInitialCartLoaded, setIsInitialCartLoaded] = useState<boolean>(false);

  // Listen to browser path changes (back / forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load live products from Firestore
  useEffect(() => {
    let unsubscribe: () => void;
    try {
      const q = query(collection(db, 'products'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const fetched: Product[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetched.push({
            id: docSnap.id,
            name: data.name,
            category: data.category,
            price: data.price,
            description: data.description,
            images: data.images || [],
            model3dUrl: data.model3dUrl || '',
            variants: data.variants || [],
            stock: data.stock || 0
          });
        });
        if (fetched.length > 0) {
          setAllProducts(fetched);
        } else {
          setAllProducts(SAMPLE_PRODUCTS.map((p, idx) => ({ ...p, id: `sample-${idx + 1}` })));
        }
      }, () => {
        setAllProducts(SAMPLE_PRODUCTS.map((p, idx) => ({ ...p, id: `sample-${idx + 1}` })));
      });
    } catch {
      setAllProducts(SAMPLE_PRODUCTS.map((p, idx) => ({ ...p, id: `sample-${idx + 1}` })));
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Fetch cart from Firestore for logged in user
  useEffect(() => {
    if (!currentUser) {
      setCartItems([]);
      setIsInitialCartLoaded(true);
      return;
    }

    setIsInitialCartLoaded(false);
    const cartDocRef = doc(db, 'carts', currentUser.uid);

    getDoc(cartDocRef)
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.items)) {
            setCartItems(data.items);
          } else {
            setCartItems([]);
          }
        } else {
          setCartItems([]);
        }
      })
      .catch((err) => {
        console.error('Error loading cart from Firestore:', err);
      })
      .finally(() => {
        setIsInitialCartLoaded(true);
      });
  }, [currentUser]);

  // Persist cart to Firestore on changes
  const saveCartToFirestore = async (newCartItems: CartItem[]) => {
    if (!currentUser) return;
    try {
      const cartDocRef = doc(db, 'carts', currentUser.uid);
      await setDoc(cartDocRef, {
        userId: currentUser.uid,
        items: newCartItems,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error('Failed to sync cart to Firestore:', err);
    }
  };

  const handleRequireAuth = (message: string) => {
    setAuthPrompt(message);
    setAuthModalMode('login');
    setAuthModalOpen(true);
    setToast({
      id: Date.now().toString(),
      type: 'info',
      message
    });
  };

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthPrompt(null);
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAddToCart = (product: Product, variant?: ProductVariant, quantity: number = 1) => {
    if (!currentUser) {
      handleRequireAuth('Please sign in to add items to your cart.');
      return;
    }

    const selectedVar = variant || (product.variants && product.variants.length > 0 ? product.variants[0] : { name: 'Edition', value: 'Standard' });
    
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.product.id === product.id && item.selectedVariant?.value === selectedVar?.value
      );

      let updated: CartItem[];
      if (existingIndex > -1) {
        updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
      } else {
        updated = [...prevItems, { product, selectedVariant: selectedVar, quantity }];
      }

      saveCartToFirestore(updated);
      return updated;
    });

    setToast({
      id: Date.now().toString(),
      type: 'success',
      message: `${product.name} added to your vault bag.`
    });
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    setCartItems((prev) => {
      const updated = [...prev];
      updated[index].quantity = newQty;
      saveCartToFirestore(updated);
      return updated;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      saveCartToFirestore(updated);
      return updated;
    });

    setToast({
      id: Date.now().toString(),
      type: 'info',
      message: 'Item removed from your vault bag.'
    });
  };

  const handleExploreClick = () => {
    const el = document.getElementById('collection-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/perfumes');
    }
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Route evaluation
  const isPerfumesPage = currentPath === '/perfumes';
  const isJewelryPage = currentPath === '/jewelry';
  const isWishlistPage = currentPath === '/wishlist';
  const isCheckoutPage = currentPath === '/checkout';
  const isOrdersPage = currentPath === '/orders';
  const isAdminPage = currentPath.startsWith('/admin');
  const isProductDetailPage = currentPath.startsWith('/product/');
  const currentProductId = isProductDetailPage ? currentPath.replace('/product/', '') : '';

  const adminTab = currentPath === '/admin/products' ? 'products' : currentPath === '/admin/orders' ? 'orders' : 'dashboard';

  // Current active category for Navbar highlighting
  const currentNavCategory = isPerfumesPage ? 'perfume' : isJewelryPage ? 'jewelry' : activeCategory;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-dark)', color: 'var(--text-primary)' }}>
      {/* Sticky Navigation Header */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => {
          if (!currentUser) {
            handleRequireAuth('Please sign in to access your shopping cart.');
          } else {
            setCartOpen(true);
          }
        }}
        onOpenWishlist={() => {
          if (!currentUser) {
            handleRequireAuth('Please sign in to access your saved wishlist vault.');
          } else {
            navigate('/wishlist');
          }
        }}
        onOpenOrders={() => {
          if (!currentUser) {
            handleRequireAuth('Please sign in to view your vault order records.');
          } else {
            navigate('/orders');
          }
        }}
        onOpenAdmin={() => {
          navigate('/admin');
        }}
        onOpenAuth={handleOpenAuth}
        activeCategory={currentNavCategory}
        onSelectCategory={(cat) => {
          if (cat === 'perfume') {
            navigate('/perfumes');
          } else if (cat === 'jewelry') {
            navigate('/jewelry');
          } else {
            setActiveCategory(cat);
            if (currentPath !== '/') navigate('/');
          }
        }}
        onNavigateHome={() => navigate('/')}
      />

      {/* Main Page Route View */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPath}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          {isAdminPage ? (
            <AdminLayout
              currentAdminTab={adminTab}
              onNavigateAdminTab={(tab) => {
                if (tab === 'dashboard') navigate('/admin');
                else if (tab === 'products') navigate('/admin/products');
                else if (tab === 'orders') navigate('/admin/orders');
              }}
              onNavigateHome={() => navigate('/')}
              products={allProducts}
              onShowToast={(msg, type) => setToast({ id: Date.now().toString(), type: type || 'info', message: msg })}
            />
          ) : isPerfumesPage ? (
            <PerfumesCollectionPage
              onSelectProduct={(productId) => navigate(`/product/${productId}`)}
              onAddToCart={handleAddToCart}
              onRequireAuth={handleRequireAuth}
              onNavigateHome={() => navigate('/')}
            />
          ) : isJewelryPage ? (
            <JewelryCollectionPage
              onSelectProduct={(productId) => navigate(`/product/${productId}`)}
              onAddToCart={handleAddToCart}
              onRequireAuth={handleRequireAuth}
              onNavigateHome={() => navigate('/')}
            />
          ) : isWishlistPage ? (
            <WishlistPage
              products={allProducts}
              onAddToCart={handleAddToCart}
              onSelectProduct={(productId) => navigate(`/product/${productId}`)}
              onRequireAuth={handleRequireAuth}
              onNavigateHome={() => navigate('/')}
              onNavigateCategory={(cat) => {
                if (cat === 'perfume') navigate('/perfumes');
                else if (cat === 'jewelry') navigate('/jewelry');
                else navigate('/');
              }}
            />
          ) : isCheckoutPage ? (
            <CheckoutPage
              cartItems={cartItems}
              onClearCart={() => setCartItems([])}
              onNavigateHome={() => navigate('/')}
              onNavigateOrders={() => navigate('/orders')}
              onNavigateCart={() => setCartOpen(true)}
              onRequireAuth={handleRequireAuth}
              onShowToast={(msg, type) => setToast({ id: Date.now().toString(), type: type || 'info', message: msg })}
            />
          ) : isOrdersPage ? (
            <OrderHistoryPage
              onNavigateHome={() => navigate('/')}
              onNavigateCategory={(cat) => {
                if (cat === 'perfume') navigate('/perfumes');
                else if (cat === 'jewelry') navigate('/jewelry');
                else navigate('/');
              }}
              onRequireAuth={handleRequireAuth}
            />
          ) : isProductDetailPage && currentProductId ? (
            <ProductDetailPage
              productId={currentProductId}
              onAddToCart={handleAddToCart}
              onRequireAuth={handleRequireAuth}
              onNavigateHome={() => navigate('/')}
              onNavigateCategory={(cat) => {
                if (cat === 'perfume') navigate('/perfumes');
                else if (cat === 'jewelry') navigate('/jewelry');
                else navigate('/');
              }}
            />
          ) : (
            /* Home Landing Page */
            <>
              <HeroSection onExploreClick={handleExploreClick} />

              <BrandTeaser
                onSelectCategory={(cat) => {
                  if (cat === 'perfume') navigate('/perfumes');
                  else if (cat === 'jewelry') navigate('/jewelry');
                  else setActiveCategory(cat);
                }}
              />

              <CollectionShowcase
                activeCategory={activeCategory}
                onSelectCategory={(cat) => {
                  setActiveCategory(cat);
                }}
                onQuickView={(prod) => navigate(`/product/${prod.id}`)}
                onAddToCart={(prod) => handleAddToCart(prod)}
                onRequireAuth={handleRequireAuth}
              />

              <AboutBrand />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Global Footer (hidden in Admin console) */}
      {!isAdminPage && <Footer />}

      {/* Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(prod, varnt, qty) => {
          handleAddToCart(prod, varnt, qty);
        }}
        onRequireAuth={handleRequireAuth}
      />

      {/* Shopping Cart Vault Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onExploreCollections={() => {
          setCartOpen(false);
          navigate('/perfumes');
        }}
        onProceedCheckout={() => {
          setCartOpen(false);
          if (!currentUser) {
            handleRequireAuth('Please sign in to proceed with your checkout.');
          } else if (cartItems.length === 0) {
            setToast({
              id: Date.now().toString(),
              type: 'warning',
              message: 'Your vault bag is empty.'
            });
          } else {
            navigate('/checkout');
          }
        }}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        products={allProducts}
        onAddToCart={(prod) => handleAddToCart(prod)}
        onQuickView={(prod) => navigate(`/product/${prod.id}`)}
      />

      {/* Auth Modal (Login / Signup / Reset) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        promptMessage={authPrompt}
        onSuccess={() => {
          setToast({
            id: Date.now().toString(),
            type: 'success',
            message: 'Authenticated successfully.'
          });
        }}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

