'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { localStoreAPI, syncFromSupabase } from '@/lib/store';
import { SalesOrder, ProductionBatch, InventoryMovement, RawMaterial } from '@/types/erp';
import { CheckCircle2, XCircle, Clock, Sparkles, DollarSign, PackageCheck, FlaskConical, AlertTriangle, Printer, Plus, ShoppingCart, Boxes } from 'lucide-react';

export default function AdminDashboard() {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [printableOrder, setPrintableOrder] = useState<SalesOrder | null>(null);

  useEffect(() => {
    refreshData();
    syncFromSupabase().then(() => refreshData());
  }, []);

  const refreshData = () => {
    setSalesOrders(localStoreAPI.getSalesOrders());
    setBatches(localStoreAPI.getProductionBatches());
    setMovements(localStoreAPI.getInventoryMovements());
    setMaterials(localStoreAPI.getRawMaterials());
  };

  const pendingOrders = salesOrders.filter(so => so.status === 'PENDING APPROVAL');
  const approvedOrders = salesOrders.filter(so => so.status === 'APPROVED' || so.status === 'PARTIAL' || so.status === 'PAID');
  const maceratingBatches = batches.filter(b => b.status === 'Macerating' || b.status === 'Ready');

  // Compute FG inventory stock levels
  const getFGStock = (productCode: string) => {
    return movements
      .filter(m => m.category === 'FG' && m.item_code === productCode)
      .reduce((sum, m) => sum + m.qty_in - m.qty_out, 0);
  };

  // Compute Raw Material Stock Levels
  const getRawStock = (materialCode: string) => {
    return movements
      .filter(m => m.category === 'RAW' && m.item_code === materialCode)
      .reduce((sum, m) => sum + m.qty_in - m.qty_out, 0);
  };

  // Low stock raw materials (< 200ml for liquid or < 50 pcs)
  const lowStockMaterials = materials.filter(m => {
    const stock = getRawStock(m.code);
    return m.unit === 'ml' ? stock < 500 : stock < 50;
  });

  const handleApproveOrder = (so: SalesOrder) => {
    // 1. Verify Stock
    for (const line of so.lines) {
      const stock = getFGStock(line.product_code);
      if (stock < line.quantity) {
        alert(`Insufficient stock for ${line.product_name} (${line.product_code}). Available: ${stock}, Requested: ${line.quantity}`);
        return;
      }
    }

    // 2. Update Order Status
    const updatedOrder: SalesOrder = {
      ...so,
      status: 'APPROVED',
    };
    localStoreAPI.saveSalesOrder(updatedOrder);

    // 3. Deduct Stock via Inventory Movement
    so.lines.forEach(line => {
      localStoreAPI.addInventoryMovement({
        date: new Date().toISOString().split('T')[0],
        type: 'SO',
        category: 'FG',
        item_code: line.product_code,
        qty_in: 0,
        qty_out: line.quantity,
        reference_no: so.so_no,
        remarks: `Approved Sales Order for ${so.customer_name}`,
      });
    });

    alert(`Order ${so.so_no} successfully APPROVED! FG Inventory updated.`);
    refreshData();
  };

  const handleRejectOrder = (so: SalesOrder) => {
    if (!confirm(`Are you sure you want to reject order ${so.so_no}?`)) return;

    const updatedOrder: SalesOrder = {
      ...so,
      status: 'REJECTED',
    };
    localStoreAPI.saveSalesOrder(updatedOrder);
    refreshData();
  };

  const handleReleaseBatch = (batch: ProductionBatch) => {
    const actualBottles = prompt(`Enter actual bottles produced for batch ${batch.batch_no}:`, String(batch.expected_bottles));
    if (!actualBottles) return;

    const actual = parseInt(actualBottles, 10);
    if (isNaN(actual) || actual < 0) {
      alert('Invalid bottle quantity.');
      return;
    }

    const variance = actual - batch.expected_bottles;

    localStoreAPI.saveProductionBatch({
      ...batch,
      actual_bottles: actual,
      variance,
      status: 'Released',
      completed_at: new Date().toISOString(),
      completed_by: 'Admin Perfumer',
    });

    localStoreAPI.addInventoryMovement({
      date: new Date().toISOString().split('T')[0],
      type: 'PRODUCTION-COMPLETE',
      category: 'FG',
      item_code: batch.product_code,
      qty_in: actual,
      qty_out: 0,
      reference_no: batch.batch_no,
      remarks: `Batch released. Output: ${actual} bottles (Variance: ${variance})`,
    });

    alert(`Batch ${batch.batch_no} Released to Inventory! +${actual} bottles added to FG stock.`);
    refreshData();
  };

  const totalARBalance = salesOrders
    .filter(so => so.status === 'APPROVED' || so.status === 'OPEN' || so.status === 'PARTIAL')
    .reduce((sum, so) => sum + (so.balance || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#e7e5e4]">
        <div>
          <h1 className="text-3xl font-bold text-[#1c1917] font-serif flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-700" /> Executive Dashboard
          </h1>
          <p className="text-sm text-[#78716c] mt-1 font-medium">
            Real-time business performance, customer order approvals, and maceration aging trackers.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl font-bold">
          <Clock className="w-3.5 h-3.5" /> Realtime Cloud Sync
        </div>
      </div>

      {/* Quick Actions Shortcuts */}
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/production" className="btn-primary text-xs px-4 py-2 rounded-xl flex items-center gap-1.5">
          <FlaskConical className="w-4 h-4" /> Mix New Batch
        </Link>
        <Link href="/admin/purchases" className="btn-secondary text-xs px-4 py-2 rounded-xl flex items-center gap-1.5">
          <ShoppingCart className="w-4 h-4 text-amber-700" /> Record Raw Material Purchase
        </Link>
        <Link href="/admin/products" className="btn-secondary text-xs px-4 py-2 rounded-xl flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-amber-700" /> Add New Perfume
        </Link>
        <Link href="/admin/initial-stock" className="btn-secondary text-xs px-4 py-2 rounded-xl flex items-center gap-1.5">
          <Boxes className="w-4 h-4 text-amber-700" /> Set Opening Stock
        </Link>
      </div>

      {/* Low Stock Ingredient Warning Banner */}
      {lowStockMaterials.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <strong className="block text-sm font-bold text-amber-950 mb-1">
              Low Stock Raw Material Alert ({lowStockMaterials.length} Items Reaching Threshold)
            </strong>
            <div className="flex flex-wrap gap-2 mt-1">
              {lowStockMaterials.map(m => (
                <span key={m.code} className="px-2 py-1 rounded bg-amber-100 border border-amber-300 font-mono font-bold text-amber-900">
                  {m.description} ({getRawStock(m.code)} {m.unit})
                </span>
              ))}
            </div>
          </div>
          <Link href="/admin/purchases" className="btn-primary text-xs px-3 py-1.5 whitespace-nowrap">
            Reorder Stock
          </Link>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 border-amber-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716c]">Pending Orders</span>
            <Clock className="w-5 h-5 text-amber-700" />
          </div>
          <p className="text-3xl font-bold text-[#1c1917] font-mono mt-3">{pendingOrders.length}</p>
          <span className="text-xs text-amber-800 font-semibold">Requires Owner Review</span>
        </div>

        <div className="glass-card p-6 border-purple-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716c]">Macerating Batches</span>
            <FlaskConical className="w-5 h-5 text-purple-700" />
          </div>
          <p className="text-3xl font-bold text-[#1c1917] font-mono mt-3">{maceratingBatches.length}</p>
          <span className="text-xs text-purple-800 font-semibold">Aging in Production</span>
        </div>

        <div className="glass-card p-6 border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716c]">Accounts Receivable</span>
            <DollarSign className="w-5 h-5 text-emerald-700" />
          </div>
          <p className="text-3xl font-bold text-emerald-800 font-mono mt-3">
            ₱{totalARBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-[#78716c] font-semibold">Outstanding Customer Balance</span>
        </div>

        <div className="glass-card p-6 border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716c]">Total Sales Orders</span>
            <PackageCheck className="w-5 h-5 text-blue-700" />
          </div>
          <p className="text-3xl font-bold text-[#1c1917] font-mono mt-3">{salesOrders.length}</p>
          <span className="text-xs text-blue-800 font-semibold">Recorded History</span>
        </div>
      </div>

      {/* Pending Customer Order Approvals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1c1917] font-serif flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-700" /> Customer Orders Pending Approval
          </h2>
          <span className="badge badge-pending">{pendingOrders.length} Waiting</span>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="glass-card p-8 text-center border-[#e7e5e4]">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-80" />
            <p className="text-[#57534e] text-sm font-medium">All customer orders have been reviewed and processed!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingOrders.map(so => (
              <div key={so.so_no} className="glass-card p-6 border-amber-300 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-[#1c1917] font-mono">{so.so_no}</span>
                    <span className="badge badge-pending">{so.status}</span>
                    <span className="text-xs text-[#78716c] font-medium">
                      {new Date(so.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-[#1c1917] font-serif">{so.customer_name}</h4>
                    <p className="text-xs text-[#57534e] font-medium">
                      Type: <span className="text-amber-800 font-bold">{so.customer_type}</span> | Contact: {so.customer_contact || 'N/A'} | Payment: {so.payment_form}
                    </p>
                  </div>

                  {/* Order Line Items */}
                  <div className="bg-[#f5f4f0] rounded-xl p-3 border border-[#e7e5e4] space-y-1.5 mt-2">
                    <span className="text-[11px] font-bold text-[#78716c] uppercase tracking-wider block">Items Requested:</span>
                    {so.lines.map((line, idx) => {
                      const availFG = getFGStock(line.product_code);
                      const isSufficient = availFG >= line.quantity;
                      return (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-[#1c1917] font-semibold">
                            • {line.product_name} ({line.quantity} pcs @ ₱{line.unit_price.toFixed(2)})
                          </span>
                          <span className={`font-mono font-bold ${isSufficient ? 'text-emerald-700' : 'text-rose-700'}`}>
                            Available FG: {availFG} {isSufficient ? '✓' : '⚠️ Short'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between gap-4 border-t md:border-t-0 md:border-l border-[#e7e5e4] pt-4 md:pt-0 md:pl-6">
                  <div className="text-right">
                    <span className="text-xs text-[#78716c] block font-medium">Total Amount</span>
                    <span className="text-2xl font-bold text-amber-800 font-mono">
                      ₱{so.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRejectOrder(so)}
                      className="btn-danger text-xs flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => handleApproveOrder(so)}
                      className="btn-primary text-xs flex items-center gap-1.5 px-4 py-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve & Invoice
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved Sales Orders Queue & Printable Invoice */}
      <div className="space-y-4 pt-6 border-t border-[#e7e5e4]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1c1917] font-serif flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-700" /> Approved Orders & Printable Sales Invoices
          </h2>
          <span className="badge badge-approved">{approvedOrders.length} Orders</span>
        </div>

        <div className="table-container glass-card">
          <table className="custom-table">
            <thead>
              <tr>
                <th>SO Number</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {approvedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#78716c]">
                    No approved sales orders yet.
                  </td>
                </tr>
              ) : (
                approvedOrders.map(so => (
                  <tr key={so.so_no}>
                    <td className="font-mono font-bold text-amber-800">{so.so_no}</td>
                    <td className="text-xs text-[#78716c] font-medium">
                      {new Date(so.date).toLocaleDateString('en-US')}
                    </td>
                    <td className="font-bold text-[#1c1917]">{so.customer_name}</td>
                    <td className="font-mono font-bold text-[#1c1917]">₱{so.total_amount.toFixed(2)}</td>
                    <td className="font-mono text-amber-800 font-bold">₱{so.balance.toFixed(2)}</td>
                    <td>
                      <span className={so.status === 'PAID' ? 'badge badge-approved' : 'badge badge-ready'}>
                        {so.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setPrintableOrder(so)}
                        className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-700" /> Print Invoice
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Production Maceration Aging Alerts */}
      <div className="space-y-4 pt-6 border-t border-[#e7e5e4]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1c1917] font-serif flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-purple-700" /> Active Perfume Maceration Batches
          </h2>
          <span className="badge badge-macerating">{maceratingBatches.length} Batches</span>
        </div>

        {maceratingBatches.length === 0 ? (
          <div className="glass-card p-6 text-center text-[#78716c] text-sm font-medium">
            No active maceration batches right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {maceratingBatches.map(batch => {
              const today = new Date();
              const ready = new Date(batch.ready_date);
              const isReadyToRelease = today >= ready;

              return (
                <div key={batch.batch_no} className="glass-card p-5 border-purple-200 flex justify-between items-center bg-white">
                  <div>
                    <span className="text-xs font-mono text-purple-800 font-bold">{batch.batch_no}</span>
                    <h4 className="text-base font-bold text-[#1c1917] mt-1">{batch.product_code}</h4>
                    <p className="text-xs text-[#57534e] mt-1 font-medium">
                      Expected Bottles: <span className="text-[#1c1917] font-bold">{batch.expected_bottles}</span> | Mixed: {batch.date_mixed}
                    </p>
                    <div className="mt-2">
                      {isReadyToRelease ? (
                        <span className="badge badge-ready">Ready for Bottling! 🎉</span>
                      ) : (
                        <span className="badge badge-macerating">Aging (Ready: {batch.ready_date})</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleReleaseBatch(batch)}
                    className="btn-secondary text-xs border-purple-300 text-purple-900 hover:bg-purple-50"
                  >
                    Release Batch 🍾
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Printable Invoice Modal */}
      {printableOrder && (
        <div className="modal-overlay no-print-bg">
          <div className="modal-box max-w-2xl p-8 bg-white print-invoice-container border-[#e7e5e4]">
            <div className="flex justify-between items-start pb-4 border-b border-[#e7e5e4]">
              <div>
                <h2 className="text-xl font-bold text-[#1c1917] font-serif">CHINITO SCENTO</h2>
                <p className="text-[11px] text-[#78716c]">Artisanal Fine Fragrances & Extrait de Parfum</p>
                <p className="text-[11px] text-[#78716c] mt-0.5 font-medium">Official Sales Invoice & Delivery Receipt</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-800 font-mono block">INV-{printableOrder.so_no.replace('SO-', '')}</span>
                <span className="text-[11px] text-[#78716c] font-mono">Date: {new Date(printableOrder.date).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="py-3 border-b border-[#e7e5e4] text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#78716c]">Customer Name:</span>
                <span className="font-bold text-[#1c1917]">{printableOrder.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716c]">Customer Tier / Type:</span>
                <span className="font-bold text-amber-800">{printableOrder.customer_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716c]">Payment Form:</span>
                <span className="font-bold text-[#1c1917]">{printableOrder.payment_form}</span>
              </div>
              {printableOrder.delivery_address && (
                <div className="flex justify-between">
                  <span className="text-[#78716c]">Delivery Address:</span>
                  <span className="font-bold text-[#1c1917]">{printableOrder.delivery_address}</span>
                </div>
              )}
            </div>

            <div className="py-3">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#e7e5e4] text-[#78716c]">
                    <th className="py-1.5">Item Description</th>
                    <th className="py-1.5 text-center">Qty</th>
                    <th className="py-1.5 text-right">Unit Price</th>
                    <th className="py-1.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {printableOrder.lines.map((line, idx) => (
                    <tr key={idx} className="border-b border-stone-100">
                      <td className="py-1.5 font-bold text-[#1c1917]">{line.product_name}</td>
                      <td className="py-1.5 text-center font-mono">{line.quantity}</td>
                      <td className="py-1.5 text-right font-mono">₱{line.unit_price.toFixed(2)}</td>
                      <td className="py-1.5 text-right font-mono font-bold">₱{line.line_amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-center pt-3 border-t border-[#e7e5e4] font-bold text-xs">
                <span>Grand Total Amount:</span>
                <span className="text-lg text-amber-800 font-mono">₱{printableOrder.total_amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 no-print border-t border-[#e7e5e4]">
              <button onClick={() => setPrintableOrder(null)} className="btn-secondary text-xs">
                Close
              </button>
              <button onClick={() => window.print()} className="btn-primary text-xs px-5">
                <Printer className="w-4 h-4" /> Print Document / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
