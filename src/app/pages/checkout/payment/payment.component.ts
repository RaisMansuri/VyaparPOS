import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { PaymentMethod } from '../../../models/order.model';

@Component({
    selector: 'app-payment',
    standalone: true,
    imports: [
        CommonModule, CurrencyPipe, ReactiveFormsModule,
        ButtonModule, TabViewModule, InputTextModule, RadioButtonModule
    ],
    templateUrl: './payment.component.html',
    styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    cartService = inject(CartService);
    orderService = inject(OrderService);

    selectedMethod: PaymentMethod = 'upi';
    isProcessing = false;

    cardForm: FormGroup = this.fb.group({
        cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
        cardName: ['', [Validators.required]],
        expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
        cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]]
    });

    upiForm: FormGroup = this.fb.group({
        upiId: ['', [Validators.required, Validators.pattern(/^[\w.\-]+@[\w]+$/)]]
    });

    ngOnInit(): void {
        if (this.cartService.items().length === 0) {
            this.router.navigate(['/cart']);
            return;
        }
        if (!this.orderService.getAddress()) {
            this.router.navigate(['/checkout/address']);
            return;
        }
    }

    selectMethod(method: PaymentMethod): void {
        this.selectedMethod = method;
    }

    pay(): void {
        // Validate based on selected method
        if (this.selectedMethod === 'upi') {
            if (this.upiForm.invalid) {
                this.upiForm.markAllAsTouched();
                return;
            }
        } else if (this.selectedMethod === 'credit_card' || this.selectedMethod === 'debit_card') {
            if (this.cardForm.invalid) {
                this.cardForm.markAllAsTouched();
                return;
            }
        }

        this.isProcessing = true;

        // Simulate payment processing
        setTimeout(() => {
            const address = this.orderService.getAddress()!;
            this.orderService.placeOrder(
                this.cartService.items(),
                address,
                this.selectedMethod,
                this.cartService.grandTotal(),
                this.cartService.deliveryFee()
            );
            this.cartService.clearCart();
            this.isProcessing = false;
            this.router.navigate(['/checkout/confirmation']);
        }, 2000);
    }

    goBack(): void {
        this.router.navigate(['/checkout/address']);
    }

    isCardInvalid(field: string): boolean {
        const control = this.cardForm.get(field);
        return !!(control && control.invalid && control.touched);
    }

    isUpiInvalid(field: string): boolean {
        const control = this.upiForm.get(field);
        return !!(control && control.invalid && control.touched);
    }
}
