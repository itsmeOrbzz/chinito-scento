'use client';

import React, { useState, useEffect } from 'react';
import { localStoreAPI, syncFromSupabase } from '@/lib/store';
import { Product, RawMaterial, Recipe } from '@/types/erp';
import { ScrollText, Plus, Edit2, FlaskConical, Trash2 } from 'lucide-react';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // Form Fields
  const [productCode, setProductCode] = useState('');
  const [oilCode, setOilCode] = useState('');
  const [oilML, setOilML] = useState<number>(25);
  const [easyBlendML, setEasyBlendML] = useState<number>(75);
  const [bottleCode, setBottleCode] = useState('');
  const [bottleQty, setBottleQty] = useState<number>(1);
  const [bottleStickerCode, setBottleStickerCode] = useState('');
  const [bottleStickerQty, setBottleStickerQty] = useState<number>(1);
  const [boxCode, setBoxCode] = useState('');
  const [boxQty, setBoxQty] = useState<number>(1);

  useEffect(() => {
    loadData();
    syncFromSupabase().then(() => loadData());
  }, []);

  const loadData = () => {
    setRecipes(localStoreAPI.getRecipes());
    setProducts(localStoreAPI.getProducts());
    setMaterials(localStoreAPI.getRawMaterials());
  };

  const openCreateModal = () => {
    setEditingRecipe(null);
    setProductCode(products[0]?.code || '');
    const oils = materials.filter(m => m.category === 'OIL');
    const bottles = materials.filter(m => m.category === 'BOTTLE');
    const stickers = materials.filter(m => m.category === 'STICKER');
    const boxes = materials.filter(m => m.category === 'BOX');

    setOilCode(oils[0]?.code || '');
    setOilML(25);
    setEasyBlendML(75);
    setBottleCode(bottles[0]?.code || '');
    setBottleQty(1);
    setBottleStickerCode(stickers[0]?.code || '');
    setBottleStickerQty(1);
    setBoxCode(boxes[0]?.code || '');
    setBoxQty(1);
    setIsModalOpen(true);
  };

  const openEditModal = (r: Recipe) => {
    setEditingRecipe(r);
    setProductCode(r.product_code);
    setOilCode(r.oil_code);
    setOilML(r.oil_ml);
    setEasyBlendML(r.easy_blend_ml);
    setBottleCode(r.bottle_code);
    setBottleQty(r.bottle_qty);
    setBottleStickerCode(r.bottle_sticker_code);
    setBottleStickerQty(r.bottle_sticker_qty);
    setBoxCode(r.box_code);
    setBoxQty(r.box_qty);
    setIsModalOpen(true);
  };

  const handleDelete = (productCodeToDelete: string) => {
    if (!confirm(`Are you sure you want to delete the recipe formula for ${productCodeToDelete}?`)) return;
    localStoreAPI.deleteRecipe(productCodeToDelete);
    alert(`Recipe formula for ${productCodeToDelete} deleted.`);
    loadData();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productCode || !oilCode || !bottleCode) {
      alert('Please fill in required fields.');
      return;
    }

    localStoreAPI.saveRecipe({
      id: editingRecipe?.id,
      product_code: productCode,
      oil_code: oilCode,
      oil_ml: Number(oilML),
      easy_blend_ml: Number(easyBlendML),
      bottle_code: bottleCode,
      bottle_qty: Number(bottleQty),
      bottle_sticker_code: bottleStickerCode,
      bottle_sticker_qty: Number(bottleStickerQty),
      box_code: boxCode,
      box_qty: Number(boxQty),
    });

    setIsModalOpen(false);
    loadData();
  };

  const oils = materials.filter(m => m.category === 'OIL');
  const bottles = materials.filter(m => m.category === 'BOTTLE');
  const stickers = materials.filter(m => m.category === 'STICKER');
  const boxes = materials.filter(m => m.category === 'BOX');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#e7e5e4]">
        <div>
          <h1 className="text-3xl font-bold text-[#1c1917] font-serif flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-amber-700" /> Recipe Builder & BOM Formulas
          </h1>
          <p className="text-sm text-[#78716c] mt-1 font-medium">
            Map perfume scents to their exact fragrance oil ML, EasyBlend ML, bottles, and boxes.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn-primary text-sm px-5 py-2.5 rounded-xl">
          <Plus className="w-4 h-4" /> Create Recipe Formula
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recipes.map(r => {
          const product = products.find(p => p.code === r.product_code);
          return (
            <div key={r.product_code} className="glass-card p-6 flex flex-col justify-between bg-white">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-amber-800">{r.product_code}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(r)}
                      className="btn-secondary text-xs px-2.5 py-1"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r.product_code)}
                      className="btn-danger text-xs px-2.5 py-1"
                      title="Delete recipe"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-[#1c1917] font-serif mb-4">
                  {product?.name || r.product_code}
                </h3>

                <div className="space-y-2 text-xs bg-[#f5f4f0] p-4 rounded-xl border border-[#e7e5e4]">
                  <div className="flex justify-between py-1 border-b border-[#e7e5e4]">
                    <span className="text-[#57534e] flex items-center gap-1.5 font-medium">
                      <FlaskConical className="w-3.5 h-3.5 text-amber-700" /> Fragrance Oil ({r.oil_code}):
                    </span>
                    <span className="font-mono font-bold text-amber-800">{r.oil_ml} ml / bottle</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#e7e5e4]">
                    <span className="text-[#57534e] font-medium">EasyBlend Alcohol (EASY):</span>
                    <span className="font-mono font-bold text-[#1c1917]">{r.easy_blend_ml} ml / bottle</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#e7e5e4]">
                    <span className="text-[#57534e] font-medium">Glass Bottle ({r.bottle_code}):</span>
                    <span className="font-mono font-bold text-[#1c1917]">{r.bottle_qty} pcs</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#e7e5e4]">
                    <span className="text-[#57534e] font-medium">Bottle Sticker ({r.bottle_sticker_code}):</span>
                    <span className="font-mono font-bold text-[#1c1917]">{r.bottle_sticker_qty} pcs</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-[#57534e] font-medium">Packaging Box ({r.box_code}):</span>
                    <span className="font-mono font-bold text-[#1c1917]">{r.box_qty} pcs</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box max-w-xl">
            <div className="p-5 border-b border-[#e7e5e4] flex items-center justify-between bg-[#f5f4f0] shrink-0">
              <h3 className="text-lg font-bold text-[#1c1917] font-serif flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-amber-700" />
                {editingRecipe ? 'Edit Recipe Formula' : 'Map New Recipe Formula'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#78716c] hover:text-[#1c1917] font-bold text-lg px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="form-label">Select Perfume Product *</label>
                <select
                  disabled={!!editingRecipe}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Fragrance Oil *</label>
                  <select
                    value={oilCode}
                    onChange={e => setOilCode(e.target.value)}
                    className="form-select"
                  >
                    {oils.map(m => (
                      <option key={m.code} value={m.code}>
                        {m.code} ({m.description})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Oil Quantity (ml per bottle) *</label>
                  <input
                    type="number"
                    required
                    value={oilML}
                    onChange={e => setOilML(parseFloat(e.target.value) || 0)}
                    className="form-input font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Solvent (EasyBlend)</label>
                  <input type="text" disabled value="EASY (EasyBlend Base)" className="form-input opacity-70" />
                </div>

                <div>
                  <label className="form-label">EasyBlend (ml per bottle) *</label>
                  <input
                    type="number"
                    required
                    value={easyBlendML}
                    onChange={e => setEasyBlendML(parseFloat(e.target.value) || 0)}
                    className="form-input font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Bottle Material *</label>
                  <select
                    value={bottleCode}
                    onChange={e => setBottleCode(e.target.value)}
                    className="form-select"
                  >
                    {bottles.map(m => (
                      <option key={m.code} value={m.code}>
                        {m.code} ({m.description})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Bottle Qty (pcs)</label>
                  <input
                    type="number"
                    required
                    value={bottleQty}
                    onChange={e => setBottleQty(parseInt(e.target.value, 10) || 1)}
                    className="form-input font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Bottle Sticker *</label>
                  <select
                    value={bottleStickerCode}
                    onChange={e => setBottleStickerCode(e.target.value)}
                    className="form-select"
                  >
                    {stickers.map(m => (
                      <option key={m.code} value={m.code}>
                        {m.code} ({m.description})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Box Packaging *</label>
                  <select
                    value={boxCode}
                    onChange={e => setBoxCode(e.target.value)}
                    className="form-select"
                  >
                    {boxes.map(m => (
                      <option key={m.code} value={m.code}>
                        {m.code} ({m.description})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#e7e5e4] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-sm px-6">
                  Save Formula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
