'use client';

import React, { useState, useEffect } from 'react';
import { localStoreAPI } from '@/lib/store';
import { RawMaterial, Purchase, PaymentType, PaymentMode } from '@/types/erp';
import { ShoppingCart, Plus } from 'lucide-react';

export default function PurchasesPage() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  // Form Fields
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplier, setSupplier] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [materialCode, setMaterialCode] = useState('');
  const [qtyPurchased, setQtyPurchased] = useState<number>(1);
  const [volumePerUnit, setVolumePerUnit] = useState<number>(1000);
  const [unitCost, setUnitCost] = useState<number>(500);
  const [remarks, setRemarks] = useState('');

  // Credit / AP fields
  const [paymentType, setPaymentType] = useState<PaymentType>('CASH');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('ONETIME');
  const [creditor, setCreditor] = useState('');
  const [installmentMonths, setInstallmentMonths] = useState<number>(3);
  const [monthlyAmort, setMonthlyAmort] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const raw = localStoreAPI.getRawMaterials();
    setMaterials(raw);
    setPurchases(localStoreAPI.getPurchases());
    if (raw.length > 0 && !materialCode) {
      setMaterialCode(raw[0].code);
    }
  };

  const selectedMaterial = materials.find(m => m.code === materialCode);

  const calculateTotalCost = () => {
    return Number(qtyPurchased) * Number(unitCost);
  };

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier || !invoiceNo || !materialCode) {
      alert('Please fill in required supplier and invoice details.');
      return;
    }

    const totalCost = calculateTotalCost();
    const qtyReceived = selectedMaterial?.unit === 'ml' ? qtyPurchased * volumePerUnit : qtyPurchased;

    const poNo = `PO-${purchaseDate.replace(/-/g, '')}-${String(purchases.length + 1).padStart(4, '0')}`;

    let apBalance = 0;
    if (paymentType === 'CREDIT') {
      apBalance = paymentMode === 'INSTALLMENT' ? monthlyAmort * installmentMonths : totalCost;
    }

    const newPurchase: Purchase = {
      purchase_no: poNo,
      purchase_date: purchaseDate,
      supplier,
      invoice_no: invoiceNo,
      payment_type: paymentType,
      payment_mode: paymentType === 'CREDIT' ? paymentMode : undefined,
      creditor: paymentType === 'CREDIT' ? creditor || supplier : undefined,
      installment_months: paymentMode === 'INSTALLMENT' ? installmentMonths : undefined,
      monthly_amortization: paymentMode === 'INSTALLMENT' ? monthlyAmort : undefined,
      total_amount_due: totalCost,
      ap_balance: apBalance,
      ap_status: paymentType === 'CREDIT' ? 'OPEN' : 'PAID',
      remarks,
      items: [
        {
          material_code: materialCode,
          quantity_purchased: qtyPurchased,
          volume: volumePerUnit,
          unit: selectedMaterial?.unit || 'pcs',
          unit_cost: unitCost,
          total_cost: totalCost,
        },
      ],
    };

    localStoreAPI.savePurchase(newPurchase);

    localStoreAPI.addInventoryMovement({
      date: purchaseDate,
      type: 'PURCHASE',
      category: 'RAW',
      item_code: materialCode,
      qty_in: qtyReceived,
      qty_out: 0,
      reference_no: poNo,
      remarks: `Purchase Entry from ${supplier} (Inv #${invoiceNo})`,
    });

    alert(`Purchase ${poNo} Saved! Added +${qtyReceived} ${selectedMaterial?.unit} to Raw Material stock.`);
    loadData();
  };

  const totalAPOutstanding = purchases
    .filter(p => p.ap_status === 'OPEN')
    .reduce((sum, p) => sum + (p.ap_balance || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#e7e5e4]">
        <div>
          <h1 className="text-3xl font-bold text-[#1c1917] font-serif flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-amber-700" /> Procurement & Accounts Payable (AP)
          </h1>
          <p className="text-sm text-[#78716c] mt-1 font-medium">
            Record raw material purchases, liquid volume conversions ($L \rightarrow ml$), supplier credit, and AP aging.
          </p>
        </div>

        <div className="glass-card px-4 py-2 border-emerald-200 text-right bg-white">
          <span className="text-xs text-[#78716c] block font-medium">Total Accounts Payable (AP)</span>
          <span className="text-xl font-bold text-emerald-700 font-mono">
            ₱{totalAPOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Purchase Form */}
        <div className="glass-panel p-6 border-[#e7e5e4] bg-white space-y-4">
          <h3 className="text-xl font-bold text-[#1c1917] font-serif flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-700" /> Record Raw Material Purchase
          </h3>

          <form onSubmit={handleSavePurchase} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Purchase Date *</label>
                <input
                  type="date"
                  required
                  value={purchaseDate}
                  onChange={e => setPurchaseDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Invoice No *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INV-8891"
                  value={invoiceNo}
                  onChange={e => setInvoiceNo(e.target.value)}
                  className="form-input font-mono"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Supplier Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Fragrance Oils Co."
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Material Purchased *</label>
              <select
                value={materialCode}
                onChange={e => setMaterialCode(e.target.value)}
                className="form-select font-bold text-amber-800"
              >
                {materials.map(m => (
                  <option key={m.code} value={m.code}>
                    {m.code} - {m.description} ({m.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Quantity Purchased *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={qtyPurchased}
                  onChange={e => setQtyPurchased(parseInt(e.target.value, 10) || 1)}
                  className="form-input font-mono"
                />
              </div>

              {selectedMaterial?.unit === 'ml' ? (
                <div>
                  <label className="form-label">Volume per Container (ml)</label>
                  <input
                    type="number"
                    required
                    value={volumePerUnit}
                    onChange={e => setVolumePerUnit(parseInt(e.target.value, 10) || 1000)}
                    className="form-input font-mono"
                  />
                </div>
              ) : (
                <div>
                  <label className="form-label">Unit Cost (₱) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={unitCost}
                    onChange={e => setUnitCost(parseFloat(e.target.value) || 0)}
                    className="form-input font-mono"
                  />
                </div>
              )}
            </div>

            {selectedMaterial?.unit === 'ml' && (
              <div>
                <label className="form-label">Cost per Container (₱) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={unitCost}
                  onChange={e => setUnitCost(parseFloat(e.target.value) || 0)}
                  className="form-input font-mono"
                />
              </div>
            )}

            {/* Payment Type Toggle */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#e7e5e4]">
              <div>
                <label className="form-label">Payment Type</label>
                <select
                  value={paymentType}
                  onChange={e => setPaymentType(e.target.value as PaymentType)}
                  className="form-select"
                >
                  <option value="CASH">CASH</option>
                  <option value="CREDIT">CREDIT (AP)</option>
                </select>
              </div>

              {paymentType === 'CREDIT' && (
                <div>
                  <label className="form-label">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={e => setPaymentMode(e.target.value as PaymentMode)}
                    className="form-select"
                  >
                    <option value="ONETIME">One Time</option>
                    <option value="INSTALLMENT">Installment</option>
                  </select>
                </div>
              )}
            </div>

            {paymentType === 'CREDIT' && paymentMode === 'INSTALLMENT' && (
              <div className="grid grid-cols-2 gap-4 bg-amber-50 p-3 rounded-xl border border-amber-200">
                <div>
                  <label className="form-label">Months</label>
                  <input
                    type="number"
                    value={installmentMonths}
                    onChange={e => setInstallmentMonths(parseInt(e.target.value, 10) || 1)}
                    className="form-input font-mono"
                  />
                </div>
                <div>
                  <label className="form-label">Monthly Amort (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={monthlyAmort}
                    onChange={e => setMonthlyAmort(parseFloat(e.target.value) || 0)}
                    className="form-input font-mono text-amber-800 font-bold"
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <div className="flex justify-between items-center text-sm font-bold text-[#1c1917] mb-4">
                <span>Total Purchase Amount:</span>
                <span className="text-xl text-amber-800 font-mono">
                  ₱{calculateTotalCost().toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <button type="submit" className="btn-primary w-full justify-center text-sm py-3">
                Save Purchase & Receive Inventory
              </button>
            </div>
          </form>
        </div>

        {/* Purchase History Table */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-[#1c1917] font-serif">Purchase Order Logs</h3>

          <div className="table-container glass-card">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Total Cost</th>
                  <th>Payment Type</th>
                  <th>AP Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[#78716c]">
                      No purchase entries recorded yet.
                    </td>
                  </tr>
                ) : (
                  purchases.map(p => (
                    <tr key={p.purchase_no}>
                      <td className="font-mono font-bold text-amber-800">{p.purchase_no}</td>
                      <td className="text-xs text-[#78716c] font-medium">{p.purchase_date}</td>
                      <td className="font-bold text-[#1c1917]">{p.supplier}</td>
                      <td className="font-mono font-bold text-amber-800">
                        ₱{p.total_amount_due?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <span className="text-xs font-semibold text-[#44403c]">{p.payment_type}</span>
                      </td>
                      <td>
                        <span className={p.ap_status === 'PAID' ? 'badge badge-approved' : 'badge badge-pending'}>
                          {p.ap_status}
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
