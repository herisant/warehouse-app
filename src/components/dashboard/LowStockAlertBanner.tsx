import React from 'react';
import { AlertTriangle, Send, BellRing, ArrowRight, ShieldAlert } from 'lucide-react';
import { LowStockAlert } from '../../types/warehouse';
import { useWarehouse } from '../../context/WarehouseContext';

interface LowStockAlertBannerProps {
  alerts: LowStockAlert[];
  onOpenAlertModal: () => void;
  onOpenRestockModal: (alert: LowStockAlert) => void;
}

export const LowStockAlertBanner: React.FC<LowStockAlertBannerProps> = ({
  alerts,
  onOpenAlertModal,
  onOpenRestockModal
}) => {
  const { sendAllLowStockAlerts, settings } = useWarehouse();
  const [notifiedMsg, setNotifiedMsg] = React.useState<string | null>(null);

  if (alerts.length === 0) {
    return null;
  }

  const handleBroadcastAlerts = () => {
    const count = sendAllLowStockAlerts();
    setNotifiedMsg(`Berhasil mengirimkan peringatan ${count} produk ke ${settings.alertEmailRecipients.split(',')[0]} & SMS.`);
    setTimeout(() => setNotifiedMsg(null), 5000);
  };

  return (
    <div className="bg-gradient-to-r from-rose-950/70 via-slate-900 to-amber-950/50 border border-rose-500/40 rounded-2xl p-4 shadow-xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Info */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0 animate-pulse">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Peringatan Stok Rendah Membutuhkan Tindakan
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                {alerts.length} SKU Menipis
              </span>
            </div>
            <p className="text-xs text-rose-200/80 mt-0.5">
              Terdapat item dengan jumlah stok di bawah batas ambang minimum (safety stock). Disarankan reorder segera untuk mencegah stockout.
            </p>

            {/* Micro SKU tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {alerts.slice(0, 3).map(al => (
                <span
                  key={al.id}
                  onClick={() => onOpenRestockModal(al)}
                  className="px-2 py-0.5 rounded bg-slate-800/90 hover:bg-slate-800 border border-rose-500/30 text-[10px] font-mono text-rose-300 cursor-pointer transition flex items-center gap-1"
                >
                  <span className="font-bold">{al.sku}</span>: {al.currentStock} pcs (Min: {al.minStock})
                </span>
              ))}
              {alerts.length > 3 && (
                <button
                  onClick={onOpenAlertModal}
                  className="text-[10px] text-amber-400 hover:underline px-1 py-0.5"
                >
                  +{alerts.length - 3} SKU lainnya &rarr;
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right CTA buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleBroadcastAlerts}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
          >
            <Send className="w-3.5 h-3.5" />
            Kirim Alert Email & SMS
          </button>
          <button
            onClick={onOpenAlertModal}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1"
          >
            Detail Alert
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {notifiedMsg && (
        <div className="mt-3 p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <BellRing className="w-4 h-4" />
          {notifiedMsg}
        </div>
      )}
    </div>
  );
};
