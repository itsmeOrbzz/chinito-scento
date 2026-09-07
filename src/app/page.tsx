'use client';

import React, { useState, useEffect } from 'react';
import { localStoreAPI, syncFromSupabase } from '@/lib/store';
import { Product, PaymentType, CustomerType, SalesOrderLine, SalesOrder } from '@/types/erp';
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  XCircle,
  Moon,
  Sun,
  Copy,
  Check,
  Bookmark,
  Camera
} from 'lucide-react';

type OverlayPosition = 'left' | 'right' | 'center';

const PRODUCT_ASSETS: Record<string, { tagline: string; poster: string; image: string; themeColor: string; textColor: string; overlayPosition: OverlayPosition }> = {
  'ANTONITO': { tagline: 'Elegance After Dark', poster: '/pictures/antonito-poster.jpg', image: '/pictures/antonito.jpg', themeColor: '#d97706', textColor: '#ffffff', overlayPosition: 'right' },
  'AURELIUS': { tagline: 'Wear Your Legacy', poster: '/pictures/aurelius-poster.jpg', image: '/pictures/aurelius.jpg', themeColor: '#b45309', textColor: '#ffffff', overlayPosition: 'left' },
  'BLANCHE': { tagline: 'Beautiful in Simplicity', poster: '/pictures/blanche-poster.jpg', image: '/pictures/blanche.jpg', themeColor: '#f1f5f9', textColor: '#0f172a', overlayPosition: 'right' },
  'CUCAMELLA': { tagline: 'Endless Summer', poster: '/pictures/cucamella-poster.jpg', image: '/pictures/cucamella.jpg', themeColor: '#047857', textColor: '#ffffff', overlayPosition: 'right' },
  'DWIGHT': { tagline: 'The Art of Quiet Luxury', poster: '/pictures/dwigh-poster.jpg', image: '/pictures/dwight.jpg', themeColor: '#1d4ed8', textColor: '#ffffff', overlayPosition: 'left' },
  'EMILY': { tagline: 'A Memory in Bloom', poster: '/pictures/emily-poster.jpg', image: '/pictures/emily.jpg', themeColor: '#be185d', textColor: '#ffffff', overlayPosition: 'right' },
  'GAB': { tagline: 'Effortlessly Magnetic', poster: '/pictures/gab-poster.jpg', image: '/pictures/gab.jpg', themeColor: '#4338ca', textColor: '#ffffff', overlayPosition: 'left' },
  'KITTY': { tagline: 'Sweet with a Spark', poster: '/pictures/kitty-poster.jpg', image: '/pictures/kitty.jpg', themeColor: '#db2777', textColor: '#ffffff', overlayPosition: 'left' },
  'REINE DE NUIT': { tagline: 'Crowned in Midnight', poster: '/pictures/reine-de-nuit-poster.jpg', image: '/pictures/reine-de-nuit.jpg', themeColor: '#6b21a8', textColor: '#ffffff', overlayPosition: 'right' },
};

// Default fallback 9 luxury perfumes so all sections are always rendered
const DEFAULT_PRODUCTS: Product[] = [
  { code: 'ANT', name: 'Antonito (50ml)', description: 'Artisanal fragrance blend - Antonito', selling_price: 200, status: 'ACTIVE', image_url: '/pictures/antonito.jpg' },
  { code: 'AUR', name: 'Aurelius (50ml)', description: 'Artisanal fragrance blend - Aurelius', selling_price: 200, status: 'ACTIVE', image_url: '/pictures/aurelius.jpg' },
  { code: 'BLA', name: 'Blanche (50ml)', description: 'Artisanal fragrance blend - Blanche', selling_price: 200, status: 'ACTIVE', image_url: '/pictures/blanche.jpg' },
  { code: 'CUC', name: 'Cucamella (50ml)', description: 'Artisanal fragrance blend - Cucamella', selling_price: 200, status: 'ACTIVE', image_url: '/pictures/cucamella.jpg' },
  { code: 'DWI', name: 'Dwight (50ml)', description: 'Artisanal fragrance blend - Dwight', selling_price: 200, status: 'ACTIVE', image_url: '/pictures/dwight.jpg' },
  { code: 'EMI', name: 'Emily (50ml)', description: 'Artisanal fragrance blend - Emily', selling_price: 200, status: 'ACTIVE', image_url: '/pictures/emily.jpg' },
  { code: 'GAB', name: 'Gab (50ml)', description: 'Artisanal fragrance blend - Gab', selling_price: 200, status: 'ACTIVE', image_url: '/pictures/gab.jpg' },
  { code: 'KIT', name: 'Kitty (50ml)', description: 'Artisanal fragrance blend - Kitty', selling_price: 200, status: 'ACTIVE', image_url: '/pictures/kitty.jpg' },
  { code: 'RDN', name: 'Reine de Nuit (50ml)', description: 'Artisanal fragrance blend - Reine de Nuit', selling_price: 200, status: 'ACTIVE', image_url: '/pictures/reine-de-nuit.jpg' },
];

