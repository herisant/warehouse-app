import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Scan,
  X,
  Camera,
  Keyboard,
  CheckCircle2,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Layers,
  Sparkles,
  Volume2,
  Printer
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Product } from '../../types/warehouse';
import { soundEffects } from '../../utils/audio';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProductForAction?: (product: Product, action: 'inbound' | 'outbound' | 'transfer' | 'label') => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectProductForAction
}) => {
  const { products, racks, findProductByBarcodeOrSku } = useWarehouse();
  const [activeTab, setActiveTab] = useState<'camera' | 'manual' | 'presets'>('camera');
  const [manualInput, setManualInput] = useState('');
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-code-interactive-scanner';

  // Handle scanned code
  const handleBarcodeDetected = (rawCode: string) => {
    const code = rawCode.trim();
    if (!code) return;

    setScannedResult(code);
    const product = findProductByBarcodeOrSku(code);

    if (product) {
      setMatchedProduct(product);
      setScannerError(null);
      soundEffects.playScanSuccess();
    } else {
      setMatchedProduct(null);
      setScannerError(`Barcode / SKU "${code}" belum terdaftar di sistem inventaris gudang.`);
      soundEffects.playErrorBuzz();
    }
  };

  // Setup camera scanner when camera tab is active
  useEffect(() => {
    if (!isOpen || activeTab !== 'camera') {
      stopScanner();
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      try {
        setScannerError(null);
        const devices = await Html5Qrcode.getCameras();
        if (!isMounted) return;

        if (devices && devices.length > 0) {
          setCameras(devices);
          const backCam = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('belakang')) || devices[0];
          const camId = selectedCameraId || backCam.id;
          setSelectedCameraId(camId);

          const scanner = new Html5Qrcode(scannerContainerId);
          html5QrCodeRef.current = scanner;

          await scanner.start(
            camId,
            {
              fps: 15,
              qrbox: { width: 280, height: 180 },
              aspectRatio: 1.333333
            },
            (decodedText) => {
              handleBarcodeDetected(decodedText);
            },
            () => {
              // Ignore scan frame misses
            }
          );
          setIsScanning(true);
        } else {
          setScannerError('Tidak ada kamera video yang terdeteksi di perangkat Anda.');
        }
      } catch (err) {
        console.warn('Camera scanner init err:', err);
        setScannerError('Izin kamera ditolak atau tidak tersedia. Gunakan tab Input Manual atau Tombol Sampel Barcode.');
        setIsScanning(false);
      }
    };

    const timer = setTimeout(() => {
      startScanner();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen, activeTab, selectedCameraId]);

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch {
        // Ignored
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  // Keyboard barcode listener for USB scanner guns
  useEffect(() => {
    if (!isOpen) return;

    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input element
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 150) {
        buffer = ''; // Reset if slow typing (human)
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          handleBarcodeDetected(buffer);
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentRack = matchedProduct ? racks.find(r => r.id === matchedProduct.rackLocationId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Scan className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Pemindai Barcode Real-Time
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Online
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Pindai kode batang / QR barang langsung menggunakan kamera atau scanner USB
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'camera'
                ? 'border-amber-500 text-amber-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            Kamera Pemindai (Real-Time)
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'manual'
                ? 'border-amber-500 text-amber-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Input Manual / Gun USB
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 ${
              activeTab === 'presets'
                ? 'border-amber-500 text-amber-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Simulasi Cepat (Demo SKU)
          </button>
        </div>

        {/* Main Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* CAMERA TAB */}
          {activeTab === 'camera' && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-[4/3] flex items-center justify-center">
                <div id={scannerContainerId} className="w-full h-full overflow-hidden" />

                {/* Overlay laser guide */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="relative w-64 h-44 border-2 border-dashed border-amber-400/80 rounded-xl bg-amber-500/5 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                    {/* Laser line animated */}
                    <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-bounce shadow-[0_0_8px_#f59e0b]" />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-900 border border-amber-500/50 rounded text-[10px] text-amber-400 font-mono">
                      ARAHKAN BARCODE DI SINI
                    </div>
                  </div>
                </div>

                {!isScanning && !scannerError && (
                  <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-4 text-center">
                    <Camera className="w-8 h-8 text-amber-400 animate-pulse mb-2" />
                    <p className="text-sm text-slate-300 font-medium">Menghubungkan ke sensor kamera...</p>
                    <p className="text-xs text-slate-500 mt-1">Pastikan izin kamera web browser diizinkan</p>
                  </div>
                )}
              </div>

              {cameras.length > 1 && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Pilih Kamera:</span>
                  <select
                    value={selectedCameraId}
                    onChange={(e) => setSelectedCameraId(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs"
                  >
                    {cameras.map(c => (
                      <option key={c.id} value={c.id}>{c.label || `Kamera ${c.id}`}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* MANUAL TAB */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Ketik Barcode atau SKU Barang (atau tembakkan barcode scanner gun fisik):
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleBarcodeDetected(manualInput);
                        }
                      }}
                      placeholder="Contoh: 899276100101 atau ELC-MON-024"
                      className="w-full pl-3 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={() => handleBarcodeDetected(manualInput)}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                  >
                    <Scan className="w-4 h-4" />
                    Cari / Scan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PRESETS TAB */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Klik salah satu SKU di bawah untuk menyimulasikan pemindaian instan tanpa perlu mencetak barcode fisik:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleBarcodeDetected(p.barcode)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 transition text-left group"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-200 group-hover:text-amber-400 transition truncate max-w-[190px]">
                        {p.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {p.sku} • {p.barcode}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-white">{p.currentStock}</span>
                      <span className="text-[10px] text-slate-400 ml-1">{p.unit}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ERROR ALERT */}
          {scannerError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-semibold">Peringatan Pemindaian</p>
                <p className="mt-0.5 opacity-90">{scannerError}</p>
              </div>
            </div>
          )}

          {/* SCANNED PRODUCT RESULT CARD */}
          {matchedProduct && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/90 to-slate-850 border border-emerald-500/40 shadow-xl space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Terverifikasi
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {matchedProduct.barcode}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">
                      {matchedProduct.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      SKU: <span className="font-mono text-slate-200">{matchedProduct.sku}</span> | Kategori: <span className="text-slate-200">{matchedProduct.category}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Stok Tersedia</div>
                  <div className={`text-xl font-bold font-mono ${matchedProduct.currentStock <= matchedProduct.minStock ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {matchedProduct.currentStock} <span className="text-xs font-normal text-slate-400">{matchedProduct.unit}</span>
                  </div>
                </div>
              </div>

              {/* Specs & Location info */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/80 rounded-lg text-xs border border-slate-700/50">
                <div>
                  <span className="text-slate-500 block text-[10px]">Lokasi Rak</span>
                  <span className="font-semibold text-amber-400 font-mono">
                    {currentRack ? `${currentRack.rackCode} (${currentRack.shelfLevel})` : 'Belum diatur'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Nilai Satuan</span>
                  <span className="font-semibold text-slate-200">
                    Rp {matchedProduct.buyPrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Supplier</span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {matchedProduct.supplier}
                  </span>
                </div>
              </div>

              {/* Quick Actions for this item */}
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Aksi Cepat untuk SKU Ini:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => {
                      if (onSelectProductForAction) {
                        onSelectProductForAction(matchedProduct, 'inbound');
                        onClose();
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    Barang Masuk (+)
                  </button>
                  <button
                    onClick={() => {
                      if (onSelectProductForAction) {
                        onSelectProductForAction(matchedProduct, 'outbound');
                        onClose();
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/40 text-xs font-bold transition"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    Barang Keluar (-)
                  </button>
                  <button
                    onClick={() => {
                      if (onSelectProductForAction) {
                        onSelectProductForAction(matchedProduct, 'transfer');
                        onClose();
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 text-xs font-bold transition"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    Pindah Rak
                  </button>
                  <button
                    onClick={() => {
                      if (onSelectProductForAction) {
                        onSelectProductForAction(matchedProduct, 'label');
                        onClose();
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Cetak Stiker
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Audio Scanner Beep Aktif</span>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
