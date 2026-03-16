import { Injectable, signal } from '@angular/core';
import { Order, PaymentMethod } from '../../models/order.model';
import { CartItem } from '../../models/cart.model';
import { Address } from '../../models/address.model';

@Injectable({
    providedIn: 'root'
})
export class OrderService {

    private orders = signal<Order[]>([]);
    private currentAddress = signal<Address | null>(null);

    readonly allOrders = this.orders.asReadonly();
    readonly address = this.currentAddress.asReadonly();

    setAddress(address: Address): void {
        this.currentAddress.set(address);
    }

    getAddress(): Address | null {
        return this.currentAddress();
    }

    placeOrder(items: CartItem[], address: Address, paymentMethod: PaymentMethod, totalAmount: number, deliveryFee: number): Order {
        let taxableAmount = 0;
        let totalGST = 0;
        let subTotal = 0;

        items.forEach(item => {
            const itemTotal = item.product.price * item.quantity;
            subTotal += itemTotal;
            
            const gstRate = (item.product as any).gstRate || 0;
            const itemTaxable = itemTotal / (1 + gstRate / 100);
            const itemTax = itemTotal - itemTaxable;
            
            taxableAmount += itemTaxable;
            totalGST += itemTax;
        });

        const order: Order = {
            id: 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
            items: [...items],
            address: { ...address },
            paymentMethod,
            totalAmount,
            subTotal,
            taxableAmount,
            totalGST,
            cgst: totalGST / 2,
            sgst: totalGST / 2,
            igst: 0, // Assuming intra-state for now
            deliveryFee,
            status: 'confirmed',
            orderDate: new Date()
        };

        this.orders.set([order, ...this.orders()]);
        return order;
    }

    getLastOrder(): Order | null {
        const all = this.orders();
        return all.length > 0 ? all[0] : null;
    }

    getOrders(): Order[] {
        return this.orders();
    }

    getOrderById(id: string): Order | null {
        return this.orders().find(o => o.id === id) || null;
    }
}
