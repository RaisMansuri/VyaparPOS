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
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-my-orders',
    standalone: true,
    imports: [CommonModule, CurrencyPipe, DatePipe, ButtonModule, TagModule, IconFieldModule, InputIconModule, InputTextModule, TableModule, TooltipModule],
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
            case 'cash': return 'Cash';
            default: return method;
        }
    }

    getPaymentIcon(method: string): string {
        switch (method) {
            case 'credit_card':
            case 'debit_card': return 'pi-credit-card';
            case 'upi': return 'pi-mobile';
            case 'cash': return 'pi-money-bill';
            default: return 'pi-wallet';
        }
    }

    getItemsTooltip(order: Order): string {
        return (order.items || []).map(i => `${i.product.name} (x${i.quantity})`).join('\n');
    }

    handleImageError(event: any): void {
        event.target.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'150\' height=\'150\'%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'%23e2e8f0\'/%3E%3C/svg%3E';
    }
}
