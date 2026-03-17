import { Injectable, signal, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Order, PaymentMethod } from '../../models/order.model';
import { CartItem } from '../../models/cart.model';
import { Address } from '../../models/address.model';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/sales`;
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

    placeOrder(items: CartItem[], address: Address, paymentMethod: PaymentMethod, totalAmount: number, deliveryFee: number): Observable<Order> {
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

        const orderData = {
            items: items.map(i => ({
                productId: i.product.id,
                name: i.product.name,
                quantity: i.quantity,
                price: i.product.price,
                total: i.subtotal,
                category: i.product.category
            })),
            totalAmount,
            tax: totalGST,
            paymentMethod,
            processedBy: 'Current User', // Placeholder
            paymentStatus: 'Paid',
            amountPaid: totalAmount
        };

        return this.http.post<Order>(this.apiUrl, orderData).pipe(
            tap(savedOrder => {
                this.orders.set([savedOrder, ...this.orders()]);
            })
        );
    }

    fetchOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(this.apiUrl).pipe(
            tap(orders => this.orders.set(orders))
        );
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
