export type UserRole = 'super_admin' | 'warehouse_manager' | 'warehouse_staff' | 'auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone: string;
  status: 'active' | 'inactive';
  lastActive: string;
}

export interface Permission {
  canManageProducts: boolean;
  canInbound: boolean;
  canOutbound: boolean;
  canTransferRack: boolean;
  canStockOpname: boolean;
  canViewReports: boolean;
  canExportReports: boolean;
  canManageUsers: boolean;
  canChangeSettings: boolean;
}

export interface RackLocation {
  id: string;
  zone: string; // e.g. "Zona A - Elektronik", "Zona B - Fast Moving"
  rackCode: string; // e.g. "RAK-A01"
  shelfLevel: string; // e.g. "Tingkat 2"
  maxCapacityUnits: number;
  currentUnits: number;
  description?: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string; // e.g. "8991234567890"
  name: string;
  category: string;
  unit: string; // "Pcs", "Box", "Karton", "Pallet", "Kg"
  currentStock: number;
  minStock: number; // Low stock threshold
  maxStock: number;
  buyPrice: number; // Harga beli (IDR)
  sellPrice: number; // Harga jual/estimasi nilai (IDR)
  rackLocationId: string; // References RackLocation
  batchNumber?: string;
  expiryDate?: string;
  supplier: string;
  imageUrl?: string;
  lastUpdated: string;
}

export type TransactionType = 'INBOUND' | 'OUTBOUND' | 'TRANSFER' | 'ADJUSTMENT' | 'OPNAME';

export interface StockTransaction {
  id: string;
  type: TransactionType;
  referenceNumber: string; // e.g. "PO-2026-001" or "DO-2026-092"
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  previousStock: number;
  resultingStock: number;
  fromRackId?: string;
  toRackId?: string;
  notes: string;
  performedByUserId: string;
  performedByName: string;
  timestamp: string;
}

export interface LowStockAlert {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  minStock: number;
  deficit: number;
  severity: 'critical' | 'warning';
  rackCode: string;
  status: 'pending' | 'notified' | 'resolved';
  lastNotifiedAt?: string;
  channelsNotified?: ('email' | 'sms' | 'whatsapp')[];
}

export interface MonthlyInventoryReport {
  id: string;
  reportMonth: string; // e.g. "Oktober 2026"
  monthKey: string; // e.g. "2026-10"
  generatedAt: string;
  generatedBy: string;
  totalSKU: number;
  totalStockQuantity: number;
  totalValuationIDR: number; // Nilai Aset
  totalInboundUnits: number;
  totalOutboundUnits: number;
  lowStockItemsCount: number;
  discrepanciesCount: number;
  categoryBreakdown: {
    category: string;
    itemCount: number;
    totalStock: number;
    totalValuation: number;
  }[];
  topMovingProducts: {
    sku: string;
    name: string;
    turnoverQuantity: number;
    type: 'fast_moving' | 'slow_moving';
  }[];
  sentToEmails?: string[];
  status: 'draft' | 'final' | 'sent';
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  type: 'low_stock' | 'monthly_report' | 'system';
  title: string;
  message: string;
  recipient: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'system';
  status: 'sent' | 'delivered' | 'failed';
}

export interface WarehouseSettings {
  warehouseName: string;
  companyName: string;
  address: string;
  managerEmail: string;
  managerPhone: string;
  currency: string;
  
  // Notification rules
  enableEmailAlerts: boolean;
  enableSmsAlerts: boolean;
  enableWhatsAppAlerts: boolean;
  alertEmailRecipients: string;
  alertPhoneRecipients: string;
  
  // Automated report schedule
  autoGenerateMonthlyReport: boolean;
  reportDayOfMonth: number; // e.g. 28 or 30
  reportTime: string; // "23:59"
  autoEmailReport: boolean;
  reportEmailRecipients: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  category: 'inventory' | 'auth' | 'settings' | 'report';
}
