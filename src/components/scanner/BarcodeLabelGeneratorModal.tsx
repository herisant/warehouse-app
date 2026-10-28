import React, { useState } from 'react';
import { X, Printer, Barcode, QrCode, Tag, Check, Copy } from 'lucide-react';
import { Product, RackLocation } from '../../types/warehouse';
import { generateBarcodeSvg, generateQrSvg } from '../../utils/barcode';

interface BarcodeLabelGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: Product | null;
  products: Product[];
  racks: RackLocation[];
}

export const BarcodeLabelGeneratorModal: React.FC<BarcodeLabelGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialProduct,
  products,
  racks
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(initialProduct?.id || products[0]?.id || '');
  const [labelType, setLabelType] = useState<'barcode' | 'qr'>('barcode');
  const [copies, setCopies] = useState<number>(4);
  const [includePrice, setIncludePrice] = useState(true);
  const [includeRack, setIncludeRack] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentProduct = products.find(p => p.id === selectedProductId) || initialProduct || products[0];
  const currentRack = currentProduct ? racks.find(r => r.id === currentProduct.rackLocationId) : null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = () => {
    if (currentProduct) {
      navigator.clipboard.writeText(currentProduct.barcode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Generator Label & Barcode Cetak</h2>
              <p className="text-xs text-slate-400">Cetak stiker kode batang thermal untuk ditempel pada kardus/rak gudang</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Controls - Hidden in print */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 no-print">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pilih Produk SKU:</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Format Kode:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLabelType('barcode')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl border transition ${
                    labelType === 'barcode'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <Barcode className="w-4 h-4" />
                  Code 128 (Barcode)
                </button>
                <button
                  type="button"
                  onClick={() => setLabelType('qr')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl border transition ${
                    labelType === 'qr'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  QR Code 2D
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePrice}
                  onChange={(e) => setIncludePrice(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-800"
                />
                Cantumkan Estimasi Nilai
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeRack}
                  onChange={(e) => setIncludeRack(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-800"
                />
                Cantumkan Lokasi Rak
              </label>
            </div>

            <div className="flex items-center justify-end gap-3">
              <span className="text-xs text-slate-400">Jumlah Salinan:</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 4, 8].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCopies(n)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                      copies === n ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Container */}
          <div>
            <div className="flex items-center justify-between mb-3 no-print">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-400" />
                Lembar Pratinjau Stiker ({copies} Label):
              </h3>
              <button
                onClick={handleCopyCode}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin Kode Barcode'}</span>
              </button>
            </div>

            {currentProduct && (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: copies }).map((_, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white text-slate-900 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center justify-between text-center select-none"
                    style={{ minHeight: '160px' }}
                  >
                    <div className="w-full text-left border-b border-slate-200 pb-1 mb-2 flex justify-between items-center">
                      <span className="text-[10px] font-black tracking-widest uppercase text-slate-500">GUDANG LOGISTIK</span>
                      {includeRack && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-900 text-white rounded">
                          {currentRack?.rackCode || 'RAK-00'}
                        </span>
                      )}
                    </div>

                    <div className="w-full text-center">
                      <h4 className="text-xs font-bold text-slate-900 leading-tight truncate px-1">
                        {currentProduct.name}
                      </h4>
                      <p className="text-[10px] font-mono font-semibold text-slate-600">
                        SKU: {currentProduct.sku}
                      </p>
                    </div>

                    {/* Vector Barcode or QR Image */}
                    <div className="my-2 flex items-center justify-center w-full">
                      {labelType === 'barcode' ? (
                        <div
                          className="w-full flex justify-center"
                          dangerouslySetInnerHTML={{
                            __html: generateBarcodeSvg(currentProduct.barcode, 210, 60)
                          }}
                        />
                      ) : (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: generateQrSvg(currentProduct.barcode, 75)
                          }}
                        />
                      )}
                    </div>

                    <div className="w-full flex justify-between items-center text-[9px] text-slate-600 border-t border-slate-100 pt-1 mt-1">
                      <span>Batch: {currentProduct.batchNumber || 'B-2026-X'}</span>
                      {includePrice && (
                        <span className="font-bold text-slate-900">
                          Rp {currentProduct.sellPrice.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900 no-print">
          <p className="text-xs text-slate-400">
            Kompatibel dengan printer label thermal (Zebra, Xprinter, Kassen, Dymo)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Batal
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Printer className="w-4 h-4" />
              Cetak Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
