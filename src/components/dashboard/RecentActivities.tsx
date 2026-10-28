import React from 'react';
import { History, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, CheckSquare, Clock } from 'lucide-react';
import { StockTransaction } from '../../types/warehouse';

interface RecentActivitiesProps {
  transactions: StockTransaction[];
  onViewAll?: () => void;
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ transactions, onViewAll }) => {
  const recent = transactions.slice(0, 6);

  const getBadge = (type: StockTransaction['type']) => {
    switch (type) {
      case 'INBOUND':
        return {
          icon: <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          label: 'Masuk (Inbound)'
        };
      case 'OUTBOUND':
        return {
          icon: <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />,
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          label: 'Keluar (Outbound)'
        };
      case 'TRANSFER':
        return {
          icon: <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />,
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          label: 'Pindah Rak'
        };
      case 'OPNAME':
        return {
          icon: <CheckSquare className="w-3.5 h-3.5 text-sky-400" />,
          bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
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
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            Riwayat Aktivitas Gudang Terkini
          </h3>
          <p className="text-xs text-slate-400">
            Pencatatan real-time penerimaan, pengeluaran, dan audit operator
          </p>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
          >
            Lihat Semua &rarr;
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {recent.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Belum ada aktivitas transaksi inventaris.
          </div>
        ) : (
          recent.map(trx => {
            const badge = getBadge(trx.type);
            return (
              <div
                key={trx.id}
                className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800 transition flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${badge.bg}`}>
                    {badge.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">
                        {trx.productName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                        {trx.sku}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      Ref: <span className="font-mono text-slate-300">{trx.referenceNumber}</span> • Oleh: {trx.performedByName}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono text-xs font-bold">
                    <span className={trx.type === 'INBOUND' ? 'text-emerald-400' : trx.type === 'OUTBOUND' ? 'text-amber-400' : 'text-indigo-400'}>
                      {trx.type === 'INBOUND' ? `+${trx.quantity}` : trx.type === 'OUTBOUND' ? `-${trx.quantity}` : `${trx.quantity}`}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1">unit</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {trx.timestamp.split(' ')[1] || trx.timestamp}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
