import { Product, RackLocation, User, StockTransaction, WarehouseSettings, MonthlyInventoryReport, NotificationLog } from '../types/warehouse';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-01',
    name: 'Winda Heris',
    email: 'windaheris@gmail.com',
    role: 'super_admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    phone: '+6281299887766',
    status: 'active',
    lastActive: 'Baru saja'
  },
  {
    id: 'usr-02',
    name: 'Budi Santoso',
    email: 'budi.gudang@logistik.co.id',
    role: 'warehouse_manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    phone: '+6281311223344',
    status: 'active',
    lastActive: '5 menit lalu'
  },
  {
    id: 'usr-03',
    name: 'Dimas Pratama',
    email: 'dimas.operator@logistik.co.id',
    role: 'warehouse_staff',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    phone: '+6285788990011',
    status: 'active',
    lastActive: '12 menit lalu'
  },
  {
    id: 'usr-04',
    name: 'Siti Rahmawati',
    email: 'siti.audit@financecorp.id',
    role: 'auditor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    phone: '+6282144556677',
    status: 'active',
    lastActive: '1 jam lalu'
  }
];

export const INITIAL_RACKS: RackLocation[] = [
  {
    id: 'rack-a01',
    zone: 'Zona A - Elektronik & Gadget',
    rackCode: 'RAK-A01',
    shelfLevel: 'Tingkat 1',
    maxCapacityUnits: 600,
    currentUnits: 430,
    description: 'Rak penyimpanan monitor, periferal, dan aksesoris'
  },
  {
    id: 'rack-a02',
    zone: 'Zona A - Elektronik & Gadget',
    rackCode: 'RAK-A02',
    shelfLevel: 'Tingkat 2',
    maxCapacityUnits: 500,
    currentUnits: 380,
    description: 'Rak komponen bernilai tinggi, CCTV, dan router'
  },
  {
    id: 'rack-b01',
    zone: 'Zona B - FMCG & Perlengkapan Kantor',
    rackCode: 'RAK-B01',
    shelfLevel: 'Tingkat 1',
    maxCapacityUnits: 1200,
    currentUnits: 1040,
    description: 'Fast moving paper ream, toner, dan packaging'
  },
  {
    id: 'rack-b02',
    zone: 'Zona B - FMCG & Perlengkapan Kantor',
    rackCode: 'RAK-B02',
    shelfLevel: 'Tingkat 2',
    maxCapacityUnits: 800,
    currentUnits: 310,
    description: 'Kardus packing, lakban industri, bubble wrap'
  },
  {
    id: 'rack-c01',
    zone: 'Zona C - Suku Cadang & Mesin',
    rackCode: 'RAK-C01',
    shelfLevel: 'Tingkat 1',
    maxCapacityUnits: 450,
    currentUnits: 395,
    description: 'Sparepart conveyor, bearing, rantai motor'
  },
  {
    id: 'rack-c02',
    zone: 'Zona C - Suku Cadang & Mesin',
    rackCode: 'RAK-C02',
    shelfLevel: 'Tingkat 2',
    maxCapacityUnits: 400,
    currentUnits: 90,
    description: 'Sensor optik, kabel fiber optik, baterai cadangan'
  },
  {
    id: 'rack-d01',
    zone: 'Zona D - Bahan Baku & Kimia Ringan',
    rackCode: 'RAK-D01',
    shelfLevel: 'Tingkat 1 (Suhu Terkontrol)',
    maxCapacityUnits: 300,
    currentUnits: 185,
    description: 'Pelarut industri, pembersih sirkuit, silika gel'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    sku: 'ELC-MON-024',
    barcode: '899276100101',
    name: 'Monitor LED IPS 24" 100Hz Full HD',
    category: 'Elektronik',
    unit: 'Unit',
    currentStock: 48,
    minStock: 20,
    maxStock: 120,
    buyPrice: 1250000,
    sellPrice: 1650000,
    rackLocationId: 'rack-a01',
    supplier: 'PT Global Komputindo Pratama',
    batchNumber: 'B-2026-X1',
    lastUpdated: '2026-10-27 14:30'
  },
  {
    id: 'prod-02',
    sku: 'ELC-RTR-WIFI6',
    barcode: '899276100102',
    name: 'Router WiFi-6 Dual Band AX3000 Gigabit',
    category: 'Elektronik',
    unit: 'Unit',
    currentStock: 12, // Critical low stock (minStock: 25)
    minStock: 25,
    maxStock: 100,
    buyPrice: 620000,
    sellPrice: 850000,
    rackLocationId: 'rack-a02',
    supplier: 'PT Netlink Mandiri Jaya',
    batchNumber: 'B-2026-AX4',
    lastUpdated: '2026-10-27 16:15'
  },
  {
    id: 'prod-03',
    sku: 'ELC-BAR-SCN2D',
    barcode: '899276100103',
    name: 'Barcode Scanner 2D Wireless Handheld USB',
    category: 'Elektronik',
    unit: 'Unit',
    currentStock: 8, // Very low stock! (minStock: 15)
    minStock: 15,
    maxStock: 60,
    buyPrice: 450000,
    sellPrice: 690000,
    rackLocationId: 'rack-a01',
    supplier: 'CV Indo Optima Barcode',
    batchNumber: 'B-2026-SC09',
    lastUpdated: '2026-10-28 08:20'
  },
  {
    id: 'prod-04',
    sku: 'FMC-PAP-A475',
    barcode: '899276100104',
    name: 'Kertas HVS A4 75gsm (Box @5 Rim)',
    category: 'Perlengkapan Kantor',
    unit: 'Box',
    currentStock: 145,
    minStock: 50,
    maxStock: 300,
    buyPrice: 195000,
    sellPrice: 240000,
    rackLocationId: 'rack-b01',
    supplier: 'PT Paper Nusantara Abadi',
    batchNumber: 'B-2026-PAP12',
    lastUpdated: '2026-10-26 11:00'
  },
  {
    id: 'prod-05',
    sku: 'FMC-TNR-BLK85',
    barcode: '899276100105',
    name: 'Toner Cartridge Laserjet 85A High Yield',
    category: 'Perlengkapan Kantor',
    unit: 'Pcs',
    currentStock: 6, // Low stock (min: 15)
    minStock: 15,
    maxStock: 80,
    buyPrice: 210000,
    sellPrice: 320000,
    rackLocationId: 'rack-b01',
    supplier: 'CV Multi Sarana Cetak',
    batchNumber: 'B-2026-TN05',
    lastUpdated: '2026-10-27 10:45'
  },
  {
    id: 'prod-06',
    sku: 'FMC-LAK-IND50',
    barcode: '899276100106',
    name: 'Lakban Cokelat Industri 48mm x 100m (Karton @72 Roll)',
    category: 'Perlengkapan Kantor',
    unit: 'Karton',
    currentStock: 64,
    minStock: 30,
    maxStock: 150,
    buyPrice: 480000,
    sellPrice: 580000,
    rackLocationId: 'rack-b02',
    supplier: 'PT Duta Pita Perkasa',
    batchNumber: 'B-2026-LK88',
    lastUpdated: '2026-10-25 09:30'
  },
  {
    id: 'prod-07',
    sku: 'SPP-BRG-6205',
    barcode: '899276100107',
    name: 'Deep Groove Ball Bearing 6205-2RS Steel',
    category: 'Suku Cadang & Mesin',
    unit: 'Pcs',
    currentStock: 85,
    minStock: 40,
    maxStock: 250,
    buyPrice: 65000,
    sellPrice: 95000,
    rackLocationId: 'rack-c01',
    supplier: 'PT Teknik Presisi Indonesia',
    batchNumber: 'B-2026-BRG02',
    lastUpdated: '2026-10-27 13:10'
  },
  {
    id: 'prod-08',
    sku: 'SPP-SEN-OPT12',
    barcode: '899276100108',
    name: 'Sensor Optik Proximity Sensor M12 NPN',
    category: 'Suku Cadang & Mesin',
    unit: 'Pcs',
    currentStock: 4, // Critical low stock (min: 10)
    minStock: 10,
    maxStock: 50,
    buyPrice: 180000,
    sellPrice: 280000,
    rackLocationId: 'rack-c02',
    supplier: 'PT Otomasi Industri Cemerlang',
    batchNumber: 'B-2026-SEN99',
    lastUpdated: '2026-10-28 07:15'
  },
  {
    id: 'prod-09',
    sku: 'KIM-SLK-DRY01',
    barcode: '899276100109',
    name: 'Silica Gel Desiccant Grade A 50g (Pak @100)',
    category: 'Bahan Baku & Kimia',
    unit: 'Pak',
    currentStock: 72,
    minStock: 25,
    maxStock: 200,
    buyPrice: 85000,
    sellPrice: 125000,
    rackLocationId: 'rack-d01',
    supplier: 'CV Kimia Sejati Mandiri',
    batchNumber: 'B-2026-SLK01',
    lastUpdated: '2026-10-26 15:40'
  },
  {
    id: 'prod-10',
    sku: 'ELC-BAT-UPS12',
    barcode: '899276100110',
    name: 'Baterai Kering VRLA 12V 9Ah untuk UPS Server',
    category: 'Elektronik',
    unit: 'Unit',
    currentStock: 28,
    minStock: 15,
    maxStock: 80,
    buyPrice: 240000,
    sellPrice: 340000,
    rackLocationId: 'rack-a02',
    supplier: 'PT Daya Cadangan Utama',
    batchNumber: 'B-2026-BAT11',
    lastUpdated: '2026-10-27 10:20'
  }
];

