export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  preferences?: string[];
  notes?: string;
  createdAt: Date;
}
