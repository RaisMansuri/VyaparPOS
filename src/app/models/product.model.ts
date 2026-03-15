export interface Product {
  id: number;
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
}

export interface Discount {
  type: 'daily' | 'weekly' | 'monthly';
  value: number; // percentage
}
