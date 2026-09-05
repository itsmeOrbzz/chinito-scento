'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { localStoreAPI, syncFromSupabase } from '@/lib/store';
import { Product, PaymentType, CustomerType, SalesOrderLine, SalesOrder } from '@/types/erp';
import {
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Tag,
  Plus,
  Minus,
  Search,
  Clock,
  PackageCheck,
  XCircle,
  Truck,
  FileText,
  Award
} from 'lucide-react';

interface HeroScent {
  code: string;
  name: string;
  family: string;
  image: string;
  price: number;
  badgeColor: string;
  glowClass: string;
  tagline: string;
  description: string;
}

const HERO_SCENTS: HeroScent[] = [
  {
    code: 'SCENT-01',
    name: 'Elysian Amber',
    family: 'Amber & Warm Wood',
    image: '/hero-assets/elysian-amber.png',
    price: 1250,
    badgeColor: '#c2410c',
    glowClass: 'hero-glow-amber',
    tagline: 'Warm golden amber resin with Tahitian vanilla & smoky cedarwood.',
    description: 'An opulent fragrance opening with vibrant Italian bergamot and pink pepper, evolving into golden resin and rich cedarwood.',
  },
  {
    code: 'SCENT-02',
    name: 'Midnight Bloom',
    family: 'Floral & Night Violet',
    image: '/hero-assets/midnight-bloom.png',
    price: 1200,
    badgeColor: '#7e22ce',
    glowClass: 'hero-glow-purple',
    tagline: 'Deep nocturnal French rose infused with dark plum & Iris.',
    description: 'Sensual nocturnal floral blend opening with ripe dark plum, blooming French rose centifolia, and a long-lasting cashmere musk base.',
  },
  {
    code: 'SCENT-03',
    name: 'Guam Vanilla',
    family: 'Gourmand & Sweet Bourbon',
    image: '/hero-assets/guam-vanilla.png',
    price: 1350,
    badgeColor: '#be123c',
    glowClass: 'hero-glow-rose',
    tagline: 'Tropical bourbon vanilla bean with toasted macadamia & coconut.',
    description: 'Indulgent gourmet blend combining coconut blossom and toasted macadamia with pure Madagascar bourbon vanilla bean.',
  },
  {
    code: 'SCENT-04',
    name: 'Solstice Wood',
    family: 'Woody & Cambodian Oud',
    image: '/hero-assets/solstice-wood.png',
    price: 1400,
    badgeColor: '#047857',
    glowClass: 'hero-glow-emerald',
    tagline: 'Rare Cambodian oud combined with spiced cardamom & smoky leather.',
    description: 'A dark, magnetic woody composition featuring wild cardamom, saffron, and rare Cambodian oud aged to perfection.',
  },
];