export const INITIAL_TRANSACTIONS: StockTransaction[] = [
  {
    id: 'trx-101',
    type: 'INBOUND',
    referenceNumber: 'PO-2026-10-098',
    productId: 'prod-01',
    productName: 'Monitor LED IPS 24" 100Hz Full HD',
    sku: 'ELC-MON-024',
    quantity: 30,
    previousStock: 18,
    resultingStock: 48,
    toRackId: 'rack-a01',
    notes: 'Penerimaan kontainer batch 1 dari PT Global Komputindo',
    performedByUserId: 'usr-03',
    performedByName: 'Dimas Pratama',
    timestamp: '2026-10-27 14:30'
  },
  {
    id: 'trx-102',
    type: 'OUTBOUND',
    referenceNumber: 'DO-2026-10-312',
    productId: 'prod-02',
    productName: 'Router WiFi-6 Dual Band AX3000 Gigabit',
    sku: 'ELC-RTR-WIFI6',
    quantity: 18,
    previousStock: 30,
    resultingStock: 12,
    fromRackId: 'rack-a02',
    notes: 'Pengiriman pesanan klien B2B Telko Project Surabaya',
    performedByUserId: 'usr-02',
    performedByName: 'Budi Santoso',
    timestamp: '2026-10-27 16:15'
  },
  {
    id: 'trx-103',
    type: 'OUTBOUND',
    referenceNumber: 'DO-2026-10-313',
    productId: 'prod-03',
    productName: 'Barcode Scanner 2D Wireless Handheld USB',
    sku: 'ELC-BAR-SCN2D',
    quantity: 12,
    previousStock: 20,
    resultingStock: 8,
    fromRackId: 'rack-a01',
    notes: 'Distribusi untuk cabang gudang logistik regional Semarang',
    performedByUserId: 'usr-03',
    performedByName: 'Dimas Pratama',
    timestamp: '2026-10-28 08:20'
  },
  {
    id: 'trx-104',
    type: 'TRANSFER',
    referenceNumber: 'MUT-2026-10-044',
    productId: 'prod-05',
    productName: 'Toner Cartridge Laserjet 85A High Yield',
    sku: 'FMC-TNR-BLK85',
    quantity: 10,
    previousStock: 16,
    resultingStock: 16,
    fromRackId: 'rack-b02',
    toRackId: 'rack-b01',
    notes: 'Relokasi stok ke rak prioritas fast-picking lantai 1',
    performedByUserId: 'usr-03',
    performedByName: 'Dimas Pratama',
    timestamp: '2026-10-27 10:45'
  },
  {
    id: 'trx-105',
    type: 'OUTBOUND',
    referenceNumber: 'DO-2026-10-314',
    productId: 'prod-08',
    productName: 'Sensor Optik Proximity Sensor M12 NPN',
    sku: 'SPP-SEN-OPT12',
    quantity: 8,
    previousStock: 12,
    resultingStock: 4,
    fromRackId: 'rack-c02',
    notes: 'Kebutuhan darurat maintenance line pabrik otomotif Cikarang',
    performedByUserId: 'usr-02',
    performedByName: 'Budi Santoso',
    timestamp: '2026-10-28 07:15'
  }
];

