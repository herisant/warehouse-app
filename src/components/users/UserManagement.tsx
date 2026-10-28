import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Key,
  Check,
  X,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Clock,
  Sparkles,
  Lock,
  UserCheck
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';
import { User, UserRole } from '../../types/warehouse';

export const UserManagement: React.FC = () => {
  const {
    users,
    currentUser,
    setCurrentUser,
    addUser,
    updateUser,
    deleteUser,
    hasPermission
  } = useWarehouse();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'warehouse_staff' as UserRole,
    status: 'active' as 'active' | 'inactive',
    avatar: ''
  });

  const canManage = hasPermission('manageUsers');

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'warehouse_staff',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      avatar: user.avatar
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (editingUser) {
      updateUser(editingUser.id, formData);
    } else {
      addUser({
        ...formData,
        avatar: formData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
      });
    }
    setIsAddModalOpen(false);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return { label: 'Super Admin', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'warehouse_manager':
        return { label: 'Warehouse Manager', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'warehouse_staff':
        return { label: 'Staff Gudang / Operator', bg: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
      case 'auditor':
        return { label: 'Auditor Internal', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    }
  };

  const permissionsMatrix = [
    { module: 'Lihat Dashboard & Statistik', staff: true, manager: true, auditor: true, admin: true },
    { module: 'Pindai Barcode & Cari SKU', staff: true, manager: true, auditor: true, admin: true },
    { module: 'Barang Masuk (Inbound)', staff: true, manager: true, auditor: false, admin: true },
    { module: 'Barang Keluar (Outbound)', staff: true, manager: true, auditor: false, admin: true },
    { module: 'Mutasi / Pindah Rak', staff: true, manager: true, auditor: false, admin: true },
    { module: 'Stock Opname / Audit Fisik', staff: false, manager: true, auditor: true, admin: true },
    { module: 'Lihat Laporan Inventaris Bulanan', staff: true, manager: true, auditor: true, admin: true },
    { module: 'Export & Kirim Laporan ke Email', staff: false, manager: true, auditor: true, admin: true },
    { module: 'Manajemen Pengguna & Roles', staff: false, manager: false, auditor: false, admin: true },
    { module: 'Pengaturan Sistem & Gateway Notifikasi', staff: false, manager: false, auditor: false, admin: true }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            Manajemen Pengguna, Peran & Hak Akses
          </h2>
          <p className="text-xs text-slate-400">
            Kelola akun staf gudang, manager, auditor, dan pembagian hak otorisasi (RBAC)
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Pengguna Baru
        </button>
      </div>

      {/* User Switcher Quick Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400">Pengguna Login Saat Ini:</span>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              {currentUser.name}
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRoleBadge(currentUser.role).bg}`}>
                {getRoleBadge(currentUser.role).label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400">Ganti Profil Cepat untuk Uji Hak Akses:</span>
          {users.map(u => (
            <button
              key={u.id}
              onClick={() => setCurrentUser(u)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                currentUser.id === u.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {u.name.split(' ')[0]} ({u.role.replace('warehouse_', '')})
            </button>
          ))}
        </div>
      </div>

      {/* Users List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {users.map(u => {
          const badge = getRoleBadge(u.role);
          const isMe = u.id === currentUser.id;
          return (
            <div
              key={u.id}
              className={`p-5 rounded-2xl bg-slate-900 border transition flex flex-col justify-between ${
                isMe ? 'border-amber-500/70 shadow-lg shadow-amber-500/10' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-700"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(u)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {users.length > 1 && (
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {u.name}
                    {isMe && (
                      <span className="text-[10px] font-normal text-amber-400 font-mono">(Anda)</span>
                    )}
                  </h3>
                  <div className="mt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{u.phone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Status: <strong className="text-emerald-400 font-semibold capitalize">{u.status}</strong></span>
                <span>{u.lastActive}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              Matriks Otorisasi Hak Akses (Role-Based Access Control)
            </h3>
            <p className="text-xs text-slate-400">
              Hak otorisasi sistem berdasarkan tingkatan peran jabatan pengguna di gudang
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-800/80 text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Modul & Tindakan Fitur</th>
                <th className="px-4 py-3 text-center">Staff Gudang</th>
                <th className="px-4 py-3 text-center">Warehouse Manager</th>
                <th className="px-4 py-3 text-center">Auditor</th>
                <th className="px-4 py-3 text-center text-amber-400">Super Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {permissionsMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-medium text-white">{item.module}</td>
                  <td className="px-4 py-3 text-center">
                    {item.staff ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.manager ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.auditor ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Check className="w-4 h-4 text-amber-400 mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Rian Pratama"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email:</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rian@logistik.co.id"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">No. WhatsApp / HP:</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+628123456789"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Peran Jabatan (Role):</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="warehouse_staff">Staff Gudang / Operator</option>
                  <option value="warehouse_manager">Warehouse Manager</option>
                  <option value="auditor">Auditor Internal</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status Akun:</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-400 transition"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
