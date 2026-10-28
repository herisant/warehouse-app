import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Barcode,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  AlertTriangle,
  Printer,
  Edit2,
  Trash2,
  MoreVertical,
  CheckCircle2,
  X
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Product } from '../../types/warehouse';

interface ProductListProps {
  onOpenScan: () => void;
  onOpenLabelGenerator: (product: Product) => void;
  onOpenInbound: (product: Product) => void;
  onOpenOutbound: (product: Product) => void;
  onOpenTransfer: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  onOpenScan,
  onOpenLabelGenerator,
  onOpenInbound,
  onOpenOutbound,
  onOpenTransfer
}) => {
  const {
    products,
    racks,
    addProduct,
    updateProduct,
    deleteProduct,
    hasPermission
  } = useWarehouse();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'normal' | 'empty'>('all');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    name: '',
    category: 'Elektronik',
    unit: 'Unit',
    currentStock: 10,
    minStock: 15,
    maxStock: 100,
    buyPrice: 100000,
    sellPrice: 150000,
    rackLocationId: racks[0]?.id || '',
    supplier: '',
    batchNumber: 'B-2026-01'
  });

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplier.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    let matchesStock = true;
    if (stockStatusFilter === 'low') matchesStock = p.currentStock <= p.minStock && p.currentStock > 0;
    if (stockStatusFilter === 'empty') matchesStock = p.currentStock === 0;
    if (stockStatusFilter === 'normal') matchesStock = p.currentStock > p.minStock;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    const randNum = Math.floor(100000 + Math.random() * 900000);
    setFormData({
      sku: `SKU-NEW-${randNum.toString().slice(-3)}`,
      barcode: `899276${randNum}`,
      name: '',
      category: categories[0] || 'Elektronik',
      unit: 'Pcs',
      currentStock: 20,
      minStock: 10,
      maxStock: 100,
      buyPrice: 150000,
      sellPrice: 200000,
      rackLocationId: racks[0]?.id || '',
      supplier: 'PT Distribusi Unggul',
      batchNumber: `B-2026-${Math.floor(10 + Math.random() * 89)}`
    });
    setIsProductModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      barcode: product.barcode,
      name: product.name,
      category: product.category,
      unit: product.unit,
      currentStock: product.currentStock,
      minStock: product.minStock,
      maxStock: product.maxStock,
      buyPrice: product.buyPrice,
      sellPrice: product.sellPrice,
      rackLocationId: product.rackLocationId,
      supplier: product.supplier,
      batchNumber: product.batchNumber || ''
    });
    setIsProductModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sku || !formData.name || !formData.barcode) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setIsProductModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            Katalog Master Inventaris & Manajemen Stok
          </h2>
          <p className="text-xs text-slate-400">
            Daftar lengkap SKU produk, kode barcode, posisi rak gudang, dan ambang batas minimum
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenScan}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Barcode className="w-4 h-4 text-amber-400" />
            Pindai Barcode
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            Tambah SKU Baru
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan SKU, nama barang, kode barcode, atau supplier..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">Semua Kondisi Stok</option>
            <option value="low">Stok Menipis (Kritis)</option>
            <option value="normal">Stok Aman (Normal)</option>
            <option value="empty">Stok Habis (Kosong)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-800/80 text-slate-300 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Produk & SKU</th>
                <th className="px-4 py-3.5">Barcode</th>
                <th className="px-4 py-3.5">Kategori</th>
                <th className="px-4 py-3.5">Lokasi Rak</th>
                <th className="px-4 py-3.5 text-right">Stok Fisik</th>
                <th className="px-4 py-3.5 text-right">Ambang Min</th>
                <th className="px-4 py-3.5 text-right">Harga Beli</th>
                <th className="px-4 py-3.5 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    Tidak ada produk yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const rack = racks.find(r => r.id === p.rackLocationId);
                  const isLow = p.currentStock <= p.minStock;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      {/* Name & SKU */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white text-xs">{p.name}</div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {p.sku} {p.batchNumber ? `• ${p.batchNumber}` : ''}
                        </div>
                      </td>

                      {/* Barcode */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px] text-slate-300">
                          {p.barcode}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 text-slate-300">
                        {p.category}
                      </td>

                      {/* Rack */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {rack?.rackCode || 'Belum diatur'}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {rack?.shelfLevel || ''}
                        </div>
                      </td>

                      {/* Stock Quantity */}
                      <td className="px-4 py-3.5 text-right">
                        <div className={`font-mono font-bold text-sm ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {p.currentStock} <span className="text-[10px] font-normal text-slate-400">{p.unit}</span>
                        </div>
                        {isLow && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-semibold">
                            <AlertTriangle className="w-3 h-3" />
                            Stok Kritis
                          </span>
                        )}
                      </td>

                      {/* Min Stock */}
                      <td className="px-4 py-3.5 text-right font-mono text-slate-400">
                        {p.minStock} {p.unit}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3.5 text-right font-mono text-slate-300">
                        Rp {p.buyPrice.toLocaleString('id-ID')}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenInbound(p)}
                            title="Barang Masuk (Inbound)"
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition"
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenOutbound(p)}
                            title="Barang Keluar (Outbound)"
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenTransfer(p)}
                            title="Pindah Rak"
                            className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 transition"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenLabelGenerator(p)}
                            title="Cetak Label Barcode"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(p)}
                            title="Edit SKU"
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus SKU ${p.sku} (${p.name}) dari inventaris?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            title="Hapus SKU"
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingProduct ? 'Perbarui Data Produk (SKU)' : 'Daftarkan SKU Produk Baru'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">SKU Produk (Unik):</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    placeholder="ELC-MON-024"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kode Barcode / EAN-13:</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="899276100101"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Produk Lengkap:</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Monitor LED IPS 24 inci Full HD"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kategori:</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Elektronik"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Satuan Unit:</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Unit">Unit</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Box">Box</option>
                    <option value="Karton">Karton</option>
                    <option value="Pallet">Pallet</option>
                    <option value="Kg">Kg</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Stok Fisik Saat Ini:</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ambang Stok Minimum (Alert):</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Harga Beli Satuan (Rp):</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.buyPrice}
                    onChange={(e) => setFormData({ ...formData, buyPrice: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Lokasi Rak Simpan:</label>
                  <select
                    value={formData.rackLocationId}
                    onChange={(e) => setFormData({ ...formData, rackLocationId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {racks.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.rackCode} - {r.zone.split('-')[0].trim()} ({r.shelfLevel})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Supplier / Pemasok:</label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="PT Global Komputindo"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-400 transition"
                >
                  Simpan SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