const cleanProductName = (name: string): string => {
  return name.replace(/\(50ml\)|\(50\s*ml\)|50ml|50\s*ml|\(|\)/gi, '').trim().toUpperCase();
};

export default function PublicStorefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ soNo: string } | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const handleCopyReference = (refNo: string) => {
    navigator.clipboard.writeText(refNo);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Customer Details Form State
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('Walk-In');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentForm, setPaymentForm] = useState<PaymentType>('GCASH');

  // Customer Order Tracking State
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackingQuery, setTrackingQuery] = useState('');
  const [trackedOrders, setTrackedOrders] = useState<SalesOrder[]>([]);
  const [hasSearchedTrack, setHasSearchedTrack] = useState(false);

  // Active Screen Observer State
  const [activeProductCode, setActiveProductCode] = useState<string | null>(null);

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  useEffect(() => {
    const refreshProducts = () => {
      const activeProducts = localStoreAPI.getProducts().filter(p => p.status === 'ACTIVE');
      setProducts(activeProducts);
    };

    refreshProducts();
    syncFromSupabase().then(() => refreshProducts());

    const handleCustomStoreUpdate = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (!customEvt.detail || customEvt.detail.key === 'products') {
        refreshProducts();
      }
    };

    window.addEventListener('storage', refreshProducts);
    window.addEventListener('chinito_store_updated', handleCustomStoreUpdate);

    return () => {
      window.removeEventListener('storage', refreshProducts);
      window.removeEventListener('chinito_store_updated', handleCustomStoreUpdate);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveProductCode(entry.target.getAttribute('data-product-code'));
          }
        });
      },
      { threshold: 0.5 }
    );

    const sections = document.querySelectorAll('section[data-product-code]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [products]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.code === product.code);
      if (existing) {
        return prev.map(item =>
          item.product.code === product.code ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
    // Reset local counter after adding
    setQuantities(prev => ({ ...prev, [product.code]: 1 }));
  };

  const getQty = (code: string) => quantities[code] || 1;
  const updateLocalQty = (code: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [code]: Math.max(1, (prev[code] || 1) + delta)
    }));
  };

  const updateQuantity = (code: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product.code === code) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[]
    );
  };

  const totalCartAmount = cart.reduce(
    (sum, item) => sum + item.product.selling_price * item.quantity,
    0
  );

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Please add at least one scent to your order.');
      return;
    }

    if (!customerName || !customerContact) {
      alert('Please provide your name and contact number.');
      return;
    }

    const nextSONumber = `SO-${String(Date.now()).slice(-6)}`;
    const lines: SalesOrderLine[] = cart.map(item => ({
      product_code: item.product.code,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.selling_price,
      line_amount: item.product.selling_price * item.quantity,
    }));

    const newSalesOrder: SalesOrder = {
      so_no: nextSONumber,
      date: new Date().toISOString(),
      customer_code: 'C_ONLINE',
      customer_name: customerName,
      customer_type: customerType,
      customer_contact: customerContact,
      delivery_address: deliveryAddress,
      total_amount: totalCartAmount,
      payment_form: paymentForm,
      terms: paymentForm === 'CREDIT' ? 15 : 0,
      amount_collected: 0,
      balance: totalCartAmount,
      status: 'PENDING APPROVAL',
      created_by: 'Public Online Order',
      lines,
    };

    localStoreAPI.saveSalesOrder(newSalesOrder);

    setOrderSuccess({ soNo: nextSONumber });
    setCart([]);
    setIsOrderModalOpen(false);
  };

  const handleTrackSearch = (queryOverride?: string) => {
    const q = (queryOverride !== undefined ? queryOverride : trackingQuery).trim().toLowerCase();
    if (!q) {
      setTrackedOrders([]);
      setHasSearchedTrack(false);
      return;
    }

    const allOrders = localStoreAPI.getSalesOrders();
    const results = allOrders.filter(
      so =>
        so.so_no.toLowerCase().includes(q) ||
        so.customer_name.toLowerCase().includes(q) ||
        (so.customer_contact && so.customer_contact.toLowerCase().includes(q))
    );

    setTrackedOrders(results);
    setHasSearchedTrack(true);
  };

  // Guaranteed display of all 9 core products merged with live store data
  const displayProducts = DEFAULT_PRODUCTS.map(defaultItem => {
    const defaultCleanName = cleanProductName(defaultItem.name);
    const liveMatch = products.find(p => cleanProductName(p.name) === defaultCleanName);
    return liveMatch || defaultItem;
  });

  // Derived active header theme
  const activeAsset = activeProductCode ? PRODUCT_ASSETS[activeProductCode] : null;
  const headerTextColor = activeAsset ? activeAsset.textColor : 'var(--text-main)';

  return (
    <div className="font-sans min-h-screen selection:bg-amber-100 selection:text-amber-900 transition-colors duration-500">
      {/* Sticky Navigation Header */}
      <header 
        className={`fixed top-0 w-full z-40 backdrop-blur-md border-b transition-all duration-700 ${!activeAsset ? 'border-[var(--border-subtle)]' : 'border-transparent'}`}
        style={{ backgroundColor: activeAsset ? `${activeAsset.themeColor}33` : 'rgba(253, 251, 247, 0.8)' }}
      >
        <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/pictures/poster.jpg"
              alt="Chinito Scento"
              className="w-10 h-10 object-cover rounded-full border border-[var(--border-subtle)] transition-all duration-700"
              style={{ borderColor: activeAsset ? activeAsset.textColor : 'var(--border-subtle)' }}
            />
            <div>
              <h1 
                className="text-xl font-bold tracking-widest uppercase font-serif transition-colors duration-700"
                style={{ color: headerTextColor }}
              >
                Chinito Scento
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-full transition-colors hover:bg-black/10"
              style={{ color: headerTextColor }}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => {
                setIsTrackModalOpen(true);
                if (trackingQuery) handleTrackSearch();
              }}
              className="text-xs font-bold uppercase tracking-wider transition-colors hidden sm:block hover:opacity-70"
              style={{ color: headerTextColor }}
            >
              Track Order
            </button>
            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="relative text-xs px-5 py-2.5 rounded-full flex items-center gap-2 font-bold shadow-md uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
              style={{ 
                backgroundColor: activeAsset ? activeAsset.textColor : 'var(--primary)',
                color: activeAsset ? activeAsset.themeColor : '#fff'
              }}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Cart</span>
              {cart.length > 0 && (
                <span 
                  className="absolute -top-1 -right-1 text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    backgroundColor: activeAsset ? activeAsset.themeColor : 'var(--text-main)',
                    color: activeAsset ? '#fff' : 'var(--bg-main)'
                  }}
                >
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Semantic Structure with Full-Screen Snap */}
      <main className="h-screen w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory scrollbar-none">
        
        {/* Intro Hero Section */}
        <section className="w-full h-screen snap-center relative flex items-center justify-center px-4 sm:px-12 bg-[var(--bg-main)] transition-colors duration-500 pt-20">
           <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay pointer-events-none">
              <img src="/pictures/poster.jpg" alt="Chinito Scento" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-[var(--bg-main)] opacity-60"></div>
           </div>
           <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--primary)]">Discover the Collection</span>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black uppercase tracking-tight leading-none text-[var(--text-main)]">
                The Essence<br />of Elegance
              </h2>
              <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-xl mx-auto font-medium">
                Scroll down to embark on an artisanal olfactory journey. Nine distinct creations, perfectly crafted.
              </p>
              <div className="pt-8 animate-bounce text-[var(--text-muted)] flex flex-col items-center">
                <span className="text-xs uppercase tracking-widest font-bold mb-2">Scroll Down</span>
                <span>&darr;</span>
              </div>
           </div>
        </section>

        {/* Product Sections */}
        {displayProducts.map((product, idx) => {
          const cleanName = cleanProductName(product.name);
          const asset = PRODUCT_ASSETS[cleanName] || PRODUCT_ASSETS['ANTONITO'];
          const qty = getQty(product.code);

          // Dynamic overlay classes based on position
          const getOverlayGradient = () => {
            switch(asset.overlayPosition) {
              case 'left': return 'bg-gradient-to-r from-black/90 via-black/50 to-transparent';
              case 'right': return 'bg-gradient-to-l from-black/90 via-black/50 to-transparent';
              case 'center': return 'bg-black/40 backdrop-blur-sm';
              default: return 'bg-gradient-to-t from-black/90 via-black/50 to-transparent';
            }
          };

          const getContentAlignment = () => {
            switch(asset.overlayPosition) {
              case 'left': return 'justify-start items-start text-left md:pr-1/2';
              case 'right': return 'justify-end items-end text-right md:pl-1/2';
              case 'center': return 'justify-center items-center text-center';
              default: return 'justify-end items-start text-left';
            }
          };

          return (
            <section key={product.code} data-product-code={cleanName} className="w-full h-screen snap-center relative flex items-center transition-colors duration-500 overflow-hidden group">
              {/* Full-Screen Background Image */}
              <div className="absolute inset-0 z-0">
                <img src={asset.image} alt={`${cleanName} background`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                {/* Gradient Overlay for Legibility */}
                <div className={`absolute inset-0 ${getOverlayGradient()} transition-opacity duration-500`} />
              </div>

              {/* Content Container */}
              <div className="relative z-10 w-full h-full max-w-[1600px] mx-auto px-6 md:px-20 pt-24 pb-12 flex flex-col pointer-events-none">
                <div className={`flex-1 flex flex-col ${getContentAlignment()}`}>
                  
                  <div className="space-y-4 pointer-events-auto max-w-xl p-8 rounded-3xl" style={{ color: asset.textColor }}>
                    <div className={`flex items-center gap-3 ${asset.overlayPosition === 'right' ? 'justify-end' : (asset.overlayPosition === 'center' ? 'justify-center' : 'justify-start')}`}>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest border px-2.5 py-1 rounded-sm opacity-80" style={{ borderColor: asset.textColor }}>No. 0{idx + 1}</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-sm shadow-lg" style={{ backgroundColor: asset.themeColor, color: '#fff' }}>50 ML</span>
                    </div>
                    
                    <h3 className="text-5xl md:text-7xl lg:text-8xl font-bold font-serif tracking-tight leading-none uppercase drop-shadow-xl">
                      {cleanName}
                    </h3>
                    
                    <p className="text-lg md:text-xl leading-relaxed font-medium tracking-wide opacity-90 drop-shadow-md">
                      {asset.tagline}
                    </p>

                    <div className="pt-8 space-y-6">
                      <div className={`flex items-center gap-4 ${asset.overlayPosition === 'right' ? 'justify-end' : (asset.overlayPosition === 'center' ? 'justify-center' : 'justify-start')}`}>
                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">Retail Price</span>
                        <span className="text-3xl font-black font-mono drop-shadow-md">
                          ₱{product.selling_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      
                      <div className={`flex items-center gap-4 ${asset.overlayPosition === 'right' ? 'justify-end' : (asset.overlayPosition === 'center' ? 'justify-center' : 'justify-start')}`}>
                        {/* Quantity Counter */}
                        <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-1 drop-shadow-lg">
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); updateLocalQty(product.code, -1); }}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors font-bold"
                            style={{ color: asset.textColor }}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center text-lg font-bold font-mono" style={{ color: asset.textColor }}>{qty}</span>
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); updateLocalQty(product.code, 1); }}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors font-bold"
                            style={{ color: asset.textColor }}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={(e) => { e.preventDefault(); addToCart(product, qty); }}
                          className="py-4 px-8 rounded-full font-bold uppercase tracking-[0.2em] shadow-2xl transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
                          style={{ backgroundColor: asset.themeColor, color: '#fff' }}
                        >
                          <ShoppingBag className="w-5 h-5" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>
          );
        })}

        {/* Brand Footer (Snap Center) */}
        <footer className="w-full h-screen snap-center flex items-center justify-center bg-[var(--bg-main)] text-center text-[var(--text-muted)]">
          <div className="max-w-4xl mx-auto space-y-6 px-6">
            <img
              src="/pictures/poster.jpg"
              alt="Chinito Scento"
              className="w-20 h-20 object-cover rounded-full border border-[var(--border-subtle)] mx-auto grayscale opacity-50"
            />
            <h4 className="font-serif font-black uppercase tracking-[0.3em] text-[var(--text-main)] text-2xl">Chinito Scento</h4>
            <p className="max-w-md mx-auto leading-relaxed text-lg">
              Handcrafted artisanal fragrances formulated with luxury, elegance, and distinct character.
            </p>
            <div className="pt-12 text-xs font-bold uppercase tracking-widest opacity-50">
              © {new Date().getFullYear()} Chinito Scento. All rights reserved.
            </div>
          </div>
        </footer>
      </main>

      {/* Cart & Checkout Modal (Reused and slightly styled for luxury) */}
      {isOrderModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box max-w-2xl bg-[var(--bg-card)] border-[var(--border-subtle)]">
            <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-panel)] shrink-0">
              <h3 className="text-lg font-bold text-[var(--text-main)] font-serif uppercase tracking-widest">
                Your Selection
              </h3>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-xl font-bold px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOrderSubmit} className="p-6 overflow-y-auto space-y-8 flex-1">
              <div>
                <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">Cart Items</h4>
                {cart.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)] text-center py-8 border border-dashed border-[var(--border-subtle)] rounded-lg">
                    Your cart is empty.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.product.code} className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-subtle)]">
                        <div className="flex-1">
                          <h5 className="font-bold text-[var(--text-main)] text-sm uppercase">{item.product.name.replace(/50ml/gi, '').trim()}</h5>
                          <span className="text-xs text-[var(--text-muted)] font-mono mt-1 block">50 ML • ₱{item.product.selling_price.toFixed(2)} each</span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-md p-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.code, -1)}
                              className="w-6 h-6 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] font-bold"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-[var(--text-main)]">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.code, 1)}
                              className="w-6 h-6 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] font-bold"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-[var(--text-main)] font-mono w-24 text-right">
                            ₱{(item.product.selling_price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-between items-center pt-4 border-t border-[var(--border-subtle)] text-base font-bold">
                      <span className="uppercase tracking-widest text-[var(--text-main)]">Total</span>
                      <span className="text-xl font-black text-[var(--primary)] font-mono">
                        ₱{totalCartAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-[var(--border-subtle)] pt-6 space-y-5">
                <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Shipping Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="form-input bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-main)]"
                      placeholder="Juan Dela Cruz"
                    />
                  </div>
                  <div>
                    <label className="form-label">Contact Number</label>
                    <input
                      type="text"
                      required
                      value={customerContact}
                      onChange={e => setCustomerContact(e.target.value)}
                      className="form-input bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-main)]"
                      placeholder="0917 123 4567"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="form-label">Delivery Address</label>
                    <textarea
                      required
                      rows={2}
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                      className="form-textarea bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-main)]"
                      placeholder="Complete Address"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="form-label">Payment Method</label>
                    <select
                      value={paymentForm}
                      onChange={e => setPaymentForm(e.target.value as PaymentType)}
                      className="form-select bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-main)]"
                    >
                      <option value="GCASH">GCash</option>
                      <option value="BDO">BDO Bank Transfer</option>
                      <option value="CASH">Cash on Delivery (COD)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={cart.length === 0} className="btn-primary w-full justify-center py-4 rounded-none text-sm uppercase tracking-[0.2em]">
                  Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {orderSuccess && (
        <div className="modal-overlay">
          <div className="modal-box max-w-md text-center p-8 bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl rounded-none">
            <div className="w-16 h-16 bg-[var(--primary-glow)] text-[var(--primary)] border border-[var(--primary)]/30 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Check className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold font-serif text-[var(--text-main)] uppercase tracking-widest mb-1">
              Order Confirmed
            </h3>
            <p className="text-[var(--text-muted)] text-sm mb-6">
              Thank you for choosing Chinito Scento.
            </p>

            {/* Standout Order Reference Ticket */}
            <div className="relative p-5 mb-5 bg-[var(--bg-panel)] border-2 border-[var(--primary)]/50 text-center shadow-md">
              <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-[var(--text-muted)] block mb-1">
                Your Order Reference Number
              </span>
              <div className="text-3xl font-black font-mono tracking-widest text-[var(--primary)] py-1.5 select-all">
                {orderSuccess.soNo}
              </div>
              
              <button
                type="button"
                onClick={() => handleCopyReference(orderSuccess.soNo)}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-[var(--bg-card)] hover:bg-[var(--primary)] hover:text-white text-[var(--text-main)] border border-[var(--border-subtle)] transition-all"
              >
                {copiedRef ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Reference Number</span>
                  </>
                )}
              </button>
            </div>

            {/* High-Emphasis Warning / Save Note */}
            <div className="p-3.5 mb-6 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs text-left flex items-start gap-2.5">
              <Bookmark className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <p className="leading-relaxed">
                <strong>IMPORTANT:</strong> Please take a screenshot or write down your order reference number. You will need this number to track your order.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  const ref = orderSuccess.soNo;
                  setOrderSuccess(null);
                  setTrackingQuery(ref);
                  setIsTrackModalOpen(true);
                }}
                className="flex-1 py-3 px-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:bg-[var(--bg-card)] text-[var(--text-main)] text-xs uppercase tracking-[0.15em] font-semibold transition-colors"
              >
                Track Order
              </button>
              <button
                type="button"
                onClick={() => setOrderSuccess(null)}
                className="btn-primary flex-1 justify-center py-3 px-4 rounded-none uppercase tracking-[0.15em] text-xs font-semibold"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Track Order Modal (Simplified) */}
      {isTrackModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box max-w-xl bg-[var(--bg-card)] border-[var(--border-subtle)]">
            <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-panel)] shrink-0">
              <h3 className="text-lg font-bold text-[var(--text-main)] font-serif uppercase tracking-widest">
                Track Order
              </h3>
              <button
                onClick={() => setIsTrackModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-xl font-bold px-2"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleTrackSearch();
                }}
                className="flex gap-2 mb-6"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Order No (e.g. SO-123456)..."
                    value={trackingQuery}
                    onChange={e => setTrackingQuery(e.target.value)}
                    className="form-input form-input-search bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-main)]"
                  />
                </div>
                <button type="submit" className="btn-primary px-6 rounded-none uppercase text-xs tracking-widest">
                  Track
                </button>
              </form>

              {hasSearchedTrack && (
                <div className="space-y-4">
                  {trackedOrders.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-[var(--border-subtle)] rounded-lg bg-[var(--bg-panel)]">
                      <XCircle className="w-8 h-8 text-rose-500 mx-auto mb-2 opacity-80" />
                      <p className="text-sm font-bold text-[var(--text-main)]">No order found</p>
                    </div>
                  ) : (
                    trackedOrders.map(so => (
                      <div key={so.so_no} className="p-4 border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-panel)]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-mono font-bold text-[var(--text-main)]">{so.so_no}</span>
                          <span className="badge badge-pending">{so.status}</span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">Total: ₱{so.total_amount.toFixed(2)}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
