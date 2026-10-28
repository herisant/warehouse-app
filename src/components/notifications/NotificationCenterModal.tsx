import React, { useState } from 'react';
import {
  X,
  Bell,
  Mail,
  MessageSquare,
  AlertTriangle,
  Send,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  ArrowDownLeft
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';
import { LowStockAlert } from '../../types/warehouse';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRestock?: (productId: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onSelectRestock
}) => {
  const {
    lowStockAlerts,
    notifications,
    sendLowStockAlert,
    sendAllLowStockAlerts,
    settings,
    products
  } = useWarehouse();

  const [activeTab, setActiveTab] = useState<'alerts' | 'history'>('alerts');
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendSingleAlert = (alert: LowStockAlert) => {
    sendLowStockAlert(alert.productId, ['email', 'sms', 'whatsapp']);
    setSentNotice(`Notifikasi untuk ${alert.productName} telah dikirim ke ${settings.alertEmailRecipients.split(',')[0]} dan nomor SMS ${settings.alertPhoneRecipients.split(',')[0]}`);
    setTimeout(() => setSentNotice(null), 4000);
  };

  const handleBroadcastAll = () => {
    const count = sendAllLowStockAlerts();
    setSentNotice(`Berhasil mengirim ${count} peringatan stok kritis ke seluruh saluran notifikasi.`);
    setTimeout(() => setSentNotice(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Pusat Notifikasi & Peringatan Stok Rendah
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  {lowStockAlerts.length} Kritis
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Peringatan otomatis terintegrasi ke Email & SMS/WhatsApp Gateway
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'alerts'
                ? 'border-amber-500 text-amber-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Daftar SKU Kritis ({lowStockAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'history'
                ? 'border-amber-500 text-amber-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Riwayat Log Pesan Terkirim ({notifications.length})
          </button>
        </div>

        {sentNotice && (
          <div className="mx-6 mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{sentNotice}</span>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'alerts' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Target pengiriman: <strong className="text-slate-200">{settings.alertEmailRecipients.split(',')[0]}</strong> & SMS
                </span>
                {lowStockAlerts.length > 0 && (
                  <button
                    onClick={handleBroadcastAll}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-600/30"
                  >
                    <Send className="w-3 h-3" />
                    Kirim Semua Alert
                  </button>
                )}
              </div>

              {lowStockAlerts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-60" />
                  <p className="font-semibold text-white">Semua Level Stok Aman!</p>
                  <p className="text-[11px] text-slate-500 mt-1">Tidak ada produk dengan kuantitas di bawah batas ambang minimum.</p>
                </div>
              ) : (
                lowStockAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {alert.severity}
                        </span>
                        <span className="font-mono text-xs text-slate-400">{alert.sku}</span>
                        <span className="text-xs text-slate-500">• Rak: {alert.rackCode}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">
                        {alert.productName}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Tersisa: <strong className="text-rose-400 font-mono">{alert.currentStock} pcs</strong> (Batas minimum: {alert.minStock} pcs • Defisit: -{alert.deficit} pcs)
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onSelectRestock && (
                        <button
                          onClick={() => {
                            onClose();
                            onSelectRestock(alert.productId);
                          }}
                          className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                        >
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          Restock
                        </button>
                      )}
                      <button
                        onClick={() => handleSendSingleAlert(alert)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Kirim Alert
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* HISTORY TAB */
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Belum ada log riwayat pengiriman notifikasi.
                </div>
              ) : (
                notifications.map(log => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {log.channel === 'email' ? (
                          <span className="p-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            <Mail className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <MessageSquare className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <span className="font-bold text-white">{log.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pl-7">
                      {log.message}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 pl-7">
                      <span>Tujuan: <strong className="text-slate-300 font-mono">{log.recipient}</strong></span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                        Status: Terkirim
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-900 text-xs text-slate-400">
          <span>SMTP & SMS Dispatch Engine Siap Pakai</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
