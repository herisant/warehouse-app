import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  CheckSquare,
  Search,
  Filter,
  FileText,
  Calendar,
  Layers,
  Clock
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';
import { StockTransaction, TransactionType } from '../../types/warehouse';

interface TransactionsViewProps {
  initialTypeFilter?: TransactionType | 'ALL';
  onOpenInbound: () => void;
  onOpenOutbound: () => void;
  onOpenTransfer: () => void;
  onOpenOpname: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  initialTypeFilter = 'ALL',
  onOpenInbound,
  onOpenOutbound,
  onOpenTransfer,
  onOpenOpname
}) => {
  const { transactions, racks } = useWarehouse();
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>(initialTypeFilter);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = transactions.filter(t => {
    const matchesType = filterType === 'ALL' || t.type === filterType;
    const matchesSearch =
      t.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.performedByName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getBadge = (type: TransactionType) => {
    switch (type) {
      case 'INBOUND':
        return {
          icon: <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />,
          bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          label: 'Masuk (Inbound)'
        };
      case 'OUTBOUND':
        return {
          icon: <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />,
          bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          label: 'Keluar (Outbound)'
        };
      case 'TRANSFER':
        return {
          icon: <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />,
          bg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
          label: 'Mutasi Rak'
        };
      case 'OPNAME':
        return {
          icon: <CheckSquare className="w-3.5 h-3.5 text-sky-400" />,
          bg: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
          label: 'Stock Opname'
        };
      default:
        return {
          icon: <Clock className="w-3.5 h-3.5 text-slate-400" />,
          bg: 'bg-slate-700 text-slate-300',
          label: type
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Jurnal Mutasi & Transaksi Arus Barang
          </h2>
          <p className="text-xs text-slate-400">
            Audit trail lengkap pergerakan stok masuk, keluar, perpindahan antar rak dan rekonsiliasi
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenInbound}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
          >
            <ArrowDownLeft className="w-4 h-4" />
            Barang Masuk (+)
          </button>
          <button
            onClick={onOpenOutbound}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <ArrowUpRight className="w-4 h-4" />
            Barang Keluar (-)
          </button>
          <button
            onClick={onOpenTransfer}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Mutasi Rak
          </button>
          <button
            onClick={onOpenOpname}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-sky-600/20"
          >
            <CheckSquare className="w-4 h-4" />
            Stock Opname
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan No Referensi (PO/DO), nama barang, SKU, atau operator..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {(['ALL', 'INBOUND', 'OUTBOUND', 'TRANSFER', 'OPNAME'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterType === t
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t === 'ALL' ? 'Semua Tipe' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-800 text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Waktu Transaksi</th>
                <th className="px-4 py-3.5">Tipe Gerakan</th>
                <th className="px-4 py-3.5">No. Referensi Dokumen</th>
                <th className="px-4 py-3.5">Produk & SKU</th>
                <th className="px-4 py-3.5 text-right">Kuantitas</th>
                <th className="px-4 py-3.5 text-right">Stok Akhir</th>
                <th className="px-4 py-3.5">Catatan / Lokasi</th>
                <th className="px-4 py-3.5">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Tidak ada transaksi yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map(trx => {
                  const badge = getBadge(trx.type);
                  const toRack = racks.find(r => r.id === trx.toRackId);
                  const fromRack = racks.find(r => r.id === trx.fromRackId);

                  return (
                    <tr key={trx.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3.5 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                        {trx.timestamp}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                          {badge.icon}
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-white">
                        {trx.referenceNumber}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white">{trx.productName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{trx.sku}</div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-sm">
                        <span className={trx.type === 'INBOUND' ? 'text-emerald-400' : trx.type === 'OUTBOUND' ? 'text-amber-400' : 'text-indigo-400'}>
                          {trx.type === 'INBOUND' ? `+${trx.quantity}` : trx.type === 'OUTBOUND' ? `-${trx.quantity}` : trx.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-300">
                        {trx.resultingStock}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 max-w-[220px]">
                        <p className="truncate text-slate-300">{trx.notes}</p>
                        {(toRack || fromRack) && (
                          <span className="text-[10px] font-mono text-amber-400">
                            {fromRack ? `${fromRack.rackCode} → ` : ''}{toRack ? toRack.rackCode : ''}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-300 font-medium">
                        {trx.performedByName}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
