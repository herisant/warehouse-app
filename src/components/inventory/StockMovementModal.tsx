import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Barcode,
  Layers,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Scan
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Product, RackLocation } from '../../types/warehouse';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'INBOUND' | 'OUTBOUND';
  initialProduct?: Product | null;
  onOpenBarcodeScanner?: () => void;
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({
  isOpen,
  onClose,
  type,
  initialProduct,
  onOpenBarcodeScanner
}) => {
  const {
    products,
    racks,
    inboundStock,
    outboundStock,
    currentUser
  } = useWarehouse();

  const [selectedProductId, setSelectedProductId] = useState<string>(initialProduct?.id || products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(10);
  const [refNumber, setRefNumber] = useState<string>('');
  const [toRackId, setToRackId] = useState<string>(racks[0]?.id || '');
  const [notes, setNotes] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (initialProduct) {
      setSelectedProductId(initialProduct.id);
      setToRackId(initialProduct.rackLocationId || racks[0]?.id || '');
    }
    // Generate default reference number
    const prefix = type === 'INBOUND' ? 'PO' : 'DO';
    const num = Math.floor(1000 + Math.random() * 9000);
    setRefNumber(`${prefix}-2026-${num}`);
    setFeedback(null);
  }, [isOpen, initialProduct, type, racks]);

  if (!isOpen) return null;

  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];
  const currentRack = currentProduct ? racks.find(r => r.id === currentProduct.rackLocationId) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || quantity <= 0) return;

    if (type === 'INBOUND') {
      const result = inboundStock({
        productId: currentProduct.id,
        quantity: Number(quantity),
        refNumber,
        toRackId: toRackId || currentProduct.rackLocationId,
        notes
      });
      if (result.success) {
        setFeedback({ type: 'success', message: result.message });
        setTimeout(() => onClose(), 1500);
      } else {
        setFeedback({ type: 'error', message: result.message });
      }
    } else {
      const result = outboundStock({
        productId: currentProduct.id,
        quantity: Number(quantity),
        refNumber,
        notes
      });
      if (result.success) {
        setFeedback({ type: 'success', message: result.message });
        setTimeout(() => onClose(), 1500);
      } else {
        setFeedback({ type: 'error', message: result.message });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              type === 'INBOUND'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}>
              {type === 'INBOUND' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {type === 'INBOUND' ? 'Penerimaan Barang Masuk (Inbound)' : 'Pengeluaran Barang Keluar (Outbound)'}
              </h2>
              <p className="text-xs text-slate-400">
                Operator: <span className="text-slate-200 font-medium">{currentUser.name}</span>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">Pilih Produk SKU:</label>
              {onOpenBarcodeScanner && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBarcodeScanner();
                  }}
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Scan className="w-3 h-3" />
                  Scan Kamera Barcode
                </button>
              )}
            </div>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                const p = products.find(prod => prod.id === e.target.value);
                if (p) setToRackId(p.rackLocationId);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.sku} - {p.name} (Tersedia: {p.currentStock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          {currentProduct && (
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Stok Fisik Tersedia:</span>
                <span className="font-mono font-bold text-white text-sm">
                  {currentProduct.currentStock} {currentProduct.unit}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Lokasi Rak Saat Ini:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {currentRack?.rackCode || 'RAK-00'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Ambang Minimum:</span>
                <span className="font-mono text-slate-300 text-xs">
                  {currentProduct.minStock} {currentProduct.unit}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Jumlah {type === 'INBOUND' ? 'Masuk' : 'Keluar'} ({currentProduct?.unit || 'Unit'}):
              </label>
              <input
                type="number"
                min="1"
                max={type === 'OUTBOUND' ? currentProduct?.currentStock : 10000}
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                No. Referensi Dokumen:
              </label>
              <input
                type="text"
                required
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                placeholder={type === 'INBOUND' ? 'PO-2026-001' : 'DO-2026-001'}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {type === 'INBOUND' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tempatkan ke Rak Tujuan:
              </label>
              <select
                value={toRackId}
                onChange={(e) => setToRackId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {racks.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.rackCode} - {r.zone.split('-')[0].trim()} ({r.currentUnits}/{r.maxCapacityUnits} unit)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Catatan Transaksi / Penerima / Pengirim:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={type === 'INBOUND' ? 'Penerimaan kontainer batch 1 supplier...' : 'Pengiriman surat jalan klien...'}
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
              className={`px-5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg ${
                type === 'INBOUND'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {type === 'INBOUND' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
              {type === 'INBOUND' ? 'Konfirmasi Penerimaan (+)' : 'Konfirmasi Pengeluaran (-)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
