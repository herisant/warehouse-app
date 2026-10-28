import React, { useState } from 'react';
import { X, CheckSquare, AlertCircle, CheckCircle2, Calculator } from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Product } from '../../types/warehouse';

interface StockOpnameModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: Product | null;
}

export const StockOpnameModal: React.FC<StockOpnameModalProps> = ({
  isOpen,
  onClose,
  initialProduct
}) => {
  const { products, racks, stockOpname, currentUser } = useWarehouse();

  const [selectedProductId, setSelectedProductId] = useState<string>(initialProduct?.id || products[0]?.id || '');
  const [physicalCount, setPhysicalCount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('Audit fisik rutin mingguan / stock opname');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  React.useEffect(() => {
    if (initialProduct) {
      setSelectedProductId(initialProduct.id);
      setPhysicalCount(initialProduct.currentStock);
    } else if (products[0]) {
      setPhysicalCount(products[0].currentStock);
    }
    setFeedback(null);
  }, [isOpen, initialProduct, products]);

  if (!isOpen) return null;

  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];
  const currentRack = currentProduct ? racks.find(r => r.id === currentProduct.rackLocationId) : null;

  const diff = physicalCount - (currentProduct?.currentStock || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;

    const res = stockOpname({
      productId: currentProduct.id,
      physicalCount: Number(physicalCount),
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
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Stock Opname & Rekonsiliasi</h2>
              <p className="text-xs text-slate-400">Pencocokan kuantitas fisik rak vs data sistem</p>
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
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                const p = products.find(prod => prod.id === e.target.value);
                if (p) setPhysicalCount(p.currentStock);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.sku} - {p.name} (Sistem: {p.currentStock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          {currentProduct && (
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-center">
              <div>
                <span className="text-slate-400 block text-[10px]">Catatan Sistem:</span>
                <span className="font-mono font-bold text-white text-sm">
                  {currentProduct.currentStock} {currentProduct.unit}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Hitungan Fisik:</span>
                <span className="font-mono font-bold text-sky-400 text-sm">
                  {physicalCount} {currentProduct.unit}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Selisih / Variansi:</span>
                <span className={`font-mono font-bold text-sm ${diff === 0 ? 'text-emerald-400' : diff < 0 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {diff > 0 ? `+${diff}` : diff} {currentProduct.unit}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Hasil Hitungan Fisik Riil di Rak:
            </label>
            <input
              type="number"
              min="0"
              required
              value={physicalCount}
              onChange={(e) => setPhysicalCount(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Catatan Rekonsiliasi Auditor:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Keterangan kondisi kemasan / barang rusak..."
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
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-sky-600/30"
            >
              <CheckSquare className="w-4 h-4" />
              Sesuaikan & Simpan Opname
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
