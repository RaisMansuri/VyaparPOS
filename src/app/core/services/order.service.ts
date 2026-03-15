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
        const order: Order = {
            id: 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
            items: [...items],
            address: { ...address },
            paymentMethod,
            totalAmount,
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
