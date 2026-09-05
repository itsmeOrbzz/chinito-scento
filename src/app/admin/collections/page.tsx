'use client';

import React, { useState, useEffect } from 'react';
import { localStoreAPI } from '@/lib/store';
import { SalesOrder, Collection, PaymentType } from '@/types/erp';
import { Receipt, Plus } from 'lucide-react';

export default function CollectionsPage() {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  // Form Fields
  const [soNo, setSoNo] = useState('');
  const [amountCollected, setAmountCollected] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentType>('GCASH');
  const [referenceNo, setReferenceNo] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const orders = localStoreAPI.getSalesOrders();
    setSalesOrders(orders);
    setCollections(localStoreAPI.getCollections());

    const openSOs = orders.filter(so => so.status !== 'PAID' && so.status !== 'REJECTED' && so.status !== 'CANCELLED');
    if (openSOs.length > 0 && !soNo) {
      setSoNo(openSOs[0].so_no);
      setAmountCollected(openSOs[0].balance);
    }
  };

  const selectedSO = salesOrders.find(s => s.so_no === soNo);

  const handleSaveCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSO) {
      alert('Please select an open Sales Order.');
      return;
    }

    const collected = Number(amountCollected);
    if (collected <= 0) {
      alert('Collection amount must be greater than zero.');
      return;
    }

    if (collected > selectedSO.balance) {
      alert(`Collection amount (₱${collected}) exceeds outstanding balance (₱${selectedSO.balance}).`);
      return;
    }

    const colNo = `COL-${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)}`;

    localStoreAPI.saveCollection({
      collection_no: colNo,
      date: new Date().toISOString(),
      customer_code: selectedSO.customer_code,
      customer_name: selectedSO.customer_name,
      so_no: selectedSO.so_no,
      amount_collected: collected,
      payment_method: paymentMethod,
      reference_no: referenceNo,
      remarks,
    });

    const newCollected = selectedSO.amount_collected + collected;
    const newBalance = selectedSO.total_amount - newCollected;
    const newStatus = newBalance <= 0 ? 'PAID' : 'PARTIAL';

    localStoreAPI.saveSalesOrder({
      ...selectedSO,
      amount_collected: newCollected,
      balance: newBalance,
      status: newStatus,
    });

    alert(`Collection ${colNo} Saved!\n₱${collected.toFixed(2)} recorded for ${selectedSO.customer_name}. Remaining balance: ₱${newBalance.toFixed(2)}`);
    loadData();
  };

  const openSOs = salesOrders.filter(so => so.status !== 'PAID' && so.status !== 'REJECTED' && so.status !== 'CANCELLED');
  const totalAR = openSOs.reduce((sum, so) => sum + so.balance, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#e7e5e4]">
        <div>
          <h1 className="text-3xl font-bold text-[#1c1917] font-serif flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-700" /> Collections & Accounts Receivable (AR)
          </h1>
          <p className="text-sm text-[#78716c] mt-1 font-medium">
            Record customer payment collections, track partial payments, and update open Sales Order balances.
          </p>
        </div>

        <div className="glass-card px-4 py-2 border-amber-200 text-right bg-white">
          <span className="text-xs text-[#78716c] block font-medium">Total Accounts Receivable (AR)</span>
          <span className="text-xl font-bold text-amber-800 font-mono">
            ₱{totalAR.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Record Collection Form */}
        <div className="glass-panel p-6 border-[#e7e5e4] bg-white space-y-4">
          <h3 className="text-xl font-bold text-[#1c1917] font-serif flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-700" /> Record Customer Payment
          </h3>

          <form onSubmit={handleSaveCollection} className="space-y-4">
            <div>
              <label className="form-label">Select Sales Order *</label>
              <select
                value={soNo}
                onChange={e => {
                  setSoNo(e.target.value);
                  const target = salesOrders.find(s => s.so_no === e.target.value);
                  if (target) setAmountCollected(target.balance);
                }}
                className="form-select font-bold text-amber-800"
              >
                {openSOs.length === 0 ? (
                  <option value="">No open Sales Orders requiring payment</option>
                ) : (
                  openSOs.map(so => (
                    <option key={so.so_no} value={so.so_no}>
                      {so.so_no} - {so.customer_name} (Bal: ₱{so.balance.toFixed(2)})
                    </option>
                  ))
                )}
              </select>
            </div>

            {selectedSO && (
              <div className="bg-[#f5f4f0] p-3 rounded-xl border border-[#e7e5e4] text-xs space-y-1">
                <div className="flex justify-between text-[#44403c] font-medium">
                  <span>Order Total:</span>
                  <span className="font-mono text-[#1c1917]">₱{selectedSO.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#44403c] font-medium">
                  <span>Already Collected:</span>
                  <span className="font-mono text-emerald-700 font-bold">₱{selectedSO.amount_collected.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#1c1917] font-bold pt-1 border-t border-[#e7e5e4]">
                  <span>Current Balance Due:</span>
                  <span className="font-mono text-amber-800">₱{selectedSO.balance.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div>
              <label className="form-label">Amount Collected (₱) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={amountCollected}
                onChange={e => setAmountCollected(parseFloat(e.target.value) || 0)}
                className="form-input font-mono font-bold text-emerald-700 text-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentType)}
                  className="form-select"
                >
                  <option value="GCASH">GCash</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CREDIT">Check / Credit</option>
                </select>
              </div>

              <div>
                <label className="form-label">Ref / Transaction #</label>
                <input
                  type="text"
                  placeholder="e.g. GCash Ref #123"
                  value={referenceNo}
                  onChange={e => setReferenceNo(e.target.value)}
                  className="form-input font-mono"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Remarks</label>
              <input
                type="text"
                placeholder="Optional notes..."
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedSO}
              className="btn-primary w-full justify-center text-sm py-3"
            >
              Save Collection Payment
            </button>
          </form>
        </div>

        {/* Collections History Table */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-[#1c1917] font-serif">Payment Collection Logs</h3>

          <div className="table-container glass-card">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Collection No</th>
                  <th>Customer</th>
                  <th>SO Number</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Ref No</th>
                </tr>
              </thead>
              <tbody>
                {collections.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[#78716c]">
                      No collection payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  collections.map(c => (
                    <tr key={c.collection_no}>
                      <td className="font-mono text-amber-800 font-bold">{c.collection_no}</td>
                      <td className="font-bold text-[#1c1917]">{c.customer_name}</td>
                      <td className="font-mono text-[#57534e] font-semibold">{c.so_no}</td>
                      <td className="font-mono font-bold text-emerald-700">
                        ₱{c.amount_collected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <span className="text-xs font-semibold text-[#44403c]">{c.payment_method}</span>
                      </td>
                      <td className="font-mono text-xs text-[#78716c]">{c.reference_no || '-'}</td>
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
