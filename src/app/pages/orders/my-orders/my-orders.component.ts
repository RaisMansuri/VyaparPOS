import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../models/order.model';

@Component({
    selector: 'app-my-orders',
    standalone: true,
    imports: [CommonModule, CurrencyPipe, DatePipe, ButtonModule, TagModule],
    templateUrl: './my-orders.component.html',
    styleUrl: './my-orders.component.css'
})
export class MyOrdersComponent {
    orderService = inject(OrderService);
    private router = inject(Router);

    viewOrder(order: Order): void {
        this.router.navigate(['/orders', order.id]);
    }

    continueShopping(): void {
        this.router.navigate(['/products']);
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
        switch (status) {
            case 'confirmed': return 'info';
            case 'shipped': return 'warn';
            case 'delivered': return 'success';
            case 'pending': return 'secondary';
            default: return 'info';
        }
    }

    getPaymentLabel(method: string): string {
        switch (method) {
            case 'credit_card': return 'Credit Card';
            case 'debit_card': return 'Debit Card';
            case 'upi': return 'UPI';
            default: return method;
        }
    }
}
