import { Component, inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, CurrencyPipe, ButtonModule, TableModule, TagModule, TooltipModule],
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.css'
})
export class CartComponent {
    cartService = inject(CartService);
    private router = inject(Router);
    private toastService = inject(ToastService);
    private confirmationService = inject(ConfirmationService);

    increaseQty(productId: number | string, currentQty: number): void {
        this.cartService.updateQuantity(productId, currentQty + 1);
    }

    decreaseQty(productId: number | string, currentQty: number): void {
        this.cartService.updateQuantity(productId, currentQty - 1);
    }

    removeItem(productId: number | string): void {
        const item = this.cartService.items().find(i => i.product.id == productId);
        this.confirmationService.confirm({
            message: `<b>${item?.product.name}</b> will be removed from your cart?`,
            header: 'Remove item?',
            icon: 'pi pi-trash',
            acceptLabel: 'Remove',
            rejectLabel: 'Keep it',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                this.cartService.removeFromCart(productId);
                this.toastService.info('Item Removed', 'Product has been removed from your cart.');
            }
        });
    }

    continueShopping(): void {
        this.router.navigate(['/products']);
    }

    proceedToCheckout(): void {
        this.router.navigate(['/checkout/address']);
    }
}
