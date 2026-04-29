import { Customer } from '../models/customer.model';
import { Order } from '../models/order.model';
import { Product } from '../models/product.model';
import { SupportTicket } from '../models/support.model';
import { DashboardStats } from '../models/transaction.model';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 101,
    name: 'Classic Milk Bread',
    price: 45,
    description: 'Soft daily bread loaf for home and store counter sales.',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    category: 'Breads',
    quantity: 1,
    stock: 42,
    costPrice: 28,
    minStockLevel: 10,
    barcode: '8901000001011',
    gstRate: 5,
    wholesalePrice: 38,
    minWholesaleQuantity: 10,
  },
  {
    id: 102,
    name: 'Butter Croissant',
    price: 55,
    description: 'Flaky butter croissant for breakfast combos.',
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    category: 'Pastries',
    quantity: 1,
    stock: 18,
    costPrice: 30,
    minStockLevel: 8,
    barcode: '8901000001028',
    gstRate: 5,
    wholesalePrice: 45,
    minWholesaleQuantity: 20,
  },
  {
    id: 103,
    name: 'Chocolate Truffle Cake',
    price: 650,
    description: 'Premium celebration cake with chocolate sponge and ganache.',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    category: 'Cakes',
    quantity: 1,
    stock: 6,
    costPrice: 420,
    minStockLevel: 4,
    barcode: '8901000001035',
    gstRate: 12,
  },
  {
    id: 104,
    name: 'Cold Coffee Bottle',
    price: 80,
    description: 'Ready-to-serve cold coffee for quick billing.',
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
    category: 'Drinks',
    quantity: 1,
    stock: 25,
    costPrice: 46,
    minStockLevel: 10,
    barcode: '8901000001042',
    gstRate: 12,
  },
  {
    id: 105,
    name: 'Red Velvet Pastry',
    price: 95,
    description: 'Single-serve pastry for walk-in customers.',
    imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80',
    category: 'Pastries',
    quantity: 1,
    stock: 9,
    costPrice: 52,
    minStockLevel: 10,
    barcode: '8901000001059',
    gstRate: 5,
  },
  {
    id: 106,
    name: 'Multigrain Bread',
    price: 60,
    description: 'Healthy loaf popular with repeat customers.',
    imageUrl: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=600&q=80',
    category: 'Breads',
    quantity: 1,
    stock: 0,
    costPrice: 38,
    minStockLevel: 8,
    barcode: '8901000001066',
    gstRate: 5,
  },
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'CUS-1001',
    name: 'Anita Sharma',
    email: 'anita.sharma@example.com',
    phone: '9876543210',
    address: 'MG Road, Indore',
    totalOrders: 16,
    totalSpent: 8420,
    lastOrderDate: new Date('2026-03-16'),
    preferences: ['Cakes', 'Pastries'],
    notes: 'Prefers evening delivery.',
    createdAt: new Date('2025-10-10'),
    customerType: 'retail',
  },
  {
    id: 'CUS-1002',
    name: 'Rahul Verma',
    email: 'rahul.verma@example.com',
    phone: '9123456780',
    address: 'Vijay Nagar, Indore',
    totalOrders: 9,
    totalSpent: 3920,
    lastOrderDate: new Date('2026-03-14'),
    preferences: ['Drinks', 'Breads'],
    createdAt: new Date('2025-12-01'),
    customerType: 'retail',
  },
  {
    id: 'CUS-1003',
    name: 'Priya Nair',
    email: 'priya.nair@example.com',
    phone: '9988776655',
    address: 'Palasia, Indore',
    totalOrders: 21,
    totalSpent: 12450,
    lastOrderDate: new Date('2026-03-18'),
    preferences: ['Cakes'],
    notes: 'Birthday and party bulk buyer.',
    createdAt: new Date('2025-08-18'),
    customerType: 'wholesale',
    creditLimit: 50000,
    outstandingBalance: 12000,
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-20260318-001',
    items: [
      {
        product: MOCK_PRODUCTS[0],
        quantity: 2,
        subtotal: 90,
      },
      {
        product: MOCK_PRODUCTS[1],
        quantity: 2,
        subtotal: 110,
      },
    ],
    address: {
      fullName: 'Anita Sharma',
      phone: '9876543210',
      addressLine1: '12 MG Road',
      addressLine2: 'Near Treasure Island',
      city: 'Indore',
      state: 'Madhya Pradesh',
      pincode: '452001',
      addressType: 'home',
    },
    paymentMethod: 'upi',
    totalAmount: 240,
    subTotal: 200,
    taxableAmount: 190,
    totalGST: 10,
    cgst: 5,
    sgst: 5,
    igst: 0,
    deliveryFee: 40,
    status: 'delivered',
    orderDate: new Date('2026-03-18T10:15:00'),
  },
  {
    id: 'ORD-20260319-002',
    items: [
      {
        product: MOCK_PRODUCTS[2],
        quantity: 1,
        subtotal: 650,
      },
      {
        product: MOCK_PRODUCTS[4],
        quantity: 2,
        subtotal: 190,
      },
    ],
    address: {
      fullName: 'Priya Nair',
      phone: '9988776655',
      addressLine1: '8 Palasia Square',
      addressLine2: '',
      city: 'Indore',
      state: 'Madhya Pradesh',
      pincode: '452018',
      addressType: 'office',
    },
    paymentMethod: 'credit_card',
    totalAmount: 840,
    subTotal: 800,
    taxableAmount: 736,
    totalGST: 64,
    cgst: 32,
    sgst: 32,
    igst: 0,
    deliveryFee: 40,
    status: 'confirmed',
    orderDate: new Date('2026-03-19T08:40:00'),
  },
];

