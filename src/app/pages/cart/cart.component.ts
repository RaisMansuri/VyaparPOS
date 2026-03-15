import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, CurrencyPipe, ButtonModule, TableModule, TagModule],
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.css'
})
export class CartComponent {
    cartService = inject(CartService);
    private router = inject(Router);

    increaseQty(productId: number, currentQty: number): void {
        this.cartService.updateQuantity(productId, currentQty + 1);
    }

    decreaseQty(productId: number, currentQty: number): void {
        this.cartService.updateQuantity(productId, currentQty - 1);
    }

    removeItem(productId: number): void {
        this.cartService.removeFromCart(productId);
    }

    continueShopping(): void {
        this.router.navigate(['/products']);
    }

    proceedToCheckout(): void {
        this.router.navigate(['/checkout/address']);
    }
}
