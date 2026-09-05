'use client';

import React, { useState, useEffect } from 'react';
import { localStoreAPI } from '@/lib/store';
import { Product, SalesOrder, InventoryMovement, RawMaterial } from '@/types/erp';
import { TrendingUp, BarChart3, Boxes } from 'lucide-react';

interface VelocityItem {
  code: string;
  name: string;
  week1: number;
  week2: number;
  month1: number;
  month3: number;
  status: 'FAST MOVING' | 'MODERATE' | 'SLOW MOVING' | 'DORMANT';
}

export default function ReportsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);

  useEffect(() => {
    setProducts(localStoreAPI.getProducts());
    setMaterials(localStoreAPI.getRawMaterials());
    setSalesOrders(localStoreAPI.getSalesOrders());
    setMovements(localStoreAPI.getInventoryMovements());
  }, []);

  const getVelocityReport = (): VelocityItem[] => {
    const today = new Date();
    const velocityMap: Record<string, { week1: number; week2: number; month1: number; month3: number }> = {};

    products.forEach(p => {
      velocityMap[p.code] = { week1: 0, week2: 0, month1: 0, month3: 0 };
    });

    salesOrders.forEach(so => {
      const transDate = new Date(so.date);
      const diffDays = Math.floor((today.getTime() - transDate.getTime()) / (1000 * 60 * 60 * 24));

      so.lines.forEach(line => {
        if (!velocityMap[line.product_code]) {
          velocityMap[line.product_code] = { week1: 0, week2: 0, month1: 0, month3: 0 };
        }

        const qty = line.quantity;
        if (diffDays <= 7) velocityMap[line.product_code].week1 += qty;
        if (diffDays <= 14) velocityMap[line.product_code].week2 += qty;
        if (diffDays <= 30) velocityMap[line.product_code].month1 += qty;
        if (diffDays <= 90) velocityMap[line.product_code].month3 += qty;
      });
    });

    return products.map(p => {
      const data = velocityMap[p.code] || { week1: 0, week2: 0, month1: 0, month3: 0 };
      let status: VelocityItem['status'] = 'DORMANT';
      if (data.month3 >= 100) status = 'FAST MOVING';
      else if (data.month3 >= 30) status = 'MODERATE';
      else if (data.month3 > 0) status = 'SLOW MOVING';

      return {
        code: p.code,
        name: p.name,
        ...data,
        status,
      };
    });
  };

  const getStock = (itemCode: string) => {
    return movements
      .filter(m => m.item_code === itemCode)
      .reduce((sum, m) => sum + m.qty_in - m.qty_out, 0);
  };

  const velocityList = getVelocityReport();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="pb-6 border-b border-[#e7e5e4]">
        <h1 className="text-3xl font-bold text-[#1c1917] font-serif flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-amber-700" /> Executive Financial & Velocity Reports
        </h1>
        <p className="text-sm text-[#78716c] mt-1 font-medium">
          Product sales velocity classification, stock movement history, and inventory balance valuations.
        </p>
      </div>

      {/* Product Velocity Classification */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1c1917] font-serif flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-700" /> Product Velocity Report (7, 14, 30, 90 Days)
          </h2>
        </div>

        <div className="table-container glass-card">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product Scent</th>
                <th>7 Days</th>
                <th>14 Days</th>
                <th>30 Days</th>
                <th>90 Days (Total)</th>
                <th>Velocity Status</th>
              </tr>
            </thead>
            <tbody>
              {velocityList.map(v => (
                <tr key={v.code}>
                  <td>
                    <div className="font-bold text-[#1c1917]">{v.name}</div>
                    <div className="text-xs font-mono font-bold text-amber-800">{v.code}</div>
                  </td>
                  <td className="font-mono text-[#57534e] font-semibold">{v.week1} pcs</td>
                  <td className="font-mono text-[#57534e] font-semibold">{v.week2} pcs</td>
                  <td className="font-mono text-[#57534e] font-semibold">{v.month1} pcs</td>
                  <td className="font-mono font-bold text-[#1c1917] text-base">{v.month3} pcs</td>
                  <td>
                    <span
                      className={
                        v.status === 'FAST MOVING'
                          ? 'badge badge-approved'
                          : v.status === 'MODERATE'
                          ? 'badge badge-ready'
                          : v.status === 'SLOW MOVING'
                          ? 'badge badge-pending'
                          : 'badge bg-[#f5f4f0] text-[#78716c] border-[#e7e5e4]'
                      }
                    >
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Balances Table */}
      <div className="space-y-4 pt-6 border-t border-[#e7e5e4]">
        <h2 className="text-xl font-bold text-[#1c1917] font-serif flex items-center gap-2">
          <Boxes className="w-5 h-5 text-emerald-700" /> Finished Goods & Raw Material Inventory Balances
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Finished Goods Stock */}
          <div className="glass-card p-6 space-y-3 bg-white">
            <h3 className="text-base font-bold text-amber-800 font-serif">Finished Perfume Goods (FG)</h3>
            <div className="space-y-2">
              {products.map(p => {
                const stock = getStock(p.code);
                return (
                  <div key={p.code} className="flex justify-between items-center text-sm py-2 border-b border-[#f5f4f0]">
                    <span className="text-[#1c1917] font-bold">{p.name}</span>
                    <span className={`font-mono font-bold ${stock < 10 ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {stock} bottles available
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Raw Materials Stock */}
          <div className="glass-card p-6 space-y-3 bg-white">
            <h3 className="text-base font-bold text-purple-800 font-serif">Raw Materials & Ingredients</h3>
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
              {materials.map(m => {
                const stock = getStock(m.code);
                return (
                  <div key={m.code} className="flex justify-between items-center text-sm py-2 border-b border-[#f5f4f0]">
                    <div>
                      <span className="text-[#1c1917] font-bold block">{m.description}</span>
                      <span className="text-xs font-mono text-[#78716c]">{m.code}</span>
                    </div>
                    <span className={`font-mono font-bold ${stock < 100 ? 'text-amber-800' : 'text-[#44403c]'}`}>
                      {stock.toLocaleString()} {m.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
