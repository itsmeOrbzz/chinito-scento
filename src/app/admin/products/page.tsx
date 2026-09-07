'use client';

import React, { useState, useEffect } from 'react';
import { localStoreAPI, syncFromSupabase } from '@/lib/store';
import { Product, ItemStatus } from '@/types/erp';
import { Package, Plus, Edit2, Search, Trash2, Upload, CheckCircle2 } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sellingPrice, setSellingPrice] = useState<number>(1200);
  const [status, setStatus] = useState<ItemStatus>('ACTIVE');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadProducts();
    syncFromSupabase().then(() => loadProducts());
  }, []);

  const loadProducts = () => {
    setProducts(localStoreAPI.getProducts());
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload-scent', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
      } else {
        // Fallback to Data URL
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (evt.target?.result) setImageUrl(evt.target.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Upload error:', err);
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) setImageUrl(evt.target.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    const nextCode = `SCENT-${String(products.length + 1).padStart(2, '0')}`;
    setCode(nextCode);
    setName('');
    setDescription('');
    setSellingPrice(1200);
    setStatus('ACTIVE');
    setImageUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setCode(p.code);
    setName(p.name);
    setDescription(p.description || '');
    setSellingPrice(p.selling_price);
    setStatus(p.status);
    setImageUrl(p.image_url || '');
    setIsModalOpen(true);
  };

  const handleDelete = (codeToDelete: string) => {
    if (!confirm(`Are you sure you want to delete perfume scent ${codeToDelete}?`)) return;
    localStoreAPI.deleteProduct(codeToDelete);
    alert(`Product ${codeToDelete} deleted.`);
    loadProducts();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) {
      alert('Please fill in required fields.');
      return;
    }

    localStoreAPI.saveProduct({
      id: editingProduct?.id,
      code,
      name,
      description,
      selling_price: Number(sellingPrice),
      status,
      image_url: imageUrl,
    });

    setIsModalOpen(false);
    loadProducts();
  };

  const filteredProducts = products.filter(
    p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#e7e5e4]">
        <div>
          <h1 className="text-3xl font-bold text-[#1c1917] font-serif flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-700" /> Products Catalog Manager
          </h1>
          <p className="text-sm text-[#78716c] mt-1 font-medium">
            Type or edit perfume products, selling prices, scent notes, and image URLs.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn-primary text-sm px-5 py-2.5 rounded-xl">
          <Plus className="w-4 h-4" /> Add New Perfume
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#78716c] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
        <input
          type="text"
          placeholder="Search by scent name or code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input form-input-search"
        />
      </div>

      {/* Products Table */}
      <div className="table-container glass-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Perfume Scent Name</th>
              <th>Selling Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-[#78716c]">
                  {search ? `No products matching "${search}".` : 'No products found. Click "Add New Perfume" to create one!'}
                </td>
              </tr>
            ) : (
              filteredProducts.map(p => (
                <tr key={p.code}>
                  <td className="font-mono text-amber-800 font-bold">{p.code}</td>
                  <td>
                    <div className="font-bold text-[#1c1917]">{p.name}</div>
                    <div className="text-xs text-[#78716c] line-clamp-1">{p.description}</div>
                  </td>
                  <td className="font-mono font-bold text-emerald-700">
                    ₱{p.selling_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span className={p.status === 'ACTIVE' ? 'badge badge-approved' : 'badge badge-pending'}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.code)}
                        className="btn-danger text-xs px-2.5 py-1.5 flex items-center gap-1"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Centered Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box max-w-lg">
            <div className="p-5 border-b border-[#e7e5e4] flex items-center justify-between bg-[#f5f4f0] shrink-0">
              <h3 className="text-lg font-bold text-[#1c1917] font-serif flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-700" />
                {editingProduct ? 'Edit Perfume Scent' : 'Add New Perfume Scent'}
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
                <label className="form-label">Product Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="form-input font-mono"
                />
              </div>

              <div>
                <label className="form-label">Perfume Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amber Romance 100ml"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Selling Price (₱) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={sellingPrice}
                  onChange={e => setSellingPrice(parseFloat(e.target.value) || 0)}
                  className="form-input font-mono"
                />
              </div>

              <div>
                <label className="form-label">Fragrance Description / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Describe top, middle, and base notes..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div>
                <label className="form-label">Perfume Picture Upload (Saved to /scent-assets)</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      id="scent-picture-upload"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="scent-picture-upload"
                      className="btn-secondary text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 font-bold border-amber-300 hover:bg-amber-50"
                    >
                      <Upload className="w-4 h-4 text-amber-700" />
                      <span>{isUploading ? 'Uploading Picture...' : 'Choose Picture File'}</span>
                    </label>
                    {imageUrl && (
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Picture Ready
                      </span>
                    )}
                  </div>

                  {/* Live Picture Preview Box */}
                  {imageUrl && (
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-[#e7e5e4] bg-[#f5f4f0] shadow-2xs group">
                      <img src={imageUrl} alt="Scent Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-1 right-1 bg-rose-600 text-white rounded-full w-5 h-5 text-[10px] font-bold flex items-center justify-center shadow-xs"
                        title="Remove Picture"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Optional Direct URL Fallback */}
                  <div className="pt-1">
                    <span className="text-[10px] text-[#78716c] block font-medium">Image Asset Path:</span>
                    <input
                      type="text"
                      placeholder="/scent-assets/my-perfume.jpg"
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      className="form-input text-xs font-mono mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as ItemStatus)}
                  className="form-select"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
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
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
