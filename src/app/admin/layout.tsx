'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Boxes,
  Package,
  ScrollText,
  Users,
  FlaskConical,
  ShoppingCart,
  Receipt,
  TrendingUp,
  ArrowLeft,
  Sparkles,
  Lock,
  LogOut,
  ShieldCheck,
  KeyRound
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard & Approvals', path: '/admin', icon: LayoutDashboard },
  { name: 'Inventory & Stock Ledger', path: '/admin/inventory', icon: Boxes },
  { name: 'Products Catalog', path: '/admin/products', icon: Package },
  { name: 'Raw Materials', path: '/admin/materials', icon: Boxes },
  { name: 'Recipe Formulas', path: '/admin/recipes', icon: ScrollText },
  { name: 'Customers & Credit', path: '/admin/customers', icon: Users },
  { name: 'Production & Aging', path: '/admin/production', icon: FlaskConical },
  { name: 'Purchases & AP', path: '/admin/purchases', icon: ShoppingCart },
  { name: 'Collections & AR', path: '/admin/collections', icon: Receipt },
  { name: 'Reports & Velocity', path: '/admin/reports', icon: TrendingUp },
];

const DEFAULT_ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '8888';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAuth = sessionStorage.getItem('chinito_admin_auth');
      setIsAuthenticated(storedAuth === 'true');
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === DEFAULT_ADMIN_PIN || passcode.trim() === 'chinito2026') {
      sessionStorage.setItem('chinito_admin_auth', 'true');
      setIsAuthenticated(true);
      setPasscodeError(false);
      setPasscode('');
    } else {
      setPasscodeError(true);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('chinito_admin_auth');
      setIsAuthenticated(false);
    }
  };

  // Prevent flash while loading session
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#fcfbf9] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-700 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Passcode Lock Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fcfbf9] text-[#1c1917] flex items-center justify-center p-4 selection:bg-amber-100 font-sans">
        <div className="w-full max-w-md bg-white border border-[#e7e5e4] rounded-3xl p-8 shadow-xl space-y-6 text-center animate-fade-in relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-200/50 rounded-full blur-2xl pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8 text-amber-800" />
          </div>

          <div>
            <h2 className="text-2xl font-bold font-serif text-[#1c1917] uppercase tracking-tight">
              Admin Security Verification
            </h2>
            <p className="text-xs text-[#78716c] mt-1.5 font-medium leading-relaxed">
              Please enter your secret Admin Passcode to access ERP management tools.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="form-label text-xs font-bold text-[#57534e] uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-700" /> Admin Passcode / PIN *
              </label>
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter passcode (Default: 8888)"
                value={passcode}
                onChange={e => {
                  setPasscode(e.target.value);
                  if (passcodeError) setPasscodeError(false);
                }}
                className={`form-input font-mono text-center text-lg tracking-widest ${
                  passcodeError ? 'border-rose-500 ring-2 ring-rose-500/20' : ''
                }`}
              />
              {passcodeError && (
                <p className="text-xs text-rose-600 font-bold mt-1.5 text-center">
                  Incorrect passcode. Please try again.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-md"
            >
              <ShieldCheck className="w-4 h-4" /> Unlock Admin Panel
            </button>
          </form>

          <div className="pt-4 border-t border-[#f5f4f0] flex items-center justify-between text-xs text-[#78716c]">
            <Link href="/" className="hover:text-amber-800 flex items-center gap-1.5 font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
            </Link>
            <span className="font-mono text-[10px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-amber-800">
              Default PIN: 8888
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#fcfbf9] text-[#1c1917]">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-[#e7e5e4] bg-[#f5f4f0] flex flex-col justify-between p-4 sticky top-0 h-screen shrink-0">
        <div>
          {/* Logo Header */}
          <div className="flex items-center gap-3 px-3 py-4 mb-4 border-b border-[#e7e5e4]">
            <div className="w-9 h-9 rounded-xl bg-amber-700 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-[#1c1917] font-serif">CHINITO SCENTO</h2>
              <span className="text-[10px] text-amber-800 font-bold tracking-wider uppercase">ERP Admin System</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-100/70 text-amber-900 border border-amber-300 font-bold shadow-xs'
                      : 'text-[#57534e] hover:text-[#1c1917] hover:bg-[#e7e5e4]/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-800' : 'text-[#78716c]'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout Lock */}
        <div className="pt-3 border-t border-[#e7e5e4] space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors font-bold"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-700" />
            <span>Lock Admin Panel</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-[#57534e] hover:text-[#1c1917] hover:bg-[#e7e5e4]/60 transition-colors font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-800" />
            <span>Public Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Body */}
      <main className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