export const INITIAL_MONTHLY_REPORTS: MonthlyInventoryReport[] = [
  {
    id: 'rep-2026-09',
    reportMonth: 'September 2026',
    monthKey: '2026-09',
    generatedAt: '2026-09-30 23:59:00',
    generatedBy: 'Sistem Otomatis GudangMaster',
    totalSKU: 10,
    totalStockQuantity: 520,
    totalValuationIDR: 215400000,
    totalInboundUnits: 340,
    totalOutboundUnits: 290,
    lowStockItemsCount: 2,
    discrepanciesCount: 0,
    categoryBreakdown: [
      { category: 'Elektronik', itemCount: 4, totalStock: 110, totalValuation: 118400000 },
      { category: 'Perlengkapan Kantor', itemCount: 3, totalStock: 220, totalValuation: 48900000 },
      { category: 'Suku Cadang & Mesin', itemCount: 2, totalStock: 115, totalValuation: 39500000 },
      { category: 'Bahan Baku & Kimia', itemCount: 1, totalStock: 75, totalValuation: 8600000 }
    ],
    topMovingProducts: [
      { sku: 'FMC-PAP-A475', name: 'Kertas HVS A4 75gsm', turnoverQuantity: 180, type: 'fast_moving' },
      { sku: 'ELC-RTR-WIFI6', name: 'Router WiFi-6 Dual Band', turnoverQuantity: 65, type: 'fast_moving' },
      { sku: 'KIM-SLK-DRY01', name: 'Silica Gel Desiccant Grade A', turnoverQuantity: 8, type: 'slow_moving' }
    ],
    sentToEmails: ['windaheris@gmail.com', 'budi.gudang@logistik.co.id'],
    status: 'sent'
  },
  {
    id: 'rep-2026-08',
    reportMonth: 'Agustus 2026',
    monthKey: '2026-08',
    generatedAt: '2026-08-31 23:59:00',
    generatedBy: 'Sistem Otomatis GudangMaster',
    totalSKU: 10,
    totalStockQuantity: 470,
    totalValuationIDR: 198250000,
    totalInboundUnits: 280,
    totalOutboundUnits: 265,
    lowStockItemsCount: 3,
    discrepanciesCount: 1,
    categoryBreakdown: [
      { category: 'Elektronik', itemCount: 4, totalStock: 95, totalValuation: 104200000 },
      { category: 'Perlengkapan Kantor', itemCount: 3, totalStock: 210, totalValuation: 47150000 },
      { category: 'Suku Cadang & Mesin', itemCount: 2, totalStock: 95, totalValuation: 38500000 },
      { category: 'Bahan Baku & Kimia', itemCount: 1, totalStock: 70, totalValuation: 8400000 }
    ],
    topMovingProducts: [
      { sku: 'FMC-PAP-A475', name: 'Kertas HVS A4 75gsm', turnoverQuantity: 160, type: 'fast_moving' },
      { sku: 'ELC-MON-024', name: 'Monitor LED IPS 24"', turnoverQuantity: 55, type: 'fast_moving' }
    ],
    sentToEmails: ['windaheris@gmail.com'],
    status: 'sent'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationLog[] = [
  {
    id: 'notif-01',
    timestamp: '2026-10-28 08:22:10',
    type: 'low_stock',
    title: 'Peringatan Stok Menipis Kritis: Barcode Scanner 2D',
    message: 'Stok SKU ELC-BAR-SCN2D tersisa 8 Unit (Batas minimum: 15 Unit). Mohon lakukan reorder ke CV Indo Optima Barcode.',
    recipient: 'windaheris@gmail.com',
    channel: 'email',
    status: 'delivered'
  },
  {
    id: 'notif-02',
    timestamp: '2026-10-28 08:22:12',
    type: 'low_stock',
    title: 'SMS Alert: Stok Kritis ELC-BAR-SCN2D',
    message: '[GudangMaster] Peringatan: Stok ELC-BAR-SCN2D tersisa 8 pcs (Min: 15). Lokasi: RAK-A01.',
    recipient: '+6281299887766',
    channel: 'sms',
    status: 'delivered'
  },
  {
    id: 'notif-03',
    timestamp: '2026-10-28 07:16:05',
    type: 'low_stock',
    title: 'Peringatan Stok Menipis Kritis: Sensor Optik Proximity',
    message: 'Stok SKU SPP-SEN-OPT12 tersisa 4 Pcs (Batas minimum: 10 Pcs). Lokasi: RAK-C02.',
    recipient: 'windaheris@gmail.com',
    channel: 'email',
    status: 'delivered'
  },
  {
    id: 'notif-04',
    timestamp: '2026-10-01 00:01:00',
    type: 'monthly_report',
    title: 'Laporan Inventaris Bulanan Otomatis (September 2026)',
    message: 'Laporan inventaris akhir bulan September 2026 telah dibuat otomatis oleh sistem dan dikirimkan ke dewan direksi & manager.',
    recipient: 'windaheris@gmail.com',
    channel: 'email',
    status: 'sent'
  }
];

export const INITIAL_SETTINGS: WarehouseSettings = {
  warehouseName: 'Gudang Pusat Logistik Nusantara (DC-JKT1)',
  companyName: 'PT Nusantara Mega Distribusi',
  address: 'Kawasan Industri Pulogadung Blok F No. 12, Jakarta Timur',
  managerEmail: 'windaheris@gmail.com',
  managerPhone: '+6281299887766',
  currency: 'IDR',
  
  // Notification rules
  enableEmailAlerts: true,
  enableSmsAlerts: true,
  enableWhatsAppAlerts: true,
  alertEmailRecipients: 'windaheris@gmail.com, operasional@nusantaralogistik.com',
  alertPhoneRecipients: '+6281299887766, +6281311223344',
  
  // Automated report schedule
  autoGenerateMonthlyReport: true,
  reportDayOfMonth: 31, // Hari terakhir tiap bulan
  reportTime: '23:59',
  autoEmailReport: true,
  reportEmailRecipients: 'windaheris@gmail.com, direksi@nusantaralogistik.com, audit@nusantaralogistik.com'
};
