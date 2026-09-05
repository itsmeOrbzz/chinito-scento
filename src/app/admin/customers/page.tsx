'use client';

import React, { useState, useEffect } from 'react';
import { localStoreAPI, syncFromSupabase } from '@/lib/store';
import { Customer, CustomerType, CustomerStatus } from '@/types/erp';
import { Users, Plus, Edit2, Search, Trash2 } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<CustomerType>('Reseller');
  const [creditTerms, setCreditTerms] = useState<number>(15);
  const [creditLimit, setCreditLimit] = useState<number>(10000);
  const [status, setStatus] = useState<CustomerStatus>('ACTIVE');

  useEffect(() => {
    loadCustomers();
    syncFromSupabase().then(() => loadCustomers());
  }, []);

  const loadCustomers = () => {
    setCustomers(localStoreAPI.getCustomers());
  };

  const openCreateModal = () => {
    setEditingCustomer(null);
    const nextCode = `C${String(customers.length + 1).padStart(4, '0')}`;
    setCode(nextCode);
    setName('');
    setType('Reseller');
    setCreditTerms(15);
    setCreditLimit(10000);
    setStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setCode(c.code);
    setName(c.name);
    setType(c.type);
    setCreditTerms(c.credit_terms);
    setCreditLimit(c.credit_limit);
    setStatus(c.status);
    setIsModalOpen(true);
  };

  const handleDelete = (codeToDelete: string) => {
    if (!confirm(`Are you sure you want to delete customer account ${codeToDelete}?`)) return;
    const updated = customers.filter(c => c.code !== codeToDelete);
    localStorage.setItem('chinito_customers', JSON.stringify(updated));
    alert(`Customer ${codeToDelete} deleted.`);
    loadCustomers();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) {
      alert('Please fill in required fields.');
      return;
    }

    localStoreAPI.saveCustomer({
      id: editingCustomer?.id,
      code,
      name,
      type,
      credit_terms: Number(creditTerms),
      credit_limit: Number(creditLimit),
      status,
    });

    setIsModalOpen(false);
    loadCustomers();
  };

  const filtered = customers.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#e7e5e4]">
        <div>
          <h1 className="text-3xl font-bold text-[#1c1917] font-serif flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-700" /> Customer & Credit Maintenance
          </h1>
          <p className="text-sm text-[#78716c] mt-1 font-medium">
            Type or edit customer accounts, Distributor/Reseller tiers, credit terms, and limits.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn-primary text-sm px-5 py-2.5 rounded-xl">
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#78716c] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
        <input
          type="text"
          placeholder="Search by customer name, tier, or code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input form-input-search"
        />
      </div>

      <div className="table-container glass-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Customer Code</th>
              <th>Customer Name</th>
              <th>Type / Tier</th>
              <th>Credit Terms</th>
              <th>Credit Limit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-[#78716c]">
                  {search ? `No customers matching "${search}".` : 'No customers found. Click "Add Customer" to create one!'}
                </td>
              </tr>
            ) : (
              filtered.map(c => (
                <tr key={c.code}>
                  <td className="font-mono text-amber-800 font-bold">{c.code}</td>
                  <td className="font-bold text-[#1c1917]">{c.name}</td>
                  <td>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 font-bold border border-amber-200">
                      {c.type}
                    </span>
                  </td>
                  <td className="font-mono text-[#57534e] font-semibold">{c.credit_terms} Days</td>
                  <td className="font-mono font-bold text-emerald-700">
                    ₱{c.credit_limit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span className={c.status === 'ACTIVE' ? 'badge badge-approved' : 'badge badge-pending'}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(c)}
                        className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c.code)}
                        className="btn-danger text-xs px-2.5 py-1.5 flex items-center gap-1"
                        title="Delete customer"
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
                <Users className="w-5 h-5 text-amber-700" />
                {editingCustomer ? 'Edit Customer Account' : 'Add New Customer Account'}
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
                <label className="form-label">Customer Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="form-input font-mono"
                />
              </div>

              <div>
                <label className="form-label">Customer Name / Business *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scent & Style Boutique"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Customer Type</label>
                  <select
                    value={type}
                    onChange={e => {
                      const t = e.target.value as CustomerType;
                      setType(t);
                      if (t === 'Distributor') {
                        setCreditTerms(30);
                        setCreditLimit(50000);
                      } else if (t === 'Reseller') {
                        setCreditTerms(15);
                        setCreditLimit(15000);
                      } else {
                        setCreditTerms(0);
                        setCreditLimit(0);
                      }
                    }}
                    className="form-select"
                  >
                    <option value="Distributor">Distributor</option>
                    <option value="Reseller">Reseller</option>
                    <option value="Walk-In">Walk-In (Retail)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Credit Terms (Days)</label>
                  <input
                    type="number"
                    required
                    value={creditTerms}
                    onChange={e => setCreditTerms(parseInt(e.target.value, 10) || 0)}
                    className="form-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Credit Limit (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={creditLimit}
                  onChange={e => setCreditLimit(parseFloat(e.target.value) || 0)}
                  className="form-input font-mono"
                />
              </div>

              <div>
                <label className="form-label">Account Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as CustomerStatus)}
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
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
