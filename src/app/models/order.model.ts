import { CartItem } from './cart.model';
import { Address } from './address.model';

export type PaymentMethod = 'credit_card' | 'debit_card' | 'upi' | 'cash' | 'wallet';

export interface Order {
    id: string;
    items: CartItem[];
    address: Address;
    paymentMethod: PaymentMethod;
    totalAmount: number;
    subTotal: number;
    taxableAmount: number;
    totalGST: number;
    cgst: number;
    sgst: number;
    igst: number;
    deliveryFee: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
    orderDate: Date;
}
