import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../auth/auth.service';
import { Order } from '../../../models/order.model';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'app-my-orders',
    standalone: true,
    imports: [CommonModule, CurrencyPipe, DatePipe, ButtonModule, TagModule, IconFieldModule, InputIconModule, InputTextModule],
    templateUrl: './my-orders.component.html',
    styleUrl: './my-orders.component.css'
})
export class MyOrdersComponent implements OnInit {
    orderService = inject(OrderService);
    private auth = inject(AuthService);
    private router = inject(Router);

    isManager = this.auth.isManager();

    ngOnInit(): void {
        this.orderService.fetchOrders().subscribe();
    }

    viewOrder(order: Order): void {
        this.router.navigate(['/orders', order.id]);
    }

    cancelOrder(order: Order, event: Event): void {
        event.stopPropagation();
        // Logically we would call orderService.deleteOrder(order.id) here
        console.log('Order cancelled:', order.id);
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
