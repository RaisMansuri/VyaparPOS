export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  gstNumber?: string;
  categories: string[]; // categories they supply
  lastSupplyDate?: Date;
  outstandingPayment?: number;
  createdAt: Date;
}
