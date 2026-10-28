import React, { useState } from 'react';
import {
  Scan,
  Bell,
  Calendar,
  Layers,
  ChevronDown,
  Shield,
  User,
  LogOut,
  Building2,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';

interface NavbarProps {
  onOpenScan: () => void;
  onOpenNotifications: () => void;
  onOpenLabelGenerator: () => void;
  onNavigateToReports: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenScan,
  onOpenNotifications,
  onOpenLabelGenerator,
  onNavigateToReports
}) => {
  const {
    settings,
    currentUser,
    users,
    setCurrentUser,
    lowStockAlerts,
    reports
  } = useWarehouse();

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const latestReport = reports[0];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'warehouse_manager':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'warehouse_staff':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'auditor':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 no-print">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand & Facility indicator */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Building2 className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-wide text-white">GudangMaster</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                WMS Pro
              </span>
            </div>
            <div className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs">
              {settings.warehouseName}
            </div>
          </div>
        </div>

        {/* Center/Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Scan Button */}
          <button
            onClick={onOpenScan}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <Scan className="w-4 h-4 animate-pulse" />
            <span className="hidden sm:inline">Pindai Barcode</span>
          </button>

          {/* Quick Print Tag Label */}
          <button
            onClick={onOpenLabelGenerator}
            title="Generator Label Barcode Cetak"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span className="hidden md:inline">Cetak Label</span>
          </button>

          {/* Automated Monthly Report Quick Indicator */}
          <button
            onClick={onNavigateToReports}
            title="Laporan Inventaris Bulanan Otomatis"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span className="hidden lg:inline">
              Laporan Akhir Bulan
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 hidden sm:inline-block"></span>
          </button>

          {/* Notification Alert Bell */}
          <button
            onClick={onOpenNotifications}
            title="Peringatan Stok Rendah"
            className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            {lowStockAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold flex items-center justify-center animate-bounce shadow-md shadow-rose-500/40">
                {lowStockAlerts.length}
              </span>
            )}
          </button>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-600"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white leading-tight">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-amber-400 uppercase font-semibold">
                  {currentUser.role.replace('warehouse_', '')}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in">
                <div className="pb-3 border-b border-slate-800 px-1">
                  <p className="text-xs font-bold text-white">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                  <div className="mt-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRoleBadge(currentUser.role)}`}>
                      {currentUser.role.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400 px-1 mb-1">
                    Ganti Akun (Uji Role):
                  </p>
                  <div className="space-y-1">
                    {users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          setIsUserDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs transition flex items-center justify-between ${
                          u.id === currentUser.id
                            ? 'bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="truncate">
                          <span className="block truncate">{u.name}</span>
                          <span className="text-[10px] text-slate-500 block">
                            {u.role.replace('_', ' ')}
                          </span>
                        </div>
                        {u.id === currentUser.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
