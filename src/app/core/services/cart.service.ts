import { Injectable, signal, computed, inject, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../../models/product.model';
import { CartItem } from '../../models/cart.model';

@Injectable({
    providedIn: 'root'
})
export class CartService {

    private platformId = inject(PLATFORM_ID);
    private readonly CART_KEY = 'vyapar-pos-cart';
    private cartItems = signal<CartItem[]>([]);

    readonly items = this.cartItems.asReadonly();
    readonly cartCount = computed(() => this.cartItems().reduce((sum, item) => sum + item.quantity, 0));
    readonly cartTotal = computed(() => this.cartItems().reduce((sum, item) => sum + item.subtotal, 0));
    readonly deliveryFee = computed(() => this.cartTotal() > 500 ? 0 : 40);
    readonly grandTotal = computed(() => this.cartTotal() + this.deliveryFee());

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            const savedCart = localStorage.getItem(this.CART_KEY);
            if (savedCart) {
                try {
                    this.cartItems.set(JSON.parse(savedCart));
                } catch (e) {
                    console.error('Failed to parse cart from localStorage', e);
                }
            }
        }

        // Persistence effect
        effect(() => {
            const items = this.cartItems();
            if (isPlatformBrowser(this.platformId)) {
                localStorage.setItem(this.CART_KEY, JSON.stringify(items));
            }
        });
    }

    addToCart(product: Product, quantity: number = 1): void {
        const currentItems = this.cartItems();
        const existingIndex = currentItems.findIndex(item => item.product.id === product.id);

        if (existingIndex > -1) {
            const updated = [...currentItems];
            const newQty = updated[existingIndex].quantity + quantity;
            updated[existingIndex] = {
                ...updated[existingIndex],
                quantity: newQty,
                subtotal: this.calcSubtotal(product, newQty)
            };
            this.cartItems.set(updated);
        } else {
            this.cartItems.set([
                ...currentItems,
                {
                    product,
                    quantity,
                    subtotal: this.calcSubtotal(product, quantity)
                }
            ]);
        }
    }

    removeFromCart(productId: number): void {
        this.cartItems.set(this.cartItems().filter(item => item.product.id !== productId));
    }

    updateQuantity(productId: number, quantity: number): void {
        if (quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }
        const updated = this.cartItems().map(item => {
            if (item.product.id === productId) {
                return {
                    ...item,
                    quantity,
                    subtotal: this.calcSubtotal(item.product, quantity)
                };
            }
            return item;
        });
        this.cartItems.set(updated);
    }

    clearCart(): void {
        this.cartItems.set([]);
    }

    private calcSubtotal(product: Product, quantity: number): number {
        let price = product.price;
        if (product.discount) {
            price = price - (price * product.discount.value / 100);
        }
        return price * quantity;
    }
}
