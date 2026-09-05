'use client';

import React, { useState, useEffect } from 'react';
import { localStoreAPI } from '@/lib/store';
import { Product, RawMaterial } from '@/types/erp';
import { Boxes, CheckCircle2 } from 'lucide-react';

export default function InitialStockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);

  // Form Fields
  const [category, setCategory] = useState<'RAW' | 'FG'>('FG');
  const [itemCode, setItemCode] = useState('');
  const [quantity, setQuantity] = useState<number>(100);
  const [remarks, setRemarks] = useState('Initial Opening Stock Entry');

  useEffect(() => {
    const prods = localStoreAPI.getProducts();
    const raw = localStoreAPI.getRawMaterials();
    setProducts(prods);
    setMaterials(raw);
    if (prods.length > 0) setItemCode(prods[0].code);
  }, []);

  const handleSaveStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCode || quantity <= 0) {
      alert('Please fill in valid item code and positive quantity.');
      return;
    }

    localStoreAPI.addInventoryMovement({
      date: new Date().toISOString().split('T')[0],
      type: 'ADJUSTMENT',
      category,
      item_code: itemCode,
      qty_in: Number(quantity),
      qty_out: 0,
      reference_no: `INIT-${Date.now().toString().slice(-6)}`,
      remarks,
    });

    alert(`Initial Stock Entry Saved! Added +${quantity} to ${itemCode}.`);
    setQuantity(100);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="pb-6 border-b border-[#e7e5e4]">
        <h1 className="text-3xl font-bold text-[#1c1917] font-serif flex items-center gap-2">
          <Boxes className="w-6 h-6 text-amber-700" /> Initial Stock & Opening Inventory Entry
        </h1>
        <p className="text-sm text-[#78716c] mt-1 font-medium">
          Type initial stock counts for raw oils, bottles, and finished perfumes to set your starting balances.
        </p>
      </div>

      <div className="glass-panel p-8 border-[#e7e5e4] bg-white">
        <form onSubmit={handleSaveStock} className="space-y-6">
          <div>
            <label className="form-label">Category Type *</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setCategory('FG');
                  if (products.length > 0) setItemCode(products[0].code);
                }}
                className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                  category === 'FG'
                    ? 'bg-amber-100/80 text-amber-900 border-amber-300 shadow-xs'
                    : 'bg-[#f5f4f0] text-[#57534e] border-[#e7e5e4]'
                }`}
              >
                Finished Goods (Perfumes)
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('RAW');
                  if (materials.length > 0) setItemCode(materials[0].code);
                }}
                className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                  category === 'RAW'
                    ? 'bg-purple-100/80 text-purple-900 border-purple-300 shadow-xs'
                    : 'bg-[#f5f4f0] text-[#57534e] border-[#e7e5e4]'
                }`}
              >
                Raw Materials & Packaging
              </button>
            </div>
          </div>

          <div>
            <label className="form-label">Select Item *</label>
            <select
              value={itemCode}
              onChange={e => setItemCode(e.target.value)}
              className="form-select font-bold text-amber-800 text-base py-3"
            >
              {category === 'FG'
                ? products.map(p => (
                    <option key={p.code} value={p.code}>
                      {p.code} - {p.name}
                    </option>
                  ))
                : materials.map(m => (
                    <option key={m.code} value={m.code}>
                      {m.code} - {m.description} ({m.unit})
                    </option>
                  ))}
            </select>
          </div>

          <div>
            <label className="form-label">Opening Quantity Count *</label>
            <input
              type="number"
              required
              min="1"
              value={quantity}
              onChange={e => setQuantity(parseFloat(e.target.value) || 0)}
              className="form-input font-mono text-xl text-emerald-700 font-bold py-3"
            />
          </div>

          <div>
            <label className="form-label">Remarks / Audit Note</label>
            <input
              type="text"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className="form-input"
            />
          </div>

          <button type="submit" className="btn-primary w-full justify-center text-base py-3.5 mt-4">
            <CheckCircle2 className="w-5 h-5" /> Set Initial Stock Balance
          </button>
        </form>
      </div>
    </div>
  );
}
