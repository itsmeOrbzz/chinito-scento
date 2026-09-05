'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { localStoreAPI } from '@/lib/store';
import { Product, RawMaterial, InventoryMovement } from '@/types/erp';
import { Boxes, PackageCheck, AlertTriangle, Plus, Trash2, Search, Info } from 'lucide-react';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'FG' | 'RAW'>('ALL');

  // Dynamic Search Input States
  const [fgSearch, setFgSearch] = useState('');
  const [rawSearch, setRawSearch] = useState('');
  const [ledgerSearch, setLedgerSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(localStoreAPI.getProducts());
    setMaterials(localStoreAPI.getRawMaterials());
    setMovements(localStoreAPI.getInventoryMovements());
  };

  const getStock = (itemCode: string) => {
    return movements
      .filter(m => m.item_code === itemCode)
      .reduce((sum, m) => sum + m.qty_in - m.qty_out, 0);
  };

  const handleDeleteMovement = (id?: string) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this inventory transaction log entry?')) return;

    const updated = movements.filter(m => m.id !== id);
    localStorage.setItem('chinito_inventory', JSON.stringify(updated));
    alert('Inventory movement log entry deleted.');
    loadData();
  };

  // Filtered Products (FG)
  const filteredProducts = products.filter(p => {
    const q = fgSearch.toLowerCase();
    return p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
  });

  // Filtered Materials (RAW)
  const filteredMaterials = materials.filter(m => {
    const q = rawSearch.toLowerCase();
    return (
      m.code.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    );
  });

  // Filtered Movement Ledger Log
  const filteredMovements = movements.filter(m => {
    if (filterCategory !== 'ALL' && m.category !== filterCategory) return false;
    const q = ledgerSearch.toLowerCase();
    if (!q) return true;
    return (
      m.item_code.toLowerCase().includes(q) ||
      (m.reference_no && m.reference_no.toLowerCase().includes(q)) ||
      m.type.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      (m.remarks && m.remarks.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#e7e5e4]">
        <div>
          <h1 className="text-3xl font-bold text-[#1c1917] font-serif flex items-center gap-2">
            <Boxes className="w-6 h-6 text-amber-700" /> Inventory & Stock Ledger
          </h1>
          <p className="text-sm text-[#78716c] mt-1 font-medium">
            Live stock balances for Finished Perfumes (FG) and Raw Materials (Oils, EasyBlend, Bottles, Boxes).
          </p>
        </div>

        <Link href="/admin/initial-stock" className="btn-primary text-sm px-5 py-2.5 rounded-xl">
          <Plus className="w-4 h-4" /> Adjust Opening Stock
        </Link>
      </div>

      {/* Terminology Guide Banner */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block text-sm font-bold text-amber-950">Inventory Categories Explained:</strong>
          <p>
            • <strong>Finished Goods (FG)</strong>: Bottled, ready-to-sell perfumes (e.g. <em>Elysian Amber 100ml</em>). Available stock decreases when customer orders are approved and increases when production batches are bottled.
          </p>
          <p>
            • <strong>Raw Materials (RAW)</strong>: Fragrance Oils ($ml$), EasyBlend Alcohol ($ml$), Glass Bottles ($pcs$), Labels ($pcs$), and Packaging Boxes ($pcs$).
          </p>
        </div>
      </div>

      {/* Stock Cards Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Finished Goods Table */}
        <div className="glass-card p-6 border-[#e7e5e4] bg-white space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1c1917] font-serif flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-amber-700" /> Finished Goods (Bottled Perfumes)
            </h2>
            <span className="badge badge-approved">{filteredProducts.length} Scents</span>
          </div>

          {/* Dynamic FG Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#78716c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search scent code or perfume name..."
              value={fgSearch}
              onChange={e => setFgSearch(e.target.value)}
              className="form-input form-input-search text-xs py-2 rounded-xl border-[#d6d3d1]"
            />
          </div>

          {/* Scrollable Container with Pinned Sticky Headers */}
          <div className="table-container max-h-[380px] overflow-y-auto relative rounded-xl border border-[#e7e5e4]">
            <table className="custom-table w-full">
              <thead>
                <tr>
                  <th className="sticky top-0 bg-[#f5f4f0] z-10 shadow-2xs">Scent Code</th>
                  <th className="sticky top-0 bg-[#f5f4f0] z-10 shadow-2xs">Perfume Scent</th>
                  <th className="sticky top-0 bg-[#f5f4f0] z-10 shadow-2xs">Current Stock</th>
                  <th className="sticky top-0 bg-[#f5f4f0] z-10 shadow-2xs">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-[#78716c] text-xs">
                      No matching finished goods found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(p => {
                    const stock = getStock(p.code);
                    return (
                      <tr key={p.code}>
                        <td className="font-mono text-amber-800 font-bold">{p.code}</td>
                        <td className="font-bold text-[#1c1917]">{p.name}</td>
                        <td className="font-mono font-bold text-sm">
                          <span className={stock < 10 ? 'text-rose-700' : 'text-emerald-700'}>
                            {stock} bottles
                          </span>
                        </td>
                        <td>
                          {stock < 10 ? (
                            <span className="badge badge-pending">Low Stock</span>
                          ) : (
                            <span className="badge badge-approved">In Stock</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Raw Materials Table */}
        <div className="glass-card p-6 border-[#e7e5e4] bg-white space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1c1917] font-serif flex items-center gap-2">
              <Boxes className="w-5 h-5 text-purple-700" /> Raw Materials & Ingredients
            </h2>
            <span className="badge badge-macerating">{filteredMaterials.length} Materials</span>
          </div>

          {/* Dynamic Raw Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#78716c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search material code, description, or category..."
              value={rawSearch}
              onChange={e => setRawSearch(e.target.value)}
              className="form-input form-input-search text-xs py-2 rounded-xl border-[#d6d3d1]"
            />
          </div>

          {/* Scrollable Container with Pinned Sticky Headers */}
          <div className="table-container max-h-[380px] overflow-y-auto relative rounded-xl border border-[#e7e5e4]">
            <table className="custom-table w-full">
              <thead>
                <tr>
                  <th className="sticky top-0 bg-[#f5f4f0] z-10 shadow-2xs">Material</th>
                  <th className="sticky top-0 bg-[#f5f4f0] z-10 shadow-2xs">Category</th>
                  <th className="sticky top-0 bg-[#f5f4f0] z-10 shadow-2xs">Available Stock</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-[#78716c] text-xs">
                      No matching raw materials found.
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map(m => {
                    const stock = getStock(m.code);
                    const isLow = m.unit === 'ml' ? stock < 500 : stock < 50;
                    return (
                      <tr key={m.code}>
                        <td>
                          <div className="font-bold text-[#1c1917]">{m.description}</div>
                          <div className="text-xs font-mono text-[#78716c]">{m.code}</div>
                        </td>
                        <td>
                          <span className="text-xs px-2 py-0.5 rounded bg-[#f5f4f0] text-[#44403c] font-bold border border-[#e7e5e4]">
                            {m.category}
                          </span>
                        </td>
                        <td className="font-mono font-bold">
                          <span className={isLow ? 'text-amber-800' : 'text-[#1c1917]'}>
                            {stock.toLocaleString()} {m.unit}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Movement Ledger Audit Log */}
      <div className="space-y-4 pt-6 border-t border-[#e7e5e4]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#1c1917] font-serif">Detailed Stock Movement Ledger Log</h2>
            <p className="text-xs text-[#78716c] font-medium">Full audit trail of all inventory transactions and stock movements.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Dynamic Ledger Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-[#78716c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search ledger by code, ref #, or remarks..."
                value={ledgerSearch}
                onChange={e => setLedgerSearch(e.target.value)}
                className="form-input form-input-search text-xs py-2 rounded-xl border-[#d6d3d1]"
              />
            </div>

            <div className="flex items-center gap-1 bg-[#f5f4f0] p-1 rounded-xl border border-[#e7e5e4]">
              <button
                onClick={() => setFilterCategory('ALL')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  filterCategory === 'ALL' ? 'bg-white text-amber-800 shadow-xs' : 'text-[#78716c]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterCategory('FG')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  filterCategory === 'FG' ? 'bg-white text-amber-800 shadow-xs' : 'text-[#78716c]'
                }`}
              >
                FG
              </button>
              <button
                onClick={() => setFilterCategory('RAW')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  filterCategory === 'RAW' ? 'bg-white text-amber-800 shadow-xs' : 'text-[#78716c]'
                }`}
              >
                RAW
              </button>
            </div>
          </div>
        </div>

        {/* Ledger Table with Pinned Sticky Headers */}
        <div className="table-container glass-card max-h-[450px] overflow-y-auto relative rounded-xl border border-[#e7e5e4]">
          <table className="custom-table w-full">
            <thead>
              <tr>
                <th className="sticky top-0 bg-[#f5f4f0] z-10 shadow-2xs">Date</th>
                <th className="sticky top-0 bg-[#f5f4f0] z-10 shadow-2xs">Type</th>
                <th className="sticky top-0 bg-[#f5f4f0] z-10 shadow-2xs">Category</th>
                <th className="sticky top-0 bg-[#f5f4f0] z-10 shadow-2xs">Item Code</th>
                <th className="sticky top-0 bg-[#f5f4f0] z-10 shadow-2xs">Qty In</th>
                <th className="sticky top-0 bg-[#f5f4f0] z-10 shadow-2xs">Qty Out</th>
                <th className="sticky top-0 bg-[#f5f4f0] z-10 shadow-2xs">Reference #</th>
                <th className="sticky top-0 bg-[#f5f4f0] z-10 shadow-2xs">Remarks</th>
                <th className="sticky top-0 bg-[#f5f4f0] z-10 shadow-2xs">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-[#78716c] text-xs">
                    No matching inventory movements found.
                  </td>
                </tr>
              ) : (
                filteredMovements.slice().reverse().map(m => (
                  <tr key={m.id || m.reference_no}>
                    <td className="text-xs text-[#78716c] font-medium">{m.date}</td>
                    <td>
                      <span className="text-xs font-bold text-amber-800 px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                        {m.type}
                      </span>
                    </td>
                    <td className="font-mono text-xs font-bold text-[#57534e]">{m.category}</td>
                    <td className="font-mono font-bold text-[#1c1917]">{m.item_code}</td>
                    <td className="font-mono text-emerald-700 font-bold">
                      {m.qty_in > 0 ? `+${m.qty_in}` : '-'}
                    </td>
                    <td className="font-mono text-rose-700 font-bold">
                      {m.qty_out > 0 ? `-${m.qty_out}` : '-'}
                    </td>
                    <td className="font-mono text-xs text-[#57534e]">{m.reference_no}</td>
                    <td className="text-xs text-[#78716c]">{m.remarks || '-'}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteMovement(m.id)}
                        className="text-rose-700 hover:text-rose-900 p-1 rounded hover:bg-rose-50"
                        title="Delete log entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
