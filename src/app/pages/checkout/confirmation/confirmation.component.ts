import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../models/order.model';

@Component({
    selector: 'app-confirmation',
    standalone: true,
    imports: [CommonModule, CurrencyPipe, DatePipe, ButtonModule],
    templateUrl: './confirmation.component.html',
    styleUrl: './confirmation.component.css'
})
export class ConfirmationComponent implements OnInit {
    private router = inject(Router);
    private orderService = inject(OrderService);

    order: Order | null = null;

    ngOnInit(): void {
        this.order = this.orderService.getLastOrder();
        if (!this.order) {
            this.router.navigate(['/products']);
        }
    }

    continueShopping(): void {
        this.router.navigate(['/products']);
    }

    viewOrder(): void {
        if (this.order?.id) {
            this.router.navigate(['/orders', this.order.id]);
        }
    }

    viewAllOrders(): void {
        this.router.navigate(['/orders']);
    }

    viewInvoice(): void {
        if (this.order?.id) {
            this.router.navigate(['/orders', this.order.id, 'invoice']);
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
