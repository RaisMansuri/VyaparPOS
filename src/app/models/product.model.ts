export interface Product {
  id: string | number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  discount?: Discount;
  quantity: number;
  stock: number;
  costPrice: number;
  minStockLevel: number;
  barcode?: string;
  gstRate: number; // e.g., 5, 12, 18, 28
  unit?: string;
  wholesalePrice?: number;
  minWholesaleQuantity?: number;
}

export interface Discount {
  type: 'daily' | 'weekly' | 'monthly';
  value: number; // percentage
}
