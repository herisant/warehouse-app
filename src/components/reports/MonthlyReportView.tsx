import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Download,
  Printer,
  Send,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  DollarSign,
  Package,
  Layers
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';
import { MonthlyInventoryReport } from '../../types/warehouse';
import confetti from 'canvas-confetti';

export const MonthlyReportView: React.FC = () => {
  const {
    reports,
    generateMonthlyReport,
    settings,
    products,
    hasPermission,
    currentUser
  } = useWarehouse();

  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailStatusMsg, setEmailStatusMsg] = useState<string | null>(null);

  const activeReport = reports.find(r => r.id === selectedReportId) || reports[0];

  const handleGenerateNow = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newRep = generateMonthlyReport();
      setSelectedReportId(newRep.id);
      setIsGenerating(false);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 }
      });
    }, 600);
  };

  const handleSendEmailSimulation = () => {
    setEmailStatusMsg(`Laporan inventaris bulan ${activeReport?.reportMonth} berhasil dikirimkan ke email dewan direksi & manajemen: ${settings.reportEmailRecipients}`);
    setTimeout(() => setEmailStatusMsg(null), 6000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (!activeReport) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `LAPORAN INVENTARIS AKHIR BULAN - ${activeReport.reportMonth}\r\n`;
    csvContent += `Dibuat Pada,${activeReport.generatedAt}\r\n`;
    csvContent += `Oleh,${activeReport.generatedBy}\r\n`;
    csvContent += `Total SKU,${activeReport.totalSKU}\r\n`;
    csvContent += `Total Unit Fisik,${activeReport.totalStockQuantity}\r\n`;
    csvContent += `Nilai Valuasi IDR,${activeReport.totalValuationIDR}\r\n\r\n`;

    csvContent += 'Kategori,Jumlah SKU,Total Stok Unit,Nilai Valuasi (IDR)\r\n';
    activeReport.categoryBreakdown.forEach(c => {
      csvContent += `"${c.category}",${c.itemCount},${c.totalStock},${c.totalValuation}\r\n`;
    });

    csvContent += '\r\nSKU,Nama Produk,Turnover Keluar,Tipe\r\n';
    activeReport.topMovingProducts.forEach(p => {
      csvContent += `"${p.sku}","${p.name}",${p.turnoverQuantity},"${p.type}"\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Inventaris_${activeReport.monthKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Automated Scheduler Status Card */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Otomatisasi Laporan Inventaris Akhir Bulan
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Aktif (Jadwal: Tgl {settings.reportDayOfMonth} Pukul {settings.reportTime})
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Sistem GudangMaster secara otomatis membekukan snapshot inventaris, menghitung valuasi aset stok, mendeteksi slow/fast moving SKU, dan mengirimkan file laporan ke email manajemen pada setiap penutupan buku akhir bulan.
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                <span>Penerima Email: <strong className="text-slate-200">{settings.reportEmailRecipients.split(',')[0]}</strong></span>
                <span>•</span>
                <span>Metode Valuasi: <strong className="text-slate-200">Weighted Average / FIFO</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleGenerateNow}
              disabled={isGenerating}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {isGenerating ? 'Memproses Laporan...' : 'Jalankan Generator Akhir Bulan Sekarang'}
            </button>
          </div>
        </div>

        {emailStatusMsg && (
          <div className="mt-3 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{emailStatusMsg}</span>
          </div>
        )}
      </div>

      {/* Main Report View & History Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Archive Selector (3 cols) - Hidden in Print */}
        <div className="lg:col-span-3 space-y-3 no-print">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-400" />
            Arsip Periode Laporan:
          </h3>
          <div className="space-y-2">
            {reports.map(rep => {
              const isSelected = activeReport?.id === rep.id;
              return (
                <button
                  key={rep.id}
                  onClick={() => setSelectedReportId(rep.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition ${
                    isSelected
                      ? 'bg-slate-800 border-amber-500 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/80 hover:bg-slate-800/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-white">{rep.reportMonth}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      Final
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Nilai: <strong className="text-slate-200">Rp {(rep.totalValuationIDR / 1000000).toFixed(1)}Jt</strong>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {rep.totalSKU} SKU • {rep.totalStockQuantity} Unit Fisik
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Report Document Sheet (9 cols) */}
        <div className="lg:col-span-9 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 print-card">
          {activeReport ? (
            <>
              {/* Document Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-lg font-black text-white uppercase tracking-wide">
                      LAPORAN INVENTARIS & VALUASI AKHIR BULAN
                    </h1>
                    <p className="text-xs text-slate-400 font-medium">
                      {settings.companyName} • {settings.warehouseName}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Periode Tutup Buku: <strong className="text-amber-400">{activeReport.reportMonth}</strong> | Dibuat: {activeReport.generatedAt}
                    </p>
                  </div>
                </div>

                {/* Action Buttons - No Print */}
                <div className="flex items-center gap-2 no-print">
                  <button
                    onClick={handleExportCsv}
                    className="p-2 sm:px-3 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                    title="Export CSV"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="p-2 sm:px-3 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                    title="Cetak Laporan / Simpan PDF"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Cetak / PDF</span>
                  </button>
                  <button
                    onClick={handleSendEmailSimulation}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                  >
                    <Send className="w-4 h-4" />
                    Kirim ke Email
                  </button>
                </div>
              </div>

              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-800/40 rounded-xl border border-slate-800 text-center">
                <div>
                  <div className="text-[11px] text-slate-400">Total Valuasi Aset</div>
                  <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                    Rp {activeReport.totalValuationIDR.toLocaleString('id-ID')}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Total Unit Fisik</div>
                  <div className="text-lg font-black text-white font-mono mt-0.5">
                    {activeReport.totalStockQuantity} <span className="text-xs font-normal text-slate-400">Unit</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Total SKU Terdaftar</div>
                  <div className="text-lg font-black text-white font-mono mt-0.5">
                    {activeReport.totalSKU} <span className="text-xs font-normal text-slate-400">SKU</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Item Menipis/Kritis</div>
                  <div className="text-lg font-black text-rose-400 font-mono mt-0.5">
                    {activeReport.lowStockItemsCount} <span className="text-xs font-normal text-slate-400">SKU</span>
                  </div>
                </div>
              </div>

              {/* Category Breakdown Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Rincian Stok & Valuasi per Kategori
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-800/80 text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Kategori Produk</th>
                        <th className="px-4 py-3 text-center">Jumlah SKU</th>
                        <th className="px-4 py-3 text-right">Stok Fisik</th>
                        <th className="px-4 py-3 text-right">Valuasi (IDR)</th>
                        <th className="px-4 py-3 text-right">Pangsa Aset</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      {activeReport.categoryBreakdown.map((c, i) => {
                        const sharePct = activeReport.totalValuationIDR > 0
                          ? ((c.totalValuation / activeReport.totalValuationIDR) * 100).toFixed(1)
                          : '0';
                        return (
                          <tr key={i} className="hover:bg-slate-800/30">
                            <td className="px-4 py-3 font-medium text-white">{c.category}</td>
                            <td className="px-4 py-3 text-center font-mono">{c.itemCount}</td>
                            <td className="px-4 py-3 text-right font-mono">{c.totalStock} unit</td>
                            <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-400">
                              Rp {c.totalValuation.toLocaleString('id-ID')}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-slate-400">{sharePct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Turnover Items */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Analisis Perputaran Stok (Fast Moving & Slow Moving)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeReport.topMovingProducts.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{p.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{p.sku}</span>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.type === 'fast_moving'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {p.type === 'fast_moving' ? 'Fast Moving' : 'Slow Moving'}
                        </span>
                        <div className="text-[10px] font-mono text-slate-400 mt-1">
                          {p.turnoverQuantity} unit keluar
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signatures & Auditor stamp for formal print */}
              <div className="pt-8 border-t border-slate-800 grid grid-cols-3 gap-4 text-center text-xs text-slate-400">
                <div>
                  <p className="font-semibold text-slate-300">Dibuat Oleh:</p>
                  <div className="h-14 flex items-end justify-center font-serif text-slate-400 italic">
                    {activeReport.generatedBy}
                  </div>
                  <p className="border-t border-slate-700 pt-1 font-medium text-slate-200">Staff Gudang</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-300">Disetujui Oleh:</p>
                  <div className="h-14 flex items-end justify-center font-serif text-slate-400 italic">
                    Budi Santoso
                  </div>
                  <p className="border-t border-slate-700 pt-1 font-medium text-slate-200">Warehouse Manager</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-300">Diverifikasi Auditor:</p>
                  <div className="h-14 flex items-end justify-center font-serif text-slate-400 italic">
                    Siti Rahmawati
                  </div>
                  <p className="border-t border-slate-700 pt-1 font-medium text-slate-200">Auditor Internal</p>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-500">
              Belum ada data laporan inventaris yang tersedia.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
