import React from 'react';
import {
  LayoutDashboard,
  Package,
  Scan,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  CheckSquare,
  FileText,
  Users,
  Settings,
  AlertTriangle,
  Building2,
  Calendar
} from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';

export type NavTab =
  | 'dashboard'
  | 'inventory'
  | 'scanner'
  | 'inbound'
  | 'outbound'
  | 'transfer'
  | 'opname'
  | 'reports'
  | 'users'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenScanModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenScanModal
}) => {
  const { lowStockAlerts, currentUser, hasPermission } = useWarehouse();

  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
    action?: () => void;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard & Denah Rak',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'inventory',
      label: 'Katalog Stok & SKU',
      icon: <Package className="w-4 h-4" />
    },
    {
      id: 'scanner',
      label: 'Pemindai Barcode',
      icon: <Scan className="w-4 h-4 text-amber-400" />,
      badge: 'Real-Time',
      badgeColor: 'bg-amber-500/20 text-amber-400',
      action: onOpenScanModal
    },
    {
      id: 'inbound',
      label: 'Barang Masuk (Inbound)',
      icon: <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
    },
    {
      id: 'outbound',
      label: 'Barang Keluar (Outbound)',
      icon: <ArrowUpRight className="w-4 h-4 text-amber-400" />
    },
    {
      id: 'transfer',
      label: 'Mutasi / Pindah Rak',
      icon: <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
    },
    {
      id: 'opname',
      label: 'Stock Opname (Audit)',
      icon: <CheckSquare className="w-4 h-4 text-sky-400" />
    },
    {
      id: 'reports',
      label: 'Laporan Akhir Bulan',
      icon: <FileText className="w-4 h-4 text-indigo-400" />,
      badge: 'Otomatis',
      badgeColor: 'bg-indigo-500/20 text-indigo-300'
    },
    {
      id: 'users',
      label: 'Manajemen User & Roles',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 'settings',
      label: 'Pengaturan & Notifikasi',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 no-print">
      {/* Navigation items */}
      <nav className="p-3 space-y-1 overflow-y-auto flex-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Modul Operasional Gudang
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className={isActive ? 'text-slate-950' : ''}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-slate-950 text-amber-400' : item.badgeColor || 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Low stock critical widget in sidebar footer */}
      {lowStockAlerts.length > 0 && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>{lowStockAlerts.length} SKU Kritis</span>
            </div>
            <p className="text-[11px] text-rose-300/80 mt-1">
              Level stok di bawah batas ambang minimum.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
