import React, { useState } from 'react';
import {
  Settings,
  Mail,
  MessageSquare,
  Clock,
  Layers,
  Database,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Building,
  Bell
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';
import { RackLocation } from '../../types/warehouse';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    racks,
    addRack,
    deleteRack,
    exportDatabaseJson,
    importDatabaseJson,
    resetToDemoData
  } = useWarehouse();

  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'automation' | 'racks' | 'backup'>('general');
  const [formSettings, setFormSettings] = useState(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Rack Form
  const [newRackZone, setNewRackZone] = useState('Zona A - Elektronik & Gadget');
  const [newRackCode, setNewRackCode] = useState('');
  const [newRackShelf, setNewRackShelf] = useState('Tingkat 1');
  const [newRackCapacity, setNewRackCapacity] = useState(500);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddRack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRackCode) return;
    addRack({
      zone: newRackZone,
      rackCode: newRackCode.toUpperCase(),
      shelfLevel: newRackShelf,
      maxCapacityUnits: Number(newRackCapacity) || 300
    });
    setNewRackCode('');
  };

  const handleDownloadBackup = () => {
    const json = exportDatabaseJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_gudangmaster_${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDatabaseJson(content);
        if (ok) {
          alert('Basis data berhasil dipulihkan dari file backup!');
        } else {
          alert('Format file JSON tidak valid.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-400" />
          Pengaturan Sistem Gudang & Notifikasi
        </h2>
        <p className="text-xs text-slate-400">
          Konfigurasi saluran pengiriman alert email/SMS, jadwal otomatisasi laporan, denah rak, dan identitas perusahaan
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition whitespace-nowrap border-b-2 ${
            activeTab === 'general'
              ? 'border-amber-500 text-amber-400 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Identitas & Informasi Gudang
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition whitespace-nowrap border-b-2 ${
            activeTab === 'notifications'
              ? 'border-amber-500 text-amber-400 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Notifikasi Stok Rendah (Email/SMS)
        </button>
        <button
          onClick={() => setActiveTab('automation')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition whitespace-nowrap border-b-2 ${
            activeTab === 'automation'
              ? 'border-amber-500 text-amber-400 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Jadwal Laporan Akhir Bulan
        </button>
        <button
          onClick={() => setActiveTab('racks')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition whitespace-nowrap border-b-2 ${
            activeTab === 'racks'
              ? 'border-amber-500 text-amber-400 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Kelola Denah & Kapasitas Rak
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition whitespace-nowrap border-b-2 ${
            activeTab === 'backup'
              ? 'border-amber-500 text-amber-400 bg-slate-800/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Backup & Restore Data
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Pengaturan berhasil disimpan dan langsung diterapkan ke seluruh sistem!
        </div>
      )}

      {/* TAB 1: GENERAL */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-amber-400" />
            Informasi Perusahaan & Fasilitas Pergudangan
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Gudang / Distribution Center:</label>
              <input
                type="text"
                value={formSettings.warehouseName}
                onChange={(e) => setFormSettings({ ...formSettings, warehouseName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Perusahaan:</label>
              <input
                type="text"
                value={formSettings.companyName}
                onChange={(e) => setFormSettings({ ...formSettings, companyName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Alamat Fasilitas Gudang:</label>
              <input
                type="text"
                value={formSettings.address}
                onChange={(e) => setFormSettings({ ...formSettings, address: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email PIC / Kepala Gudang:</label>
              <input
                type="email"
                value={formSettings.managerEmail}
                onChange={(e) => setFormSettings({ ...formSettings, managerEmail: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">No. Kontak Hotline Gudang:</label>
              <input
                type="text"
                value={formSettings.managerPhone}
                onChange={(e) => setFormSettings({ ...formSettings, managerPhone: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: NOTIFICATIONS (Email / SMS / WhatsApp) */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              Konfigurasi Peringatan Stok Menipis Real-Time
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tentukan saluran pengiriman otomatis saat level stok suatu SKU menyentuh batas minimum
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Email Channel */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white">Email Gateway</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formSettings.enableEmailAlerts}
                    onChange={(e) => setFormSettings({ ...formSettings, enableEmailAlerts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
              <p className="text-[11px] text-slate-400">
                Mengirimkan pesan email resmi dengan format HTML ke purchasing & inventory manager.
              </p>
            </div>

            {/* SMS Channel */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white">SMS Gateway</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formSettings.enableSmsAlerts}
                    onChange={(e) => setFormSettings({ ...formSettings, enableSmsAlerts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
              <p className="text-[11px] text-slate-400">
                Peringatan teks instan via SMS GSM untuk kepala shift dan supervisor lapangan.
              </p>
            </div>

            {/* WhatsApp Channel */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white">WhatsApp Webhook</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formSettings.enableWhatsAppAlerts}
                    onChange={(e) => setFormSettings({ ...formSettings, enableWhatsAppAlerts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
              <p className="text-[11px] text-slate-400">
                Kirim alert langsung ke grup WhatsApp operasional pergudangan & supplier.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Daftar Penerima Email Alert (Pisahkan dengan koma):
              </label>
              <input
                type="text"
                value={formSettings.alertEmailRecipients}
                onChange={(e) => setFormSettings({ ...formSettings, alertEmailRecipients: e.target.value })}
                placeholder="windaheris@gmail.com, purchasing@perusahaan.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Default: windaheris@gmail.com
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nomor Telepon / WhatsApp Penerima Alert (Pisahkan dengan koma):
              </label>
              <input
                type="text"
                value={formSettings.alertPhoneRecipients}
                onChange={(e) => setFormSettings({ ...formSettings, alertPhoneRecipients: e.target.value })}
                placeholder="+6281299887766, +6281311223344"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Save className="w-4 h-4" />
              Simpan Konfigurasi Notifikasi
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: AUTOMATION SCHEDULE */}
      {activeTab === 'automation' && (
        <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Jadwal Otomatisasi Pembuatan & Pengiriman Laporan Akhir Bulan
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Atur hari dan jam cron scheduler untuk pembukuan stok otomatis setiap pergantian bulan
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white">Aktifkan Otomatisasi Laporan Tutup Buku</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Sistem akan membekukan valuasi aset, menghitung mutasi 30 hari, dan menyusun PDF/CSV secara otomatis.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formSettings.autoGenerateMonthlyReport}
                onChange={(e) => setFormSettings({ ...formSettings, autoGenerateMonthlyReport: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Hari Eksekusi Tiap Bulan:
              </label>
              <select
                value={formSettings.reportDayOfMonth}
                onChange={(e) => setFormSettings({ ...formSettings, reportDayOfMonth: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value={28}>Tanggal 28 tiap bulan</option>
                <option value={30}>Tanggal 30 tiap bulan</option>
                <option value={31}>Hari terakhir tiap bulan (28/30/31)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Jam Eksekusi Otomatis (WIB):
              </label>
              <input
                type="time"
                value={formSettings.reportTime}
                onChange={(e) => setFormSettings({ ...formSettings, reportTime: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Daftar Email Penerima Laporan Bulanan:
              </label>
              <input
                type="text"
                value={formSettings.reportEmailRecipients}
                onChange={(e) => setFormSettings({ ...formSettings, reportEmailRecipients: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Save className="w-4 h-4" />
              Simpan Jadwal Otomatisasi
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: RACKS MANAGEMENT */}
      {activeTab === 'racks' && (
        <div className="space-y-6">
          {/* Add Rack Form */}
          <form onSubmit={handleAddRack} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              Tambah Titik Rak / Lokasi Baru
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Zona Gudang:</label>
                <select
                  value={newRackZone}
                  onChange={(e) => setNewRackZone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Zona A - Elektronik & Gadget">Zona A - Elektronik</option>
                  <option value="Zona B - FMCG & Perlengkapan Kantor">Zona B - FMCG</option>
                  <option value="Zona C - Suku Cadang & Mesin">Zona C - Suku Cadang</option>
                  <option value="Zona D - Bahan Baku & Kimia">Zona D - Kimia/Bahan Baku</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Kode Rak (Unik):</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: RAK-A03"
                  value={newRackCode}
                  onChange={(e) => setNewRackCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tingkat Lantai:</label>
                <input
                  type="text"
                  placeholder="Misal: Tingkat 3"
                  value={newRackShelf}
                  onChange={(e) => setNewRackShelf(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Kapasitas Maks Unit:</label>
                <input
                  type="number"
                  min="50"
                  max="10000"
                  value={newRackCapacity}
                  onChange={(e) => setNewRackCapacity(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Daftarkan Rak
              </button>
            </div>
          </form>

          {/* Existing Racks Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Daftar Rak Terdaftar ({racks.length} Lokasi)
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-800 text-slate-300 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Kode Rak</th>
                    <th className="px-4 py-3">Zona</th>
                    <th className="px-4 py-3">Tingkat</th>
                    <th className="px-4 py-3 text-right">Terisi</th>
                    <th className="px-4 py-3 text-right">Kapasitas Maks</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {racks.map(rack => (
                    <tr key={rack.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono font-bold text-amber-400">{rack.rackCode}</td>
                      <td className="px-4 py-3 text-slate-300">{rack.zone}</td>
                      <td className="px-4 py-3 text-slate-400">{rack.shelfLevel}</td>
                      <td className="px-4 py-3 text-right font-mono">{rack.currentUnits} unit</td>
                      <td className="px-4 py-3 text-right font-mono">{rack.maxCapacityUnits} unit</td>
                      <td className="px-4 py-3 text-center">
                        {racks.length > 1 && (
                          <button
                            onClick={() => deleteRack(rack.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 transition"
                            title="Hapus Rak"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BACKUP & RESTORE */}
      {activeTab === 'backup' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              Pencadangan, Pemulihan & Reset Basis Data
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simpan seluruh snapshot inventaris, transaksi, log notifikasi dan master SKU ke file JSON terenkripsi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                  <Download className="w-4 h-4 text-amber-400" />
                  Cadangkan Data (Export JSON)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Unduh seluruh database saat ini ke komputer lokal untuk arsip offline.
                </p>
              </div>
              <button
                onClick={handleDownloadBackup}
                className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh File Backup (.json)
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                  <Upload className="w-4 h-4 text-sky-400" />
                  Pulihkan Data (Import JSON)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Kembalikan kondisi inventaris dari file cadangan yang telah dibuat sebelumnya.
                </p>
              </div>
              <label className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer text-center">
                <Upload className="w-3.5 h-3.5" />
                Pilih File Cadangan
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5 mb-1">
                  <RefreshCw className="w-4 h-4 text-rose-400" />
                  Reset ke Data Percontohan
                </h4>
                <p className="text-[11px] text-slate-400">
                  Mereset seluruh SKU, transaksi, dan riwayat alert ke data sampel awal pabrik.
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin mereset seluruh data gudang ke data sampel awal?')) {
                    resetToDemoData();
                  }
                }}
                className="mt-4 w-full py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold transition border border-rose-500/40 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset ke Sample Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
