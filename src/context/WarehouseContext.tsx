import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Product,
  RackLocation,
  User,
  StockTransaction,
  MonthlyInventoryReport,
  NotificationLog,
  WarehouseSettings,
  AuditLog,
  LowStockAlert,
  UserRole
} from '../types/warehouse';
import {
  INITIAL_PRODUCTS,
  INITIAL_RACKS,
  INITIAL_USERS,
  INITIAL_TRANSACTIONS,
  INITIAL_MONTHLY_REPORTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS
} from '../data/initialData';
import { soundEffects } from '../utils/audio';

interface WarehouseContextType {
  products: Product[];
  racks: RackLocation[];
  transactions: StockTransaction[];
  users: User[];
  currentUser: User;
  reports: MonthlyInventoryReport[];
  notifications: NotificationLog[];
  settings: WarehouseSettings;
  auditLogs: AuditLog[];
  lowStockAlerts: LowStockAlert[];
  
  // Role & Permissions check
  hasPermission: (action: 'manageProducts' | 'inbound' | 'outbound' | 'transfer' | 'opname' | 'viewReports' | 'exportReports' | 'manageUsers' | 'changeSettings') => boolean;
  setCurrentUser: (user: User) => void;
  
  // Stock operations
  inboundStock: (params: { productId: string; quantity: number; refNumber: string; toRackId: string; notes?: string }) => { success: boolean; message: string };
  outboundStock: (params: { productId: string; quantity: number; refNumber: string; notes?: string }) => { success: boolean; message: string };
  transferRack: (params: { productId: string; quantity: number; fromRackId: string; toRackId: string; notes?: string }) => { success: boolean; message: string };
  stockOpname: (params: { productId: string; physicalCount: number; notes: string }) => { success: boolean; message: string };
  
  // Product CRUD
  addProduct: (product: Omit<Product, 'id' | 'lastUpdated'>) => { success: boolean; message: string; product?: Product };
  updateProduct: (id: string, updates: Partial<Product>) => { success: boolean; message: string };
  deleteProduct: (id: string) => { success: boolean; message: string };
  findProductByBarcodeOrSku: (query: string) => Product | undefined;
  
  // Automated report & alerts
  generateMonthlyReport: (monthName?: string, monthKey?: string) => MonthlyInventoryReport;
  sendLowStockAlert: (productId: string, channels?: ('email' | 'sms' | 'whatsapp')[]) => { success: boolean; message: string };
  sendAllLowStockAlerts: () => number;
  
  // Settings & Racks
  updateSettings: (newSettings: Partial<WarehouseSettings>) => void;
  addRack: (rack: Omit<RackLocation, 'id' | 'currentUnits'>) => void;
  updateRack: (id: string, updates: Partial<RackLocation>) => void;
  deleteRack: (id: string) => void;
  
