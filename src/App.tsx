import React, { useState } from 'react';
import { WarehouseProvider, useWarehouse } from './context/WarehouseContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { StatCards } from './components/dashboard/StatCards';
import { WarehouseVisualMap } from './components/dashboard/WarehouseVisualMap';
import { StockTrendsChart } from './components/dashboard/StockTrendsChart';
import { LowStockAlertBanner } from './components/dashboard/LowStockAlertBanner';
import { RecentActivities } from './components/dashboard/RecentActivities';
import { ProductList } from './components/inventory/ProductList';
import { MonthlyReportView } from './components/reports/MonthlyReportView';
import { UserManagement } from './components/users/UserManagement';
import { SettingsView } from './components/settings/SettingsView';
import { TransactionsView } from './components/operations/TransactionsView';
import { BarcodeScannerModal } from './components/scanner/BarcodeScannerModal';
import { BarcodeLabelGeneratorModal } from './components/scanner/BarcodeLabelGeneratorModal';
import { StockMovementModal } from './components/inventory/StockMovementModal';
import { RackTransferModal } from './components/inventory/RackTransferModal';
import { StockOpnameModal } from './components/inventory/StockOpnameModal';
import { NotificationCenterModal } from './components/notifications/NotificationCenterModal';
import { Product, RackLocation, LowStockAlert } from './types/warehouse';

