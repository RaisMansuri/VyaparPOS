import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../models/order.model';

@Component({
    selector: 'app-order-detail',
    standalone: true,
    imports: [CommonModule, CurrencyPipe, DatePipe, ButtonModule, TagModule],
    templateUrl: './order-detail.component.html',
    styleUrl: './order-detail.component.css'
})
export class OrderDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private orderService = inject(OrderService);

    order: Order | null = null;

    trackingSteps = [
        { label: 'Order Placed', icon: 'pi pi-shopping-cart', key: 'pending' },
        { label: 'Confirmed', icon: 'pi pi-check', key: 'confirmed' },
        { label: 'Shipped', icon: 'pi pi-truck', key: 'shipped' },
        { label: 'Delivered', icon: 'pi pi-home', key: 'delivered' }
    ];

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.order = this.orderService.getOrderById(id);
            }
            if (!this.order) {
                this.router.navigate(['/orders']);
            }
        });
    }

    isStepComplete(stepKey: string): boolean {
        if (!this.order) return false;
        const statusOrder = ['pending', 'confirmed', 'shipped', 'delivered'];
        const currentIndex = statusOrder.indexOf(this.order.status);
        const stepIndex = statusOrder.indexOf(stepKey);
        return stepIndex <= currentIndex;
    }

    isCurrentStep(stepKey: string): boolean {
        return this.order?.status === stepKey;
    }

    getPaymentLabel(method: string): string {
        switch (method) {
            case 'credit_card': return 'Credit Card';
            case 'debit_card': return 'Debit Card';
            case 'upi': return 'UPI';
            default: return method;
        }
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

    goBack(): void {
        this.router.navigate(['/orders']);
    }

    continueShopping(): void {
        this.router.navigate(['/products']);
    }

    viewInvoice(): void {
        if (this.order) {
            this.router.navigate(['/orders', this.order.id, 'invoice']);
        }
    }
}
