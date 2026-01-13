
import React, { useState, useEffect, useMemo } from 'react';
import { Product, CartItem, View, Order } from './types';
import { INITIAL_PRODUCTS } from './constants';
import Navbar from './components/Navbar';
import ProductGrid from './components/ProductGrid';
import CartSidebar from './components/CartSidebar';
import AdminDashboard from './components/AdminDashboard';
import Checkout from './components/Checkout';
import AIAssistant from './components/AIAssistant';
import ProductDetail from './components/ProductDetail';
import OrderSuccess from './components/OrderSuccess';
import AdminLogin from './components/AdminLogin';
import OrderTracking from './components/OrderTracking';

const App: React.FC = () => {
  const [view, setView] = useState<View>('shop');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [trackingId, setTrackingId] = useState<string>('');
  
  // Auth state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('gs_admin_auth') === 'true';
  });

  // Load products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('gs_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Load orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('gs_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Load Categories (Taxonomy)
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('gs_categories');
    return saved ? JSON.parse(saved) : ['Vegetables', 'Meats', 'Grains', 'Oils', 'Spices', 'Tubers'];
  });

  // Load cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('gs_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('gs_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('gs_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('gs_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('gs_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    sessionStorage.setItem('gs_admin_auth', isAdminAuthenticated ? 'true' : 'false');
  }, [isAdminAuthenticated]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const openProductDetail = (id: string) => {
    setSelectedProductId(id);
    setView('product-detail');
    window.scrollTo(0, 0);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckoutComplete = (order: Order) => {
    setCart([]);
    setOrders(prev => [order, ...prev]);
    setLastOrder(order);
    setView('shop'); 
  };

  const handleTrackOrder = (id: string) => {
    setTrackingId(id);
    setView('track-order');
    setLastOrder(null);
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setView('shop');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar 
        view={view} 
        setView={(v) => { setView(v); setLastOrder(null); }} 
        cartCount={cartCount} 
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="flex-1 container mx-auto px-4 py-8 relative">
        {lastOrder && view === 'shop' && (
          <OrderSuccess 
            order={lastOrder} 
            onDismiss={() => setLastOrder(null)} 
            onTrack={() => handleTrackOrder(lastOrder.id)}
          />
        )}

        {view === 'shop' && !lastOrder && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Farm Fresh Harvest</h1>
                <p className="text-slate-500">Premium foodstuff sourced directly from local Nigerian farms.</p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
                    selectedCategory === 'All' 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 scale-105' 
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  All Items
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 scale-105' 
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </header>

            <ProductGrid 
              products={filteredProducts} 
              onAddToCart={addToCart} 
              onViewDetail={openProductDetail}
            />
          </div>
        )}

        {view === 'product-detail' && selectedProduct && (
          <ProductDetail 
            product={selectedProduct} 
            onAddToCart={addToCart} 
            onBack={() => setView('shop')} 
          />
        )}

        {view === 'admin' && (
          isAdminAuthenticated ? (
            <AdminDashboard 
              products={products} 
              setProducts={setProducts} 
              categories={categories}
              setCategories={setCategories}
              orders={orders}
              setOrders={setOrders}
              onLogout={handleLogout}
            />
          ) : (
            <AdminLogin onLogin={() => setIsAdminAuthenticated(true)} />
          )
        )}

        {view === 'checkout' && (
          <Checkout 
            cart={cart} 
            total={cartTotal} 
            onComplete={handleCheckoutComplete}
            onCancel={() => setView('shop')}
          />
        )}

        {view === 'track-order' && (
          <OrderTracking 
            orders={orders} 
            initialId={trackingId} 
            onBack={() => { setView('shop'); setTrackingId(''); }} 
          />
        )}
      </main>

      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart}
        total={cartTotal}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setView('checkout');
        }}
      />

      <AIAssistant 
        products={products} 
        onProductSelect={(p) => openProductDetail(p.id)} 
      />

      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-slate-500 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="text-slate-900 font-black text-xl">Kayan Miya</span>
            </div>
            <p>Empowering local Nigerian kitchens with the freshest ingredients, delivered from farm to doorstep in 24 hours.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Market Sections</h4>
            <ul className="space-y-2">
              <li className="hover:text-emerald-600 cursor-pointer transition-colors" onClick={() => setView('shop')}>Shop Produce</li>
              <li className="hover:text-emerald-600 cursor-pointer transition-colors" onClick={() => setView('admin')}>Vendor Portal</li>
              <li className="hover:text-emerald-600 cursor-pointer transition-colors font-bold text-slate-900" onClick={() => setView('track-order')}>Track Order</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Reach Out</h4>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-emerald-100 hover:text-emerald-600 cursor-pointer transition-colors">
                <span className="font-bold">X</span>
              </div>
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-emerald-100 hover:text-emerald-600 cursor-pointer transition-colors">
                <span className="font-bold">IG</span>
              </div>
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-emerald-100 hover:text-emerald-600 cursor-pointer transition-colors">
                <span className="font-bold">WA</span>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Kayan Miya. Freshness Guaranteed. Real-time Deployment Active.
        </div>
      </footer>
    </div>
  );
};

export default App;
