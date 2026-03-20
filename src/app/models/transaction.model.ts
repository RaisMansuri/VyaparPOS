export interface DashboardStats {
  grossTotal: number;
  netProfit: number;
  totalStockValue: number;
  totalItemsInStock: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export type TransactionType = 'Sale' | 'Expense' | 'Refund' | 'Wallet';
export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
export type TransactionStatus = 'Completed' | 'Pending' | 'Failed' | 'Refunded';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  method: PaymentMethod;
  upiId?: string;
  status: TransactionStatus;
  date: Date;
  referenceId: string;
  customerName?: string;
  processedBy?: string;
  description?: string;
}