function MainApp() {
  const {
    products,
    racks,
    transactions,
    lowStockAlerts,
    hasPermission
  } = useWarehouse();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [selectedProductForLabel, setSelectedProductForLabel] = useState<Product | null>(null);

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'INBOUND' | 'OUTBOUND'>('INBOUND');
  const [selectedProductForMovement, setSelectedProductForMovement] = useState<Product | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedProductForTransfer, setSelectedProductForTransfer] = useState<Product | null>(null);
  const [targetRackForTransfer, setTargetRackForTransfer] = useState<RackLocation | null>(null);

  const [isOpnameModalOpen, setIsOpnameModalOpen] = useState(false);
  const [selectedProductForOpname, setSelectedProductForOpname] = useState<Product | null>(null);

  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // Handlers
  const handleOpenInbound = (product?: Product) => {
    setMovementType('INBOUND');
    setSelectedProductForMovement(product || null);
    setIsMovementModalOpen(true);
  };

  const handleOpenOutbound = (product?: Product) => {
    setMovementType('OUTBOUND');
    setSelectedProductForMovement(product || null);
    setIsMovementModalOpen(true);
  };

  const handleOpenTransfer = (product?: Product, rack?: RackLocation) => {
    setSelectedProductForTransfer(product || null);
    setTargetRackForTransfer(rack || null);
    setIsTransferModalOpen(true);
  };

  const handleOpenLabel = (product?: Product) => {
    setSelectedProductForLabel(product || null);
    setIsLabelModalOpen(true);
  };

  const handleOpenOpname = (product?: Product) => {
    setSelectedProductForOpname(product || null);
    setIsOpnameModalOpen(true);
  };

  const handleScannerSelectAction = (product: Product, action: 'inbound' | 'outbound' | 'transfer' | 'label') => {
    if (action === 'inbound') handleOpenInbound(product);
    if (action === 'outbound') handleOpenOutbound(product);
    if (action === 'transfer') handleOpenTransfer(product);
    if (action === 'label') handleOpenLabel(product);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        onOpenScan={() => setIsScannerOpen(true)}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
        onOpenLabelGenerator={() => handleOpenLabel()}
        onNavigateToReports={() => setActiveTab('reports')}
      />

      {/* Main Container with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenScanModal={() => setIsScannerOpen(true)}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Critical Low Stock Alert Banner */}
              <LowStockAlertBanner
                alerts={lowStockAlerts}
                onOpenAlertModal={() => setIsNotificationCenterOpen(true)}
                onOpenRestockModal={(alert) => {
                  const p = products.find(prod => prod.id === alert.productId);
                  handleOpenInbound(p);
                }}
              />

              {/* KPI Stat Cards */}
              <StatCards
                products={products}
                transactions={transactions}
                lowStockAlerts={lowStockAlerts}
                onOpenLowStock={() => setIsNotificationCenterOpen(true)}
                onOpenScan={() => setIsScannerOpen(true)}
              />

              {/* Interactive Warehouse Visual Rack Map */}
              <WarehouseVisualMap
                racks={racks}
                products={products}
                onSelectProduct={(p) => handleOpenInbound(p)}
                onSelectRackForTransfer={(rack) => handleOpenTransfer(undefined, rack)}
              />

              {/* Trends and Recent Activity in 2 columns */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                  <StockTrendsChart
                    transactions={transactions}
                    products={products}
                  />
                </div>
                <div className="lg:col-span-5">
                  <RecentActivities
                    transactions={transactions}
                    onViewAll={() => setActiveTab('inbound')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: INVENTORY CATALOG */}
          {activeTab === 'inventory' && (
            <div className="animate-in fade-in">
              <ProductList
                onOpenScan={() => setIsScannerOpen(true)}
                onOpenLabelGenerator={handleOpenLabel}
                onOpenInbound={handleOpenInbound}
                onOpenOutbound={handleOpenOutbound}
                onOpenTransfer={(p) => handleOpenTransfer(p)}
              />
            </div>
          )}

          {/* TAB: INBOUND (BARANG MASUK) */}
          {activeTab === 'inbound' && (
            <div className="animate-in fade-in">
              <TransactionsView
                initialTypeFilter="INBOUND"
                onOpenInbound={() => handleOpenInbound()}
                onOpenOutbound={() => handleOpenOutbound()}
                onOpenTransfer={() => handleOpenTransfer()}
                onOpenOpname={() => handleOpenOpname()}
              />
            </div>
          )}

          {/* TAB: OUTBOUND (BARANG KELUAR) */}
          {activeTab === 'outbound' && (
            <div className="animate-in fade-in">
              <TransactionsView
                initialTypeFilter="OUTBOUND"
                onOpenInbound={() => handleOpenInbound()}
                onOpenOutbound={() => handleOpenOutbound()}
                onOpenTransfer={() => handleOpenTransfer()}
                onOpenOpname={() => handleOpenOpname()}
              />
            </div>
          )}

          {/* TAB: TRANSFER RAK */}
          {activeTab === 'transfer' && (
            <div className="animate-in fade-in">
              <TransactionsView
                initialTypeFilter="TRANSFER"
                onOpenInbound={() => handleOpenInbound()}
                onOpenOutbound={() => handleOpenOutbound()}
                onOpenTransfer={() => handleOpenTransfer()}
                onOpenOpname={() => handleOpenOpname()}
              />
            </div>
          )}

          {/* TAB: STOCK OPNAME */}
          {activeTab === 'opname' && (
            <div className="animate-in fade-in">
              <TransactionsView
                initialTypeFilter="OPNAME"
                onOpenInbound={() => handleOpenInbound()}
                onOpenOutbound={() => handleOpenOutbound()}
                onOpenTransfer={() => handleOpenTransfer()}
                onOpenOpname={() => handleOpenOpname()}
              />
            </div>
          )}

          {/* TAB: AUTOMATED MONTHLY REPORTS */}
          {activeTab === 'reports' && (
            <div className="animate-in fade-in">
              <MonthlyReportView />
            </div>
          )}

          {/* TAB: USER MANAGEMENT & ROLES */}
          {activeTab === 'users' && (
            <div className="animate-in fade-in">
              <UserManagement />
            </div>
          )}

          {/* TAB: SETTINGS & NOTIFICATIONS */}
          {activeTab === 'settings' && (
            <div className="animate-in fade-in">
              <SettingsView />
            </div>
          )}
        </main>
      </div>

      {/* MODALS */}
      {/* 1. Barcode Scanner Camera Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectProductForAction={handleScannerSelectAction}
      />

      {/* 2. Barcode & QR Label Printing Modal */}
      <BarcodeLabelGeneratorModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        initialProduct={selectedProductForLabel}
        products={products}
        racks={racks}
      />

      {/* 3. Inbound / Outbound Stock Movement Modal */}
      <StockMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        type={movementType}
        initialProduct={selectedProductForMovement}
        onOpenBarcodeScanner={() => setIsScannerOpen(true)}
      />

      {/* 4. Rack Transfer Modal */}
      <RackTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        initialProduct={selectedProductForTransfer}
        targetRack={targetRackForTransfer}
      />

      {/* 5. Stock Opname Modal */}
      <StockOpnameModal
        isOpen={isOpnameModalOpen}
        onClose={() => setIsOpnameModalOpen(false)}
        initialProduct={selectedProductForOpname}
      />

      {/* 6. Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        onSelectRestock={(productId) => {
          const p = products.find(prod => prod.id === productId);
          handleOpenInbound(p);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <WarehouseProvider>
      <MainApp />
    </WarehouseProvider>
  );
}