export default function PublicStorefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ soNo: string } | null>(null);

  // Active Hero State
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [heroQuantity, setHeroQuantity] = useState(1);

  // Category Filter State
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

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

  useEffect(() => {
    const refreshProducts = () => {
      const activeProducts = localStoreAPI.getProducts().filter(p => p.status === 'ACTIVE');
      setProducts(activeProducts);

      // Dynamically preload ALL current AND future product images added by the client
      if (typeof window !== 'undefined') {
        const urlsToPreload = new Set<string>();
        
        HERO_SCENTS.forEach(s => s.image && urlsToPreload.add(s.image));
        activeProducts.forEach(p => p.image_url && urlsToPreload.add(p.image_url));

        urlsToPreload.forEach(url => {
          const img = new Image();
          img.src = url;
        });
      }
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

  const currentHero = HERO_SCENTS[activeHeroIndex];
  const currentHeroUnitPrice = currentHero.price;

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
  };

  const addHeroToCart = () => {
    const matchedProduct: Product = {
      code: currentHero.code,
      name: currentHero.name,
      selling_price: currentHeroUnitPrice,
      description: currentHero.tagline,
      status: 'ACTIVE',
      image_url: currentHero.image,
    };
    addToCart(matchedProduct, heroQuantity);
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

  const filteredProducts = products.filter(p => {
    if (selectedCategoryFilter === 'ALL') return true;
    if (selectedCategoryFilter === 'AMBER') return p.code === 'SCENT-01' || p.name.includes('Amber');
    if (selectedCategoryFilter === 'FLORAL') return p.code === 'SCENT-02' || p.name.includes('Bloom') || p.name.includes('Rose');
    if (selectedCategoryFilter === 'GOURMAND') return p.code === 'SCENT-03' || p.name.includes('Vanilla');
    if (selectedCategoryFilter === 'WOODY') return p.code === 'SCENT-04' || p.name.includes('Wood') || p.name.includes('Oud');
    return true;
  });

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-[#1c1917] pb-16 selection:bg-amber-100 overflow-x-hidden font-sans">
      {/* Light Mode Clean Header (STICKY header anchored to top when scrolling down) */}
      <header className="sticky top-0 z-40 bg-[#f5f4f0]/95 backdrop-blur-md border-b border-[#e7e5e4] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 shrink-0">
            <img
              src="/hero-assets/logo.png"
              alt="Chinito Scento Logo"
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl bg-white p-1 border border-amber-200 shadow-xs"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-[#1c1917] font-serif uppercase">
                CHINITO SCENTO
              </h1>
              <p className="text-[10px] sm:text-[11px] text-amber-800 font-semibold tracking-wide">Artisanal Fragrances</p>
            </div>
          </div>

          {/* Action Buttons: ONLY Track Order and Cart */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => {
                setIsTrackModalOpen(true);
                if (trackingQuery) handleTrackSearch();
              }}
              className="btn-secondary text-xs px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border-[#d6d3d1] text-[#44403c] flex items-center gap-1.5 font-semibold"
            >
              <Search className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="hidden sm:inline">Track Order</span>
              <span className="sm:hidden">Track</span>
            </button>

            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="relative btn-primary text-xs sm:text-sm px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-md"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Cart</span>
              {cart.length > 0 && (
                <span className="bg-white text-amber-800 text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center border border-amber-300">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* FIGMA-INSPIRED WARM LIGHT MODE HERO SHOWCASE */}
      <section className={`relative min-h-[80vh] flex items-center pt-6 sm:pt-8 pb-12 sm:pb-16 transition-all duration-700 ${currentHero.glowClass}`}>
        {/* Giant Watermark Typography in Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <span className="hero-watermark font-serif text-[18vw] sm:text-[14vw]">CHINITO</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* LEFT COLUMN: Title, Description, Price, and Cart Action */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <div>
                <span className="text-[11px] sm:text-xs font-mono font-bold text-amber-800 block mb-1 uppercase tracking-widest">{currentHero.code} • {currentHero.family}</span>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-serif text-[#1c1917] tracking-tight leading-none uppercase">
                  {currentHero.name}
                </h2>
                <p className="text-xs sm:text-sm text-[#57534e] mt-3 sm:mt-4 leading-relaxed font-medium">
                  {currentHero.description}
                </p>
              </div>

              {/* Price & Add to Order Section (Clean Stacked Layout) */}
              <div className="space-y-4 pt-1">
                {/* Price Display */}
                <div>
                  <span className="text-[10px] text-[#78716c] block font-bold uppercase tracking-wider mb-1">Retail Price</span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl sm:text-5xl font-extrabold text-amber-900 font-mono tracking-tight">
                      ₱{currentHeroUnitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      In Stock
                    </span>
                  </div>
                </div>

                {/* Counter & Action Button Row */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white border border-[#d6d3d1] rounded-2xl p-1 shadow-2xs shrink-0">
                    <button
                      type="button"
                      onClick={() => setHeroQuantity(q => Math.max(1, q - 1))}
                      className="w-9 h-9 flex items-center justify-center text-[#78716c] hover:text-[#1c1917] hover:bg-[#f5f4f0] rounded-xl transition-colors font-bold"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-9 text-center text-sm font-bold text-[#1c1917] font-mono">{heroQuantity}</span>
                    <button
                      type="button"
                      onClick={() => setHeroQuantity(q => q + 1)}
                      className="w-9 h-9 flex items-center justify-center text-[#78716c] hover:text-[#1c1917] hover:bg-[#f5f4f0] rounded-xl transition-colors font-bold"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={addHeroToCart}
                    className="btn-primary text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-2 font-bold uppercase tracking-wider whitespace-nowrap flex-1 shrink-0"
                  >
                    <ShoppingBag className="w-4 h-4 shrink-0" />
                    <span>Add to Order</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CENTER COLUMN: Spotlight Bottle Display */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative my-4 lg:my-0">
              
              {/* Center Spotlight Bottle Box */}
              <div className="relative w-full max-w-[260px] sm:max-w-sm lg:max-w-md aspect-square rounded-3xl bg-white/80 border border-[#e7e5e4] p-6 sm:p-8 shadow-xl overflow-hidden group flex items-center justify-center backdrop-blur-xs">
                <img
                  src={currentHero.image}
                  alt={currentHero.name}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-contain filter drop-shadow-2xl group-hover:scale-105 group-hover:rotate-2 transition-all duration-700"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80';
                  }}
                />
              </div>

            </div>

            {/* RIGHT COLUMN: Vertical Circular Swatch Variant Selector */}
            <div className="lg:col-span-2 flex lg:flex-col items-center justify-start lg:justify-center gap-3 overflow-x-auto w-full pb-2 lg:pb-0 scrollbar-none">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#78716c] hidden lg:block mb-2">Switch Scent</span>
              {HERO_SCENTS.map((scent, idx) => (
                <button
                  key={scent.code}
                  onClick={() => {
                    setActiveHeroIndex(idx);
                    setHeroQuantity(1);
                  }}
                  className={`group relative p-2.5 sm:p-3 rounded-2xl transition-all border flex items-center gap-3 shrink-0 w-44 lg:w-full max-w-none ${
                    idx === activeHeroIndex
                      ? 'bg-white border-amber-700 shadow-md scale-102 ring-2 ring-amber-500/20'
                      : 'bg-white/80 border-[#e7e5e4] hover:bg-white hover:border-amber-300'
                  }`}
                >
                  {/* Glowing Circular Color Swatch */}
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0 shadow-xs transition-transform group-hover:scale-110 flex items-center justify-center border-2 border-white"
                    style={{ backgroundColor: scent.badgeColor }}
                  >
                    {idx === activeHeroIndex && <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white shadow-xs" />}
                  </div>

                  <div className="text-left font-sans truncate">
                    <span className="text-xs font-bold text-[#1c1917] block leading-tight truncate">{scent.name}</span>
                    <span className="text-[10px] text-[#78716c] font-mono block mt-0.5">{scent.code}</span>
                  </div>
                </button>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Main Scent Catalog Grid */}
      <section className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-[#1c1917] font-serif flex items-center gap-2 uppercase">
              <Tag className="w-5 h-5 text-amber-700" /> Full Scent Collection
            </h3>
            <p className="text-xs text-[#78716c] mt-0.5 font-medium">Handcrafted artisanal fragrance blends.</p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-[#f5f4f0] p-1.5 rounded-2xl border border-[#e7e5e4]">
            <button
              onClick={() => setSelectedCategoryFilter('ALL')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                selectedCategoryFilter === 'ALL' ? 'bg-white text-amber-800 shadow-xs' : 'text-[#78716c]'
              }`}
            >
              All Scents
            </button>
            <button
              onClick={() => setSelectedCategoryFilter('AMBER')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                selectedCategoryFilter === 'AMBER' ? 'bg-white text-amber-800 shadow-xs' : 'text-[#78716c]'
              }`}
            >
              Amber
            </button>
            <button
              onClick={() => setSelectedCategoryFilter('FLORAL')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                selectedCategoryFilter === 'FLORAL' ? 'bg-white text-amber-800 shadow-xs' : 'text-[#78716c]'
              }`}
            >
              Floral
            </button>
            <button
              onClick={() => setSelectedCategoryFilter('GOURMAND')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                selectedCategoryFilter === 'GOURMAND' ? 'bg-white text-amber-800 shadow-xs' : 'text-[#78716c]'
              }`}
            >
              Gourmand
            </button>
            <button
              onClick={() => setSelectedCategoryFilter('WOODY')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                selectedCategoryFilter === 'WOODY' ? 'bg-white text-amber-800 shadow-xs' : 'text-[#78716c]'
              }`}
            >
              Woody
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => {
            const heroMatch = HERO_SCENTS.find(h => h.code === product.code);
            const imageSrc = heroMatch ? heroMatch.image : (product.image_url || '/hero-assets/elysian-amber.png');

            return (
              <div key={product.code} className="glass-card overflow-hidden flex flex-col group bg-white border-[#e7e5e4] rounded-3xl">
                <div className="relative h-64 w-full bg-[#f5f4f0] overflow-hidden">
                  <img
                    src={imageSrc}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-[#e7e5e4] text-amber-900 text-xs font-bold shadow-xs">
                    {product.code}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-xl font-bold text-[#1c1917] font-serif mb-1">{product.name}</h4>
                    <p className="text-[#57534e] text-xs leading-relaxed line-clamp-3 font-medium">
                      {product.description || 'Premium long-lasting fragrance crafted with essential perfume oils.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#f5f4f0]">
                    <div>
                      <span className="text-[10px] text-[#78716c] block font-bold uppercase tracking-wider">Selling Price</span>
                      <span className="text-2xl font-extrabold text-amber-800 font-mono">
                        ₱{product.selling_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      className="btn-primary text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 font-bold uppercase"
                    >
                      <Plus className="w-4 h-4" /> Add to Order
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Customer Order Tracking Modal */}
      {isTrackModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box max-w-2xl bg-white border-[#e7e5e4]">
            <div className="p-5 border-b border-[#e7e5e4] flex items-center justify-between bg-[#f5f4f0] shrink-0">
              <h3 className="text-lg font-bold text-[#1c1917] font-serif flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-700" /> Customer Order Tracking & Live Status
              </h3>
              <button
                onClick={() => setIsTrackModalOpen(false)}
                className="text-[#78716c] hover:text-[#1c1917] font-bold text-lg px-2"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Search Bar */}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleTrackSearch();
                }}
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#78716c] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your Order # (e.g. SO-123456) or your Name / Phone..."
                    value={trackingQuery}
                    onChange={e => setTrackingQuery(e.target.value)}
                    className="form-input form-input-search"
                  />
                </div>
                <button type="submit" className="btn-primary text-xs px-5 font-bold">
                  Track Order
                </button>
              </form>

              {/* Lookup Results */}
              {hasSearchedTrack && (
                <div className="space-y-4">
                  {trackedOrders.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-[#e7e5e4] rounded-2xl bg-[#fcfbf9]">
                      <XCircle className="w-10 h-10 text-rose-500 mx-auto mb-2 opacity-80" />
                      <p className="text-sm font-bold text-[#1c1917]">No order found for "{trackingQuery}"</p>
                      <p className="text-xs text-[#78716c] mt-1">
                        Please double check your Order reference code (e.g. <code>SO-xxxxxx</code>) or contact customer support.
                      </p>
                    </div>
                  ) : (
                    trackedOrders.map(so => {
                      const isPending = so.status === 'PENDING APPROVAL';
                      const isApproved = so.status === 'APPROVED' || so.status === 'PARTIAL' || so.status === 'PAID';
                      const isRejected = so.status === 'REJECTED';
                      const isPaid = so.status === 'PAID';

                      return (
                        <div key={so.so_no} className="glass-card p-6 border-amber-300 space-y-6 bg-white rounded-3xl">
                          {/* Order Summary Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#e7e5e4]">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold font-mono text-amber-800">{so.so_no}</span>
                                <span className={
                                  isPaid ? 'badge badge-approved' :
                                  isApproved ? 'badge badge-ready' :
                                  isRejected ? 'btn-danger text-[10px] py-0.5' :
                                  'badge badge-pending'
                                }>
                                  {so.status}
                                </span>
                              </div>
                              <p className="text-xs text-[#78716c] mt-1">
                                Placed on {new Date(so.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>

                            <div className="sm:text-right">
                              <span className="text-xs text-[#78716c] block">Total Amount</span>
                              <span className="text-xl font-bold text-amber-900 font-mono">
                                ₱{so.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>

                          {/* Order Visual Stepper */}
                          <div className="bg-[#f5f4f0] p-4 rounded-2xl border border-[#e7e5e4] space-y-3">
                            <span className="text-[11px] font-bold text-[#78716c] uppercase tracking-wider block">Live Order Stepper</span>
                            <div className="grid grid-cols-4 gap-2 text-center text-xs">
                              <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold mb-1 shadow-xs">
                                  ✓
                                </div>
                                <span className="font-bold text-[#1c1917]">Submitted</span>
                              </div>

                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 ${
                                  isApproved ? 'bg-emerald-600 text-white' :
                                  isRejected ? 'bg-rose-600 text-white' :
                                  'bg-amber-500 text-white animate-pulse'
                                }`}>
                                  {isApproved ? '✓' : isRejected ? '✕' : '⏳'}
                                </div>
                                <span className="font-bold text-[#1c1917]">
                                  {isApproved ? 'Approved' : isRejected ? 'Declined' : 'Reviewing'}
                                </span>
                              </div>

                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 ${
                                  isApproved ? 'bg-blue-600 text-white' : 'bg-stone-200 text-stone-500'
                                }`}>
                                  📦
                                </div>
                                <span className="font-bold text-[#1c1917]">Allocated</span>
                              </div>

                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 ${
                                  isPaid ? 'bg-emerald-700 text-white' : 'bg-stone-200 text-stone-500'
                                }`}>
                                  🚚
                                </div>
                                <span className="font-bold text-[#1c1917]">Fulfilled</span>
                              </div>
                            </div>

                            {/* Informational Message Box */}
                            <div className="mt-3 p-3 rounded-xl bg-white border border-[#e7e5e4] text-xs leading-relaxed">
                              {isPending && (
                                <p className="text-amber-900">
                                  <strong>Status Note:</strong> Your order is currently under review by Chinito Scento owners. Available stock is being verified.
                                </p>
                              )}
                              {isApproved && (
                                <p className="text-emerald-900">
                                  <strong>Status Note:</strong> Your order has been APPROVED! Finished goods are allocated and being prepared for delivery/pickup.
                                </p>
                              )}
                              {isRejected && (
                                <p className="text-rose-900">
                                  <strong>Status Note:</strong> Your order was declined or cancelled. Please contact customer service for assistance.
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Line Items Breakdown */}
                          <div>
                            <span className="text-xs font-bold text-[#78716c] uppercase tracking-wider block mb-2">Order Line Items</span>
                            <div className="space-y-2">
                              {so.lines.map((line, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-[#fbfaf8] border border-[#e7e5e4]">
                                  <div>
                                    <span className="font-bold text-[#1c1917]">{line.product_name}</span>
                                    <span className="text-[#78716c] ml-2">({line.quantity} pcs @ ₱{line.unit_price.toFixed(2)})</span>
                                  </div>
                                  <span className="font-mono font-bold text-amber-800">₱{line.line_amount.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Customer & Delivery Summary */}
                          <div className="text-xs space-y-1 text-[#57534e] pt-2 border-t border-[#e7e5e4]">
                            <p>Customer Name: <strong>{so.customer_name}</strong> ({so.customer_type})</p>
                            <p>Payment Form: <strong>{so.payment_form}</strong></p>
                            {so.delivery_address && <p>Delivery Address: <strong>{so.delivery_address}</strong></p>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#e7e5e4] flex justify-end shrink-0">
              <button onClick={() => setIsTrackModalOpen(false)} className="btn-secondary text-xs px-5">
                Close Tracker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart & Checkout Modal */}
      {isOrderModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box max-w-2xl bg-white border-[#e7e5e4]">
            <div className="p-5 border-b border-[#e7e5e4] flex items-center justify-between bg-[#f5f4f0] shrink-0">
              <h3 className="text-lg font-bold text-[#1c1917] font-serif flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-700" /> Complete Your Scent Order
              </h3>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="text-[#78716c] hover:text-[#1c1917] text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOrderSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Order Items Table */}
              <div>
                <h4 className="text-xs font-bold text-[#78716c] uppercase tracking-wider mb-3">Selected Scents</h4>
                {cart.length === 0 ? (
                  <p className="text-sm text-[#78716c] text-center py-6 border border-dashed border-[#e7e5e4] rounded-2xl">
                    Your cart is empty. Add scents from the catalog above!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.product.code} className="flex items-center justify-between p-3 rounded-2xl bg-[#fbfaf8] border border-[#e7e5e4]">
                        <div className="flex-1">
                          <h5 className="font-semibold text-[#1c1917] text-sm">{item.product.name}</h5>
                          <span className="text-xs text-[#78716c] font-mono">₱{item.product.selling_price.toFixed(2)} each</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 bg-white border border-[#d6d3d1] rounded-xl p-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.code, -1)}
                              className="w-6 h-6 flex items-center justify-center text-[#78716c] hover:text-[#1c1917] font-bold"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-[#1c1917]">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.code, 1)}
                              className="w-6 h-6 flex items-center justify-center text-[#78716c] hover:text-[#1c1917] font-bold"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-amber-800 font-mono w-24 text-right">
                            ₱{(item.product.selling_price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-between items-center pt-3 border-t border-[#e7e5e4] text-base font-bold">
                      <span className="text-[#44403c]">Total Amount:</span>
                      <span className="text-2xl text-amber-800 font-mono">₱{totalCartAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Details Form */}
              <div className="space-y-4 pt-4 border-t border-[#e7e5e4]">
                <h4 className="text-xs font-bold text-[#78716c] uppercase tracking-wider">Delivery & Contact Details</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maria Santos"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Contact Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0917-123-4567"
                      value={customerContact}
                      onChange={e => setCustomerContact(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Customer Type</label>
                    <select
                      value={customerType}
                      onChange={e => setCustomerType(e.target.value as CustomerType)}
                      className="form-select"
                    >
                      <option value="Walk-In">Retail Customer</option>
                      <option value="Reseller">Reseller Partner</option>
                      <option value="Distributor">Bulk Distributor</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Payment Preference</label>
                    <select
                      value={paymentForm}
                      onChange={e => setPaymentForm(e.target.value as PaymentType)}
                      className="form-select"
                    >
                      <option value="GCASH">GCash</option>
                      <option value="CASH">Cash on Delivery</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CREDIT">Credit (Terms apply)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Delivery Address</label>
                  <textarea
                    rows={2}
                    placeholder="Enter complete shipping/delivery address..."
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#e7e5e4] flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cart.length === 0}
                  className="btn-primary text-sm px-6 py-2.5 font-bold uppercase"
                >
                  Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {orderSuccess && (
        <div className="modal-overlay">
          <div className="modal-box max-w-md p-8 text-center animate-fade-in border-emerald-300 bg-white shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-[#1c1917] font-serif mb-1">Order Successfully Placed!</h3>
            <p className="text-xs text-[#78716c] font-medium mb-3">
              Thank you for choosing Chinito Scento Artisanal Fine Fragrances.
            </p>

            {/* BIG ORDER REFERENCE NUMBER DISPLAY */}
            <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl my-3 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">Your Order Reference Number</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-900 font-mono tracking-wider select-all">
                {orderSuccess.soNo}
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(orderSuccess.soNo);
                  alert(`Copied Order Reference (${orderSuccess.soNo}) to clipboard!`);
                }}
                className="text-xs text-amber-800 font-bold underline hover:text-amber-950 inline-block pt-1"
              >
                📋 Copy Order Reference Number
              </button>
            </div>

            {/* HIGH VISIBILITY REMINDER ALERT BOX */}
            <div className="p-4 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-950 text-xs text-left mb-6 leading-relaxed space-y-1.5 shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-950 text-sm">
                <span className="text-base">⚠️</span> PLEASE SAVE YOUR ORDER NUMBER!
              </div>
              <p className="text-amber-900">
                Please take a screenshot or write down your order reference number <strong>({orderSuccess.soNo})</strong>. You will need it to track your live order & delivery status anytime using the <strong>Track Order</strong> button on our storefront.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setTrackingQuery(orderSuccess.soNo);
                  setIsTrackModalOpen(true);
                  handleTrackSearch(orderSuccess.soNo);
                  setOrderSuccess(null);
                }}
                className="btn-primary w-full justify-center text-xs py-3 font-bold uppercase"
              >
                Track Order Status Now 🔍
              </button>

              <button
                onClick={() => setOrderSuccess(null)}
                className="btn-secondary w-full justify-center text-xs py-2.5"
              >
                Back to Catalog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