  // User Management
  addUser: (user: Omit<User, 'id' | 'lastActive'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Reset & import
  resetToDemoData: () => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (jsonStr: string) => boolean;
}

const STORAGE_KEY = 'gudangmaster_wms_state_v1';

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try loading from localStorage or use initial data
  const loadInitial = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          products: parsed.products || INITIAL_PRODUCTS,
          racks: parsed.racks || INITIAL_RACKS,
          transactions: parsed.transactions || INITIAL_TRANSACTIONS,
          users: parsed.users || INITIAL_USERS,
          reports: parsed.reports || INITIAL_MONTHLY_REPORTS,
          notifications: parsed.notifications || INITIAL_NOTIFICATIONS,
          settings: parsed.settings || INITIAL_SETTINGS,
          auditLogs: parsed.auditLogs || []
        };
      }
    } catch {
      // Fallback to initial
    }
    return {
      products: INITIAL_PRODUCTS,
      racks: INITIAL_RACKS,
      transactions: INITIAL_TRANSACTIONS,
      users: INITIAL_USERS,
      reports: INITIAL_MONTHLY_REPORTS,
      notifications: INITIAL_NOTIFICATIONS,
      settings: INITIAL_SETTINGS,
      auditLogs: []
    };
  };

  const initial = loadInitial();

  const [products, setProducts] = useState<Product[]>(initial.products);
  const [racks, setRacks] = useState<RackLocation[]>(initial.racks);
  const [transactions, setTransactions] = useState<StockTransaction[]>(initial.transactions);
  const [users, setUsers] = useState<User[]>(initial.users);
  const [currentUser, setCurrentUserState] = useState<User>(initial.users[0] || INITIAL_USERS[0]);
  const [reports, setReports] = useState<MonthlyInventoryReport[]>(initial.reports);
  const [notifications, setNotifications] = useState<NotificationLog[]>(initial.notifications);
  const [settings, setSettings] = useState<WarehouseSettings>(initial.settings);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initial.auditLogs);

  // Sync to localStorage
  useEffect(() => {
    try {
      const stateToSave = {
        products,
        racks,
        transactions,
        users,
        reports,
        notifications,
        settings,
        auditLogs
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      // Storage quota or disabled
    }
  }, [products, racks, transactions, users, reports, notifications, settings, auditLogs]);

  // Recalculate rack occupancy
  useEffect(() => {
    setRacks(prevRacks => {
      return prevRacks.map(rack => {
        const totalUnitsInRack = products
          .filter(p => p.rackLocationId === rack.id)
          .reduce((sum, p) => sum + p.currentStock, 0);
        return {
          ...rack,
          currentUnits: totalUnitsInRack
        };
      });
    });
  }, [products]);

  // Compute low stock alerts
  const lowStockAlerts = useMemo<LowStockAlert[]>(() => {
    return products
      .filter(p => p.currentStock <= p.minStock)
      .map(p => {
        const rack = racks.find(r => r.id === p.rackLocationId);
        const deficit = p.minStock - p.currentStock;
        return {
          id: `alert-${p.id}`,
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          currentStock: p.currentStock,
          minStock: p.minStock,
          deficit,
          severity: p.currentStock === 0 || p.currentStock < p.minStock / 2 ? 'critical' : 'warning',
          rackCode: rack?.rackCode || 'Belum diatur',
          status: 'pending'
        };
      });
  }, [products, racks]);

  // Helper: Add audit log
  const logAudit = useCallback((action: string, details: string, category: 'inventory' | 'auth' | 'settings' | 'report') => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      details,
      category
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 99)]);
  }, [currentUser]);

  // Permission checker
  const hasPermission = useCallback((action: 'manageProducts' | 'inbound' | 'outbound' | 'transfer' | 'opname' | 'viewReports' | 'exportReports' | 'manageUsers' | 'changeSettings'): boolean => {
    const role: UserRole = currentUser.role;
    if (role === 'super_admin') return true;

    switch (action) {
      case 'manageProducts':
        return role === 'warehouse_manager';
      case 'inbound':
      case 'outbound':
      case 'transfer':
        return role === 'warehouse_manager' || role === 'warehouse_staff';
      case 'opname':
        return role === 'warehouse_manager' || role === 'auditor';
      case 'viewReports':
        return true; // All can view
      case 'exportReports':
        return role === 'warehouse_manager' || role === 'auditor';
      case 'manageUsers':
      case 'changeSettings':
        return false; // Only super_admin
      default:
        return false;
    }
  }, [currentUser.role]);

  const setCurrentUser = useCallback((user: User) => {
    setCurrentUserState(user);
    logAudit('Ganti Pengguna Aktif', `Beralih ke akun ${user.name} (${user.role})`, 'auth');
  }, [logAudit]);

  // Search product by barcode or SKU
  const findProductByBarcodeOrSku = useCallback((query: string): Product | undefined => {
    if (!query) return undefined;
    const clean = query.trim().toLowerCase();
    return products.find(p => p.barcode.toLowerCase() === clean || p.sku.toLowerCase() === clean);
  }, [products]);

  // Inbound stock
  const inboundStock = useCallback((params: { productId: string; quantity: number; refNumber: string; toRackId: string; notes?: string }) => {
    const product = products.find(p => p.id === params.productId);
    if (!product) return { success: false, message: 'Produk tidak ditemukan' };
    if (params.quantity <= 0) return { success: false, message: 'Jumlah penerimaan harus lebih dari 0' };

    const previousStock = product.currentStock;
    const resultingStock = previousStock + params.quantity;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Update product
    setProducts(prev => prev.map(p => {
      if (p.id === product.id) {
        return {
          ...p,
          currentStock: resultingStock,
          rackLocationId: params.toRackId || p.rackLocationId,
          lastUpdated: timestamp
        };
      }
      return p;
    }));

    // Add transaction
    const newTrx: StockTransaction = {
      id: `trx-${Date.now()}`,
      type: 'INBOUND',
      referenceNumber: params.refNumber || `PO-${Date.now().toString().slice(-6)}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: params.quantity,
      previousStock,
      resultingStock,
      toRackId: params.toRackId,
      notes: params.notes || 'Penerimaan barang masuk',
      performedByUserId: currentUser.id,
      performedByName: currentUser.name,
      timestamp
    };

    setTransactions(prev => [newTrx, ...prev]);
    logAudit('Barang Masuk (Inbound)', `${params.quantity} ${product.unit} ${product.name} (Ref: ${newTrx.referenceNumber})`, 'inventory');
    soundEffects.playScanSuccess();

    return { success: true, message: `Berhasil menerima ${params.quantity} ${product.unit} ${product.name}` };
  }, [products, currentUser, logAudit]);

  // Outbound stock
  const outboundStock = useCallback((params: { productId: string; quantity: number; refNumber: string; notes?: string }) => {
    const product = products.find(p => p.id === params.productId);
    if (!product) return { success: false, message: 'Produk tidak ditemukan' };
    if (params.quantity <= 0) return { success: false, message: 'Jumlah pengeluaran harus lebih dari 0' };
    if (product.currentStock < params.quantity) {
      soundEffects.playErrorBuzz();
      return { success: false, message: `Stok tidak mencukupi! Tersedia ${product.currentStock} ${product.unit}, diminta ${params.quantity}` };
    }

    const previousStock = product.currentStock;
    const resultingStock = previousStock - params.quantity;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setProducts(prev => prev.map(p => {
      if (p.id === product.id) {
        return {
          ...p,
          currentStock: resultingStock,
          lastUpdated: timestamp
        };
      }
      return p;
    }));

    const newTrx: StockTransaction = {
      id: `trx-${Date.now()}`,
      type: 'OUTBOUND',
      referenceNumber: params.refNumber || `DO-${Date.now().toString().slice(-6)}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: params.quantity,
      previousStock,
      resultingStock,
      fromRackId: product.rackLocationId,
      notes: params.notes || 'Pengeluaran barang',
      performedByUserId: currentUser.id,
      performedByName: currentUser.name,
      timestamp
    };

    setTransactions(prev => [newTrx, ...prev]);
    logAudit('Barang Keluar (Outbound)', `${params.quantity} ${product.unit} ${product.name} (Ref: ${newTrx.referenceNumber})`, 'inventory');
    soundEffects.playScanSuccess();

    // Check if new stock breaches minStock threshold -> trigger automated alert
    if (resultingStock <= product.minStock) {
      setTimeout(() => {
        sendLowStockAlertInternal(product.id, resultingStock, product.minStock);
      }, 500);
    }

    return { success: true, message: `Berhasil mengeluarkan ${params.quantity} ${product.unit} ${product.name}` };
  }, [products, currentUser, logAudit]);

  // Transfer rack
  const transferRack = useCallback((params: { productId: string; quantity: number; fromRackId: string; toRackId: string; notes?: string }) => {
    const product = products.find(p => p.id === params.productId);
    if (!product) return { success: false, message: 'Produk tidak ditemukan' };
    if (params.fromRackId === params.toRackId) {
      return { success: false, message: 'Rak asal dan tujuan tidak boleh sama' };
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setProducts(prev => prev.map(p => {
      if (p.id === product.id) {
        return {
          ...p,
          rackLocationId: params.toRackId,
          lastUpdated: timestamp
        };
      }
      return p;
    }));

    const fromRack = racks.find(r => r.id === params.fromRackId)?.rackCode || 'Rak Asal';
    const toRack = racks.find(r => r.id === params.toRackId)?.rackCode || 'Rak Tujuan';

    const newTrx: StockTransaction = {
      id: `trx-${Date.now()}`,
      type: 'TRANSFER',
      referenceNumber: `MUT-${Date.now().toString().slice(-6)}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: params.quantity || product.currentStock,
      previousStock: product.currentStock,
      resultingStock: product.currentStock,
      fromRackId: params.fromRackId,
      toRackId: params.toRackId,
      notes: params.notes || `Pindah dari ${fromRack} ke ${toRack}`,
      performedByUserId: currentUser.id,
      performedByName: currentUser.name,
      timestamp
    };

    setTransactions(prev => [newTrx, ...prev]);
    logAudit('Mutasi Rak', `${product.name} dipindahkan dari ${fromRack} ke ${toRack}`, 'inventory');
    soundEffects.playScanSuccess();

    return { success: true, message: `Berhasil memindahkan lokasi ${product.name} ke ${toRack}` };
  }, [products, racks, currentUser, logAudit]);

  // Stock Opname
  const stockOpname = useCallback((params: { productId: string; physicalCount: number; notes: string }) => {
    const product = products.find(p => p.id === params.productId);
    if (!product) return { success: false, message: 'Produk tidak ditemukan' };

    const previousStock = product.currentStock;
    const diff = params.physicalCount - previousStock;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setProducts(prev => prev.map(p => {
      if (p.id === product.id) {
        return {
          ...p,
          currentStock: params.physicalCount,
          lastUpdated: timestamp
        };
      }
      return p;
    }));

    const newTrx: StockTransaction = {
      id: `trx-${Date.now()}`,
      type: 'OPNAME',
      referenceNumber: `SO-${Date.now().toString().slice(-6)}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: Math.abs(diff),
      previousStock,
      resultingStock: params.physicalCount,
      notes: `Stock Opname: Fisik ${params.physicalCount} vs Sistem ${previousStock} (Selisih: ${diff > 0 ? '+' : ''}${diff}). Catatan: ${params.notes}`,
      performedByUserId: currentUser.id,
      performedByName: currentUser.name,
      timestamp
    };

    setTransactions(prev => [newTrx, ...prev]);
    logAudit('Stock Opname', `Rekonsiliasi ${product.name}: ${previousStock} -> ${params.physicalCount} (${diff >= 0 ? '+' : ''}${diff})`, 'inventory');
    soundEffects.playScanSuccess();

    return { success: true, message: `Hasil stock opname disimpan. Stok diperbarui ke ${params.physicalCount} ${product.unit}` };
  }, [products, currentUser, logAudit]);

  // Add Product
  const addProduct = useCallback((newProdData: Omit<Product, 'id' | 'lastUpdated'>) => {
    // Check duplicate SKU or barcode
    const dupSku = products.some(p => p.sku.toLowerCase() === newProdData.sku.toLowerCase());
    if (dupSku) return { success: false, message: `SKU "${newProdData.sku}" sudah terdaftar` };

    const dupBarcode = products.some(p => p.barcode === newProdData.barcode);
    if (dupBarcode) return { success: false, message: `Barcode "${newProdData.barcode}" sudah digunakan produk lain` };

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
      lastUpdated: timestamp
    };

    setProducts(prev => [newProduct, ...prev]);
    logAudit('Tambah Produk Baru', `Menambahkan SKU: ${newProduct.sku} (${newProduct.name})`, 'inventory');

    return { success: true, message: `Produk ${newProduct.name} berhasil ditambahkan!`, product: newProduct };
  }, [products, logAudit]);

  // Update Product
  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ...updates,
          lastUpdated: timestamp
        };
      }
      return p;
    }));
    logAudit('Perbarui Produk', `Mengubah atribut produk ID: ${id}`, 'inventory');
    return { success: true, message: 'Data produk berhasil diperbarui' };
  }, [logAudit]);

  // Delete Product
  const deleteProduct = useCallback((id: string) => {
    const target = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    logAudit('Hapus Produk', `Menghapus produk ${target?.name || id}`, 'inventory');
    return { success: true, message: 'Produk berhasil dihapus' };
  }, [products, logAudit]);

  // Helper internal: Send Low Stock Alert
  const sendLowStockAlertInternal = useCallback((productId: string, current: number, min: number, channels: ('email' | 'sms' | 'whatsapp')[] = ['email', 'sms']) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const rack = racks.find(r => r.id === product.rackLocationId)?.rackCode || 'Lokasi Rak';
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newNotifs: NotificationLog[] = [];

    if (settings.enableEmailAlerts && channels.includes('email')) {
      newNotifs.push({
        id: `notif-${Date.now()}-mail`,
        timestamp,
        type: 'low_stock',
        title: `[GudangMaster] Peringatan Stok Menipis: ${product.name}`,
        message: `PERINGATAN STOK RENDAH! SKU: ${product.sku} di ${rack} tersisa ${current} ${product.unit} (Di bawah batas minimum ${min} ${product.unit}). Segera lakukan Restock / Purchase Order ke supplier ${product.supplier}.`,
        recipient: settings.alertEmailRecipients.split(',')[0].trim() || 'windaheris@gmail.com',
        channel: 'email',
        status: 'delivered'
      });
    }

    if (settings.enableSmsAlerts && channels.includes('sms')) {
      newNotifs.push({
        id: `notif-${Date.now()}-sms`,
        timestamp,
        type: 'low_stock',
        title: `SMS GudangMaster: ${product.sku} Menipis`,
        message: `[ALERT] Stok ${product.sku} tersisa ${current} unit (Min: ${min}). Rak: ${rack}. Harap restock!`,
        recipient: settings.alertPhoneRecipients.split(',')[0].trim() || '+6281299887766',
        channel: 'sms',
        status: 'delivered'
      });
    }

    if (settings.enableWhatsAppAlerts && channels.includes('whatsapp')) {
      newNotifs.push({
        id: `notif-${Date.now()}-wa`,
        timestamp,
        type: 'low_stock',
        title: `WhatsApp Alert: ${product.name}`,
        message: `Halo Tim Gudang, Stok *${product.name}* (${product.sku}) kritis: tersisa *${current}* (Batas: ${min}). Harap segera tindak lanjuti PO.`,
        recipient: settings.alertPhoneRecipients.split(',')[0].trim() || '+6281299887766',
        channel: 'whatsapp',
        status: 'delivered'
      });
    }

    if (newNotifs.length > 0) {
      setNotifications(prev => [...newNotifs, ...prev]);
      soundEffects.playAlertChime();
    }
  }, [products, racks, settings]);

  const sendLowStockAlert = useCallback((productId: string, channels: ('email' | 'sms' | 'whatsapp')[] = ['email', 'sms', 'whatsapp']) => {
    const product = products.find(p => p.id === productId);
    if (!product) return { success: false, message: 'Produk tidak ditemukan' };
    sendLowStockAlertInternal(productId, product.currentStock, product.minStock, channels);
    return { success: true, message: `Notifikasi stok rendah berhasil dikirimkan via ${channels.join(', ')}!` };
  }, [products, sendLowStockAlertInternal]);

  const sendAllLowStockAlerts = useCallback(() => {
    let sentCount = 0;
    lowStockAlerts.forEach(alert => {
      sendLowStockAlertInternal(alert.productId, alert.currentStock, alert.minStock, ['email', 'sms']);
      sentCount++;
    });
    return sentCount;
  }, [lowStockAlerts, sendLowStockAlertInternal]);

  // Generate End-of-Month Automated Report
  const generateMonthlyReport = useCallback((customMonthName?: string, customMonthKey?: string): MonthlyInventoryReport => {
    const now = new Date();
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const currentMonthName = customMonthName || `${months[now.getMonth()]} ${now.getFullYear()}`;
    const currentMonthKey = customMonthKey || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Aggregates
    const totalSKU = products.length;
    const totalStockQuantity = products.reduce((sum, p) => sum + p.currentStock, 0);
    const totalValuationIDR = products.reduce((sum, p) => sum + (p.currentStock * p.buyPrice), 0);

    const totalInboundUnits = transactions
      .filter(t => t.type === 'INBOUND')
      .reduce((sum, t) => sum + t.quantity, 0);

    const totalOutboundUnits = transactions
      .filter(t => t.type === 'OUTBOUND')
      .reduce((sum, t) => sum + t.quantity, 0);

    const lowStockCount = products.filter(p => p.currentStock <= p.minStock).length;

    // Category breakdown
    const catMap = new Map<string, { count: number; stock: number; val: number }>();
    products.forEach(p => {
      const prev = catMap.get(p.category) || { count: 0, stock: 0, val: 0 };
      catMap.set(p.category, {
        count: prev.count + 1,
        stock: prev.stock + p.currentStock,
        val: prev.val + (p.currentStock * p.buyPrice)
      });
    });

    const categoryBreakdown = Array.from(catMap.entries()).map(([cat, data]) => ({
      category: cat,
      itemCount: data.count,
      totalStock: data.stock,
      totalValuation: data.val
    }));

    // Top moving products based on outbound transactions
    const movingMap = new Map<string, { sku: string; name: string; qty: number }>();
    transactions.filter(t => t.type === 'OUTBOUND').forEach(t => {
      const prev = movingMap.get(t.sku) || { sku: t.sku, name: t.productName, qty: 0 };
      movingMap.set(t.sku, { ...prev, qty: prev.qty + t.quantity });
    });

    const topSorted = Array.from(movingMap.values()).sort((a, b) => b.qty - a.qty);
    const topMovingProducts = topSorted.slice(0, 5).map(m => ({
      sku: m.sku,
      name: m.name,
      turnoverQuantity: m.qty,
      type: (m.qty > 10 ? 'fast_moving' : 'slow_moving') as 'fast_moving' | 'slow_moving'
    }));

    // If empty top moving, provide sample
    if (topMovingProducts.length === 0 && products.length > 0) {
      topMovingProducts.push({
        sku: products[0].sku,
        name: products[0].name,
        turnoverQuantity: 15,
        type: 'fast_moving'
      });
    }

    const emailRecipients = settings.reportEmailRecipients
      .split(',')
      .map(e => e.trim())
      .filter(Boolean);

    const newReport: MonthlyInventoryReport = {
      id: `rep-${Date.now()}`,
      reportMonth: currentMonthName,
      monthKey: currentMonthKey,
      generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      generatedBy: currentUser.name || 'Sistem Otomatis GudangMaster',
      totalSKU,
      totalStockQuantity,
      totalValuationIDR,
      totalInboundUnits,
      totalOutboundUnits,
      lowStockItemsCount: lowStockCount,
      discrepanciesCount: 0,
      categoryBreakdown,
      topMovingProducts,
      sentToEmails: emailRecipients,
      status: 'sent'
    };

    setReports(prev => [newReport, ...prev.filter(r => r.monthKey !== currentMonthKey)]);

    // Dispatch notification
    const reportNotif: NotificationLog = {
      id: `notif-${Date.now()}-rep`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      type: 'monthly_report',
      title: `Laporan Inventaris Bulanan Otomatis (${currentMonthName}) Berhasil Dibuat`,
      message: `Laporan akhir bulan ${currentMonthName} telah rampung. Total Nilai Aset: Rp ${totalValuationIDR.toLocaleString('id-ID')} (${totalStockQuantity} Unit dari ${totalSKU} SKU). Telah dikirimkan otomatis ke ${emailRecipients.join(', ')}.`,
      recipient: emailRecipients[0] || 'windaheris@gmail.com',
      channel: 'email',
      status: 'delivered'
    };

    setNotifications(prev => [reportNotif, ...prev]);
    logAudit('Laporan Akhir Bulan', `Membuat & Mengirimkan Laporan Otomatis periode ${currentMonthName}`, 'report');

    return newReport;
  }, [products, transactions, settings, currentUser, logAudit]);

  // Settings update
  const updateSettings = useCallback((newSettings: Partial<WarehouseSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    logAudit('Pengaturan Sistem', 'Memperbarui konfigurasi sistem gudang & notifikasi', 'settings');
  }, [logAudit]);

  // Rack Management
  const addRack = useCallback((rackData: Omit<RackLocation, 'id' | 'currentUnits'>) => {
    const newRack: RackLocation = {
      ...rackData,
      id: `rack-${Date.now()}`,
      currentUnits: 0
    };
    setRacks(prev => [...prev, newRack]);
    logAudit('Tambah Rak', `Menambahkan rak ${newRack.rackCode} di ${newRack.zone}`, 'settings');
  }, [logAudit]);

  const updateRack = useCallback((id: string, updates: Partial<RackLocation>) => {
    setRacks(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    logAudit('Perbarui Rak', `Memperbarui konfigurasi rak ID: ${id}`, 'settings');
  }, [logAudit]);

  const deleteRack = useCallback((id: string) => {
    setRacks(prev => prev.filter(r => r.id !== id));
    logAudit('Hapus Rak', `Menghapus rak ID: ${id}`, 'settings');
  }, [logAudit]);

  // User Management
  const addUser = useCallback((userData: Omit<User, 'id' | 'lastActive'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      lastActive: 'Belum pernah login'
    };
    setUsers(prev => [...prev, newUser]);
    logAudit('Tambah Pengguna', `Menambahkan pengguna ${newUser.name} sebagai ${newUser.role}`, 'auth');
  }, [logAudit]);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (currentUser.id === id) {
      setCurrentUserState(prev => ({ ...prev, ...updates }));
    }
    logAudit('Perbarui Pengguna', `Memperbarui data pengguna ID: ${id}`, 'auth');
  }, [currentUser.id, logAudit]);

  const deleteUser = useCallback((id: string) => {
    if (users.length <= 1) return;
    setUsers(prev => prev.filter(u => u.id !== id));
    logAudit('Hapus Pengguna', `Menghapus akun pengguna ID: ${id}`, 'auth');
  }, [users.length, logAudit]);

  // Backup & Restore
  const exportDatabaseJson = useCallback(() => {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      products,
      racks,
      transactions,
      users,
      reports,
      notifications,
      settings,
      auditLogs
    }, null, 2);
  }, [products, racks, transactions, users, reports, notifications, settings, auditLogs]);

  const importDatabaseJson = useCallback((jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.products) setProducts(parsed.products);
      if (parsed.racks) setRacks(parsed.racks);
      if (parsed.transactions) setTransactions(parsed.transactions);
      if (parsed.users) setUsers(parsed.users);
      if (parsed.reports) setReports(parsed.reports);
      if (parsed.notifications) setNotifications(parsed.notifications);
      if (parsed.settings) setSettings(parsed.settings);
      if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
      logAudit('Restore Data', 'Memulihkan basis data gudang dari file backup JSON', 'settings');
      return true;
    } catch {
      return false;
    }
  }, [logAudit]);

  const resetToDemoData = useCallback(() => {
    setProducts(INITIAL_PRODUCTS);
    setRacks(INITIAL_RACKS);
    setTransactions(INITIAL_TRANSACTIONS);
    setUsers(INITIAL_USERS);
    setCurrentUserState(INITIAL_USERS[0]);
    setReports(INITIAL_MONTHLY_REPORTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSettings(INITIAL_SETTINGS);
    setAuditLogs([]);
    localStorage.removeItem(STORAGE_KEY);
    logAudit('Reset Sistem', 'Mereset seluruh data ke data percontohan awal', 'settings');
  }, [logAudit]);

  return (
    <WarehouseContext.Provider
      value={{
        products,
        racks,
        transactions,
        users,
        currentUser,
        reports,
        notifications,
        settings,
        auditLogs,
        lowStockAlerts,
        hasPermission,
        setCurrentUser,
        inboundStock,
        outboundStock,
        transferRack,
        stockOpname,
        addProduct,
        updateProduct,
        deleteProduct,
        findProductByBarcodeOrSku,
        generateMonthlyReport,
        sendLowStockAlert,
        sendAllLowStockAlerts,
        updateSettings,
        addRack,
        updateRack,
        deleteRack,
        addUser,
        updateUser,
        deleteUser,
        resetToDemoData,
        exportDatabaseJson,
        importDatabaseJson
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
};
