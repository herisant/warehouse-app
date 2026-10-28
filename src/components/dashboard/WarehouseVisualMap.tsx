import React, { useState } from 'react';
import { Layers, Box, AlertCircle, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { RackLocation, Product } from '../../types/warehouse';

interface WarehouseVisualMapProps {
  racks: RackLocation[];
  products: Product[];
  onSelectProduct?: (product: Product) => void;
  onSelectRackForTransfer?: (rack: RackLocation) => void;
}

export const WarehouseVisualMap: React.FC<WarehouseVisualMapProps> = ({
  racks,
  products,
  onSelectProduct,
  onSelectRackForTransfer
}) => {
  const [selectedRackId, setSelectedRackId] = useState<string>(racks[0]?.id || '');
  const [filterZone, setFilterZone] = useState<string>('all');

  const zones = Array.from(new Set(racks.map(r => r.zone)));

  const filteredRacks = racks.filter(r => {
    if (filterZone === 'all') return true;
    return r.zone === filterZone;
  });

  const activeRack = racks.find(r => r.id === selectedRackId) || racks[0];
  const itemsInActiveRack = products.filter(p => p.rackLocationId === activeRack?.id);

  const getOccupancyPercentage = (rack: RackLocation) => {
    if (!rack.maxCapacityUnits || rack.maxCapacityUnits === 0) return 0;
    return Math.min(100, Math.round((rack.currentUnits / rack.maxCapacityUnits) * 100));
  };

  const getOccupancyColor = (pct: number) => {
    if (pct >= 85) return { bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/40', badge: 'Kapasitas Penuh / Kritis' };
    if (pct >= 60) return { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/40', badge: 'Okupansi Sedang' };
    return { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/40', badge: 'Kapasitas Longgar' };
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            Denah & Visualisasi Okupansi Rak Gudang
          </h2>
          <p className="text-xs text-slate-400">
            Monitoring kapasitas real-time per zona rak, tingkat lantai, dan penempatan SKU fisik
          </p>
        </div>

        {/* Zone Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 hidden sm:inline">Zona:</span>
          <select
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">Semua Zona Gudang</option>
            {zones.map(z => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2-Column interactive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Rack Visual Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Pilih Rak untuk Inspeksi Isi:</span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> &lt;60% Longgar
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> 60-85% Sedang
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span> &gt;85% Padat
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredRacks.map(rack => {
              const pct = getOccupancyPercentage(rack);
              const color = getOccupancyColor(pct);
              const isSelected = selectedRackId === rack.id;
              const itemCount = products.filter(p => p.rackLocationId === rack.id).length;

              return (
                <button
                  key={rack.id}
                  onClick={() => setSelectedRackId(rack.id)}
                  className={`p-3.5 rounded-xl border text-left transition relative flex flex-col justify-between overflow-hidden group ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-800/40 hover:bg-slate-800/70 border-slate-700/60'
                  }`}
                >
                  {/* Top indicator bar */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 ${color.bg}`}
                    style={{ width: `${pct}%` }}
                  />

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black font-mono tracking-wider text-white group-hover:text-amber-400 transition">
                        {rack.rackCode}
                      </span>
                      <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${color.text} bg-slate-900`}>
                        {pct}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {rack.shelfLevel}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {rack.zone.split('-')[0].trim()}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color.bg} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                      <span>{rack.currentUnits} / {rack.maxCapacityUnits} unit</span>
                      <span>{itemCount} SKU</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Rack Detail Panel (5 cols) */}
        {activeRack && (
          <div className="lg:col-span-5 bg-slate-800/50 border border-slate-700/70 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-slate-700">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black font-mono text-amber-400">
                      {activeRack.rackCode}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getOccupancyColor(getOccupancyPercentage(activeRack)).border} ${getOccupancyColor(getOccupancyPercentage(activeRack)).text}`}>
                      {getOccupancyColor(getOccupancyPercentage(activeRack)).badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    {activeRack.zone} • {activeRack.shelfLevel}
                  </p>
                  {activeRack.description && (
                    <p className="text-[11px] text-slate-400 mt-1 italic">
                      {activeRack.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Items currently on this rack */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span>Daftar Barang Tersimpan ({itemsInActiveRack.length} SKU):</span>
                  <span>Stok Fisik</span>
                </div>

                {itemsInActiveRack.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    <Box className="w-8 h-8 mx-auto mb-1 opacity-40" />
                    Belum ada barang yang dialokasikan ke rak ini.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {itemsInActiveRack.map(item => (
                      <div
                        key={item.id}
                        onClick={() => onSelectProduct && onSelectProduct(item)}
                        className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer flex items-center justify-between"
                      >
                        <div className="truncate pr-2">
                          <p className="text-xs font-semibold text-white truncate">
                            {item.name}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400">
                            {item.sku} • {item.category}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-xs font-bold font-mono ${item.currentStock <= item.minStock ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {item.currentStock}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">{item.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick action button for rack */}
            <div className="pt-3 mt-3 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Sisa Kapasitas: <strong className="text-white">{Math.max(0, activeRack.maxCapacityUnits - activeRack.currentUnits)} unit</strong>
              </span>
              {onSelectRackForTransfer && (
                <button
                  onClick={() => onSelectRackForTransfer(activeRack)}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                >
                  Pindahkan Stok ke Rak Ini
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
