'use client';

import React, { useState, useEffect } from 'react';
import { localStoreAPI } from '@/lib/store';
import { Product, Recipe, ProductionBatch, InventoryMovement } from '@/types/erp';
import { FlaskConical, Plus, Clock } from 'lucide-react';

export default function ProductionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);

  // Form Fields
  const [productCode, setProductCode] = useState('');
  const [dateMixed, setDateMixed] = useState(new Date().toISOString().split('T')[0]);
  const [expectedBottles, setExpectedBottles] = useState<number>(50);
  const [macerationDays, setMacerationDays] = useState<number>(7);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const prods = localStoreAPI.getProducts();
    setProducts(prods);
    setRecipes(localStoreAPI.getRecipes());
    setBatches(localStoreAPI.getProductionBatches());
    setMovements(localStoreAPI.getInventoryMovements());
    if (prods.length > 0 && !productCode) {
      setProductCode(prods[0].code);
    }
  };

  const getRawStock = (itemCode: string) => {
    return movements
      .filter(m => m.category === 'RAW' && m.item_code === itemCode)
      .reduce((sum, m) => sum + m.qty_in - m.qty_out, 0);
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const recipe = recipes.find(r => r.product_code === productCode);
    if (!recipe) {
      alert(`No recipe formula found for product code ${productCode}. Please create a recipe in Recipe Builder first!`);
      return;
    }

    const expected = Number(expectedBottles);
    const reqOil = recipe.oil_ml * expected;
    const reqEasy = recipe.easy_blend_ml * expected;
    const reqBottle = recipe.bottle_qty * expected;
    const reqSticker = recipe.bottle_sticker_qty * expected;
    const reqBox = recipe.box_qty * expected;

    // Validate Raw Material Inventory
    const checkList = [
      { code: recipe.oil_code, req: reqOil },
      { code: 'EASY', req: reqEasy },
      { code: recipe.bottle_code, req: reqBottle },
      { code: recipe.bottle_sticker_code, req: reqSticker },
      { code: recipe.box_code, req: reqBox },
    ];

    const shortages: string[] = [];
    checkList.forEach(item => {
      const stock = getRawStock(item.code);
      if (stock < item.req) {
        shortages.push(`${item.code} (Available: ${stock}, Required: ${item.req})`);
      }
    });

    if (shortages.length > 0) {
      alert(`Insufficient Inventory to create batch:\n\n• ${shortages.join('\n• ')}`);
      return;
    }

    const dateStr = dateMixed.replace(/-/g, '');
    const count = batches.filter(b => b.product_code === productCode).length + 1;
    const batchNo = `${productCode}-${dateStr}-${String(count).padStart(3, '0')}`;

    const ready = new Date(dateMixed);
    ready.setDate(ready.getDate() + Number(macerationDays));
    const readyDateStr = ready.toISOString().split('T')[0];

    localStoreAPI.saveProductionBatch({
      batch_no: batchNo,
      product_code: productCode,
      date_mixed: dateMixed,
      maceration_days: Number(macerationDays),
      ready_date: readyDateStr,
      expected_bottles: expected,
      status: 'Macerating',
    });

    const consumptions = [
      { code: recipe.oil_code, qty: reqOil, remark: 'Oil Consumption' },
      { code: 'EASY', qty: reqEasy, remark: 'EasyBlend Consumption' },
      { code: recipe.bottle_code, qty: reqBottle, remark: 'Bottle Consumption' },
      { code: recipe.bottle_sticker_code, qty: reqSticker, remark: 'Bottle Sticker Consumption' },
      { code: recipe.box_code, qty: reqBox, remark: 'Box Consumption' },
    ];

    consumptions.forEach(c => {
      localStoreAPI.addInventoryMovement({
        date: dateMixed,
        type: 'PRODUCTION-USE',
        category: 'RAW',
        item_code: c.code,
        qty_in: 0,
        qty_out: c.qty,
        reference_no: batchNo,
        remarks: c.remark,
      });
    });

    alert(`Batch ${batchNo} Created Successfully!\nRaw materials deducted. Maceration ready date: ${readyDateStr}`);
    loadData();
  };

  const selectedRecipe = recipes.find(r => r.product_code === productCode);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="pb-6 border-b border-[#e7e5e4]">
        <h1 className="text-3xl font-bold text-[#1c1917] font-serif flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-purple-700" /> Production & Maceration Tracker
        </h1>
        <p className="text-sm text-[#78716c] mt-1 font-medium">
          Mix new batches, deduct raw material inventory, track maceration aging days, and release bottled output.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Batch Form */}
        <div className="glass-panel p-6 border-purple-200 bg-white space-y-4">
          <h3 className="text-xl font-bold text-[#1c1917] font-serif flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-700" /> Create Production Batch
          </h3>

          <form onSubmit={handleCreateBatch} className="space-y-4">
            <div>
              <label className="form-label">Perfume Scent *</label>
              <select
                value={productCode}
                onChange={e => setProductCode(e.target.value)}
                className="form-select font-bold text-amber-800"
              >
                {products.map(p => (
                  <option key={p.code} value={p.code}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Date Mixed *</label>
              <input
                type="date"
                required
                value={dateMixed}
                onChange={e => setDateMixed(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Expected Bottles *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={expectedBottles}
                  onChange={e => setExpectedBottles(parseInt(e.target.value, 10) || 0)}
                  className="form-input font-mono"
                />
              </div>

              <div>
                <label className="form-label">Maceration Days *</label>
                <input
                  type="number"
                  required
                  min="7"
                  value={macerationDays}
                  onChange={e => setMacerationDays(parseInt(e.target.value, 10) || 7)}
                  className="form-input font-mono"
                />
              </div>
            </div>

            {/* Calculated Consumption Summary */}
            {selectedRecipe ? (
              <div className="bg-[#f5f4f0] p-4 rounded-xl border border-[#e7e5e4] space-y-2 text-xs">
                <span className="font-bold text-purple-800 uppercase tracking-wider block">Raw Materials Required:</span>
                <div className="flex justify-between text-[#44403c] font-medium">
                  <span>Fragrance Oil ({selectedRecipe.oil_code}):</span>
                  <span className="font-mono font-bold text-[#1c1917]">{selectedRecipe.oil_ml * expectedBottles} ml</span>
                </div>
                <div className="flex justify-between text-[#44403c] font-medium">
                  <span>EasyBlend Base:</span>
                  <span className="font-mono font-bold text-[#1c1917]">{selectedRecipe.easy_blend_ml * expectedBottles} ml</span>
                </div>
                <div className="flex justify-between text-[#44403c] font-medium">
                  <span>Glass Bottles:</span>
                  <span className="font-mono font-bold text-[#1c1917]">{selectedRecipe.bottle_qty * expectedBottles} pcs</span>
                </div>
                <div className="flex justify-between text-[#44403c] font-medium">
                  <span>Labels & Boxes:</span>
                  <span className="font-mono font-bold text-[#1c1917]">{selectedRecipe.box_qty * expectedBottles} pcs</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-rose-800 bg-rose-50 p-3 rounded-xl border border-rose-200 font-medium">
                ⚠️ No formula mapped for this perfume yet. Please add a recipe first.
              </p>
            )}

            <button
              type="submit"
              disabled={!selectedRecipe}
              className="btn-primary w-full justify-center text-sm py-3"
            >
              Mix Batch & Deduct Inventory
            </button>
          </form>
        </div>

        {/* Batch Log & Status Table */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-[#1c1917] font-serif flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-700" /> Production History & Batches
          </h3>

          <div className="table-container glass-card">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Batch Number</th>
                  <th>Product</th>
                  <th>Date Mixed</th>
                  <th>Ready Date</th>
                  <th>Expected / Actual</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {batches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[#78716c]">
                      No production batches recorded yet.
                    </td>
                  </tr>
                ) : (
                  batches.map(b => (
                    <tr key={b.batch_no}>
                      <td className="font-mono font-bold text-purple-800">{b.batch_no}</td>
                      <td className="font-bold text-[#1c1917]">{b.product_code}</td>
                      <td className="text-xs text-[#78716c] font-medium">{b.date_mixed}</td>
                      <td className="text-xs font-mono text-[#44403c] font-semibold">{b.ready_date}</td>
                      <td className="font-mono text-xs">
                        <span className="text-[#57534e]">{b.expected_bottles} exp</span>
                        {b.actual_bottles !== undefined && (
                          <span className="text-emerald-700 font-bold ml-1">({b.actual_bottles} act)</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={
                            b.status === 'Released'
                              ? 'badge badge-approved'
                              : b.status === 'Ready'
                              ? 'badge badge-ready'
                              : 'badge badge-macerating'
                          }
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
