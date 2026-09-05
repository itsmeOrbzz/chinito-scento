'use client';

import React, { useState, useEffect } from 'react';
import { localStoreAPI } from '@/lib/store';
import { RawMaterial, ItemStatus } from '@/types/erp';
import { Boxes, Plus, Edit2, Search, Trash2 } from 'lucide-react';

export default function RawMaterialsPage() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RawMaterial['category']>('OIL');
  const [unit, setUnit] = useState<'ml' | 'pcs'>('ml');
  const [status, setStatus] = useState<ItemStatus>('ACTIVE');

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = () => {
    setMaterials(localStoreAPI.getRawMaterials());
  };

  const openCreateModal = () => {
    setEditingMaterial(null);
    setCode('');
    setDescription('');
    setCategory('OIL');
    setUnit('ml');
    setStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const openEditModal = (m: RawMaterial) => {
    setEditingMaterial(m);
    setCode(m.code);
    setDescription(m.description);
    setCategory(m.category);
    setUnit(m.unit);
    setStatus(m.status);
    setIsModalOpen(true);
  };

  const handleDelete = (codeToDelete: string) => {
    if (!confirm(`Are you sure you want to delete raw material ${codeToDelete}?`)) return;
    const updated = materials.filter(m => m.code !== codeToDelete);
    localStorage.setItem('chinito_materials', JSON.stringify(updated));
    alert(`Material ${codeToDelete} deleted.`);
    loadMaterials();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !description) {
      alert('Please fill in required fields.');
      return;
    }

    localStoreAPI.saveRawMaterial({
      id: editingMaterial?.id,
      code,
      description,
      category,
      unit,
      status,
    });

    setIsModalOpen(false);
    loadMaterials();
  };

  const filtered = materials.filter(
    m =>
      m.description.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#e7e5e4]">
        <div>
          <h1 className="text-3xl font-bold text-[#1c1917] font-serif flex items-center gap-2">
            <Boxes className="w-6 h-6 text-amber-700" /> Raw Materials Manager
          </h1>
          <p className="text-sm text-[#78716c] mt-1 font-medium">
            Type or edit fragrance oils, alcohol/easy blend, bottles, labels, and boxes.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn-primary text-sm px-5 py-2.5 rounded-xl">
          <Plus className="w-4 h-4" /> Add Material
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#78716c] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
        <input
          type="text"
          placeholder="Search materials by description, category, or code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input form-input-search"
        />
      </div>

      <div className="table-container glass-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Material Code</th>
              <th>Description</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-[#78716c]">
                  {search ? `No raw materials matching "${search}".` : 'No materials found. Click "Add Material" to create one!'}
                </td>
              </tr>
            ) : (
              filtered.map(m => (
                <tr key={m.code}>
                  <td className="font-mono text-amber-800 font-bold">{m.code}</td>
                  <td className="font-bold text-[#1c1917]">{m.description}</td>
                  <td>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-[#f5f4f0] text-[#44403c] font-bold border border-[#e7e5e4]">
                      {m.category}
                    </span>
                  </td>
                  <td className="font-mono text-[#57534e] font-semibold">{m.unit}</td>
                  <td>
                    <span className={m.status === 'ACTIVE' ? 'badge badge-approved' : 'badge badge-pending'}>
                      {m.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(m)}
                        className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(m.code)}
                        className="btn-danger text-xs px-2.5 py-1.5 flex items-center gap-1"
                        title="Delete material"
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

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box max-w-lg">
            <div className="p-5 border-b border-[#e7e5e4] flex items-center justify-between bg-[#f5f4f0] shrink-0">
              <h3 className="text-lg font-bold text-[#1c1917] font-serif flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-700" />
                {editingMaterial ? 'Edit Material' : 'Add Raw Material'}
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
                <label className="form-label">Material Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OIL-ROSE, BOTTLE-50ML"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="form-input font-mono"
                />
              </div>

              <div>
                <label className="form-label">Material Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. French Rose Fragrance Oil"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Category</label>
                  <select
                    value={category}
                    onChange={e => {
                      const cat = e.target.value as RawMaterial['category'];
                      setCategory(cat);
                      if (cat === 'OIL' || cat === 'SOLVENT') setUnit('ml');
                      else setUnit('pcs');
                    }}
                    className="form-select"
                  >
                    <option value="OIL">OIL</option>
                    <option value="SOLVENT">SOLVENT (EasyBlend)</option>
                    <option value="BOTTLE">BOTTLE</option>
                    <option value="STICKER">STICKER</option>
                    <option value="BOX">BOX</option>
                    <option value="PACKAGING">PACKAGING</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Measurement Unit</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value as 'ml' | 'pcs')}
                    className="form-select"
                  >
                    <option value="ml">ml (Milliliters)</option>
                    <option value="pcs">pcs (Pieces)</option>
                  </select>
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
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
