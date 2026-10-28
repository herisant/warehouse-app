import React from 'react';
import { Package, Boxes, DollarSign, ArrowDownLeft, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { Product, StockTransaction, LowStockAlert } from '../../types/warehouse';

interface StatCardsProps {
  products: Product[];
  transactions: StockTransaction[];
  lowStockAlerts: LowStockAlert[];
  onOpenLowStock: () => void;
  onOpenScan: () => void;
}

export const StatCards: React.FC<StatCardsProps> = ({
  products,
  transactions,
  lowStockAlerts,
  onOpenLowStock,
  onOpenScan
}) => {
  // Aggregate stats
  const totalSKU = products.length;
  const totalStockQuantity = products.reduce((acc, p) => acc + p.currentStock, 0);
  const totalValuation = products.reduce((acc, p) => acc + (p.currentStock * p.buyPrice), 0);

  // Today's date string YYYY-MM-DD
  const todayPrefix = new Date().toISOString().substring(0, 10);
  
  const todayInboundUnits = transactions
    .filter(t => t.type === 'INBOUND' && t.timestamp.startsWith(todayPrefix))
    .reduce((acc, t) => acc + t.quantity, 0);

  const todayOutboundUnits = transactions
    .filter(t => t.type === 'OUTBOUND' && t.timestamp.startsWith(todayPrefix))
    .reduce((acc, t) => acc + t.quantity, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {/* 1. Total SKU */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold">Total SKU</span>
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-white font-mono">{totalSKU}</div>
        <div className="text-[11px] text-slate-400 mt-1">Item aktif terdaftar</div>
      </div>

      {/* 2. Total Fisik Unit */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold">Total Unit Fisik</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Boxes className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-white font-mono">
          {totalStockQuantity.toLocaleString('id-ID')}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Tersimpan di rak</div>
      </div>

      {/* 3. Nilai Inventaris Aset */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold">Nilai Aset Stok</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-black text-emerald-400 truncate font-mono">
          Rp {(totalValuation / 1000000).toFixed(1)}Jt
        </div>
        <div className="text-[11px] text-slate-400 mt-1 truncate">
          Rp {totalValuation.toLocaleString('id-ID')}
        </div>
      </div>

      {/* 4. Inbound Hari Ini */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold">Inbound Hari Ini</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-white font-mono">
          +{todayInboundUnits}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Barang masuk gudang</div>
      </div>

      {/* 5. Outbound Hari Ini */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold">Outbound Hari Ini</span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-white font-mono">
          -{todayOutboundUnits}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Barang terkirim/keluar</div>
      </div>

      {/* 6. Stok Menipis Kritis */}
      <div
        onClick={onOpenLowStock}
        className={`rounded-2xl p-4 shadow-lg transition cursor-pointer border ${
          lowStockAlerts.length > 0
            ? 'bg-rose-950/40 border-rose-500/40 hover:bg-rose-900/40'
            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold text-rose-300">Stok Kritis</span>
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-rose-400 font-mono">
          {lowStockAlerts.length}
        </div>
        <div className="text-[11px] text-rose-300/80 mt-1 underline flex items-center gap-1">
          Lihat & Notifikasi &rarr;
        </div>
      </div>
    </div>
  );
};