export const MOCK_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'TKT-501',
    subject: 'Wrong quantity in order',
    description: 'Customer received one pastry instead of two in the order.',
    status: 'Open',
    priority: 'High',
    customerName: 'Anita Sharma',
    customerEmail: 'anita.sharma@example.com',
    createdAt: new Date('2026-03-18T11:00:00'),
    updatedAt: new Date('2026-03-18T11:30:00'),
    assignedTo: 'Support Agent',
    comments: [
      {
        id: 'COM-1',
        author: 'Support Agent',
        message: 'We are reviewing the packed order details.',
        createdAt: new Date('2026-03-18T11:30:00'),
      },
    ],
  },
  {
    id: 'TKT-502',
    subject: 'Need GST invoice copy',
    description: 'Customer needs invoice PDF for company reimbursement.',
    status: 'In Progress',
    priority: 'Medium',
    customerName: 'Rahul Verma',
    customerEmail: 'rahul.verma@example.com',
    createdAt: new Date('2026-03-17T16:20:00'),
    updatedAt: new Date('2026-03-17T17:00:00'),
    assignedTo: 'Billing Desk',
    comments: [
      {
        id: 'COM-2',
        author: 'Billing Desk',
        message: 'Invoice is being generated and will be shared shortly.',
        createdAt: new Date('2026-03-17T17:00:00'),
      },
    ],
  },
];

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  grossTotal: 28540,
  netProfit: 8240,
  totalStockValue: 42350,
  totalItemsInStock: MOCK_PRODUCTS.reduce((sum, item) => sum + item.stock, 0),
  lowStockCount: MOCK_PRODUCTS.filter((item) => item.stock > 0 && item.stock <= item.minStockLevel).length,
  outOfStockCount: MOCK_PRODUCTS.filter((item) => item.stock === 0).length,
  todayProfit: 1250,
};

export const MOCK_SALES_BY_DAY = [
  { date: new Date('2026-03-13'), orders: 18, revenue: 6400, count: 18 },
  { date: new Date('2026-03-14'), orders: 22, revenue: 7100, count: 22 },
  { date: new Date('2026-03-15'), orders: 19, revenue: 6820, count: 19 },
  { date: new Date('2026-03-16'), orders: 24, revenue: 8350, count: 24 },
  { date: new Date('2026-03-17'), orders: 27, revenue: 9100, count: 27 },
  { date: new Date('2026-03-18'), orders: 21, revenue: 7800, count: 21 },
  { date: new Date('2026-03-19'), orders: 29, revenue: 9950, count: 29 },
];

export const MOCK_SALES_BY_CATEGORY = [
  { _id: 'Breads', value: 26 },
  { _id: 'Cakes', value: 18 },
  { _id: 'Pastries', value: 31 },
  { _id: 'Drinks', value: 12 },
];

export const MOCK_DAILY_REPORTS = [
  { date: new Date('2026-03-13'), orders: 18, taxable: 6095, gst: 305, revenue: 6400, profit: 1840, category: 'Breads', productId: 101 },
  { date: new Date('2026-03-14'), orders: 22, taxable: 6762, gst: 338, revenue: 7100, profit: 2050, category: 'Pastries', productId: 102 },
  { date: new Date('2026-03-15'), orders: 19, taxable: 6495, gst: 325, revenue: 6820, profit: 1940, category: 'Cakes', productId: 103 },
  { date: new Date('2026-03-16'), orders: 24, taxable: 7952, gst: 398, revenue: 8350, profit: 2480, category: 'Drinks', productId: 104 },
  { date: new Date('2026-03-17'), orders: 27, taxable: 8667, gst: 433, revenue: 9100, profit: 2745, category: 'Pastries', productId: 105 },
  { date: new Date('2026-03-18'), orders: 21, taxable: 7429, gst: 371, revenue: 7800, profit: 2310, category: 'Breads', productId: 106 },
  { date: new Date('2026-03-19'), orders: 29, taxable: 9476, gst: 474, revenue: 9950, profit: 3025, category: 'Cakes', productId: 103 },
];

export function cloneProducts(): Product[] {
  return MOCK_PRODUCTS.map((product) => ({ ...product }));
}

export function cloneCustomers(): Customer[] {
  return MOCK_CUSTOMERS.map((customer) => ({ ...customer }));
}

export function cloneOrders(): Order[] {
  return MOCK_ORDERS.map((order) => ({
    ...order,
    address: order.address ? { ...order.address } : undefined,
    items: order.items ? order.items.map((item) => ({
      ...item,
      product: { ...item.product },
    })) : [],
  }));
}

export function cloneSupportTickets(): SupportTicket[] {
  return MOCK_SUPPORT_TICKETS.map((ticket) => ({
    ...ticket,
    comments: ticket.comments?.map((comment) => ({ ...comment })) || [],
  }));
}
