import React, { useState, useEffect } from 'react';
import { X, ArrowLeftRight, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Product, RackLocation } from '../../types/warehouse';

interface RackTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: Product | null;
  targetRack?: RackLocation | null;
}

export const RackTransferModal: React.FC<RackTransferModalProps> = ({
  isOpen,
  onClose,
  initialProduct,
  targetRack
}) => {
  const { products, racks, transferRack, currentUser } = useWarehouse();

  const [selectedProductId, setSelectedProductId] = useState<string>(initialProduct?.id || products[0]?.id || '');
  const [toRackId, setToRackId] = useState<string>(targetRack?.id || racks[1]?.id || '');
  const [notes, setNotes] = useState<string>('Relokasi penataan ulang slot rak');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (initialProduct) setSelectedProductId(initialProduct.id);
    if (targetRack) setToRackId(targetRack.id);
    setFeedback(null);
  }, [isOpen, initialProduct, targetRack]);

  if (!isOpen) return null;

  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];
  const fromRack = racks.find(r => r.id === currentProduct?.rackLocationId);
  const destRack = racks.find(r => r.id === toRackId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || !fromRack || !destRack) return;

    if (fromRack.id === destRack.id) {
      setFeedback({ type: 'error', message: 'Rak asal dan rak tujuan tidak boleh sama.' });
      return;
    }

    const res = transferRack({
      productId: currentProduct.id,
      quantity: currentProduct.currentStock,
      fromRackId: fromRack.id,
      toRackId: destRack.id,
      notes
    });

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => onClose(), 1500);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Mutasi / Pindah Lokasi Rak</h2>
              <p className="text-xs text-slate-400">Pindahkan penempatan fisik SKU ke rak lain</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {feedback && (
          <div className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Pilih Produk SKU:</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.sku} - {p.name} ({p.currentStock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Dari Rak Asal:</span>
              <span className="font-mono font-bold text-white">
                {fromRack?.rackCode || 'RAK-00'}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                {fromRack?.zone.split('-')[0].trim()}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px]">Ke Rak Tujuan:</span>
              <span className="font-mono font-bold text-indigo-400">
                {destRack?.rackCode || 'Pilih rak'}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                Sisa: {Math.max(0, (destRack?.maxCapacityUnits || 0) - (destRack?.currentUnits || 0))} unit
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Pilih Rak Tujuan Baru:</label>
            <select
              value={toRackId}
              onChange={(e) => setToRackId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {racks.map(r => (
                <option key={r.id} value={r.id} disabled={r.id === fromRack?.id}>
                  {r.rackCode} - {r.zone} ({r.shelfLevel}) {r.id === fromRack?.id ? '(Rak Saat Ini)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Alasan Relokasi / Catatan:</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Misal: Penyesuaian zona fast-moving..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Pindahkan ke Rak Baru
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
