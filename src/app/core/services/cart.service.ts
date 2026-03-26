import { Injectable, signal, computed, inject, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../../models/product.model';
import { CartItem } from '../../models/cart.model';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CartService {

    private platformId = inject(PLATFORM_ID);
    private readonly CART_KEY = 'vyapar-pos-cart';
    private readonly CUSTOMER_KEY = 'vyapar-pos-selected-customer';
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private cartItems = signal<CartItem[]>([]);
    private selectedCustomerSignal = signal<any | null>(null);

    readonly items = this.cartItems.asReadonly();
    readonly selectedCustomer = this.selectedCustomerSignal.asReadonly();
    readonly cartCount = computed(() => this.cartItems().reduce((sum, item) => sum + item.quantity, 0));
    readonly cartTotal = computed(() => this.cartItems().reduce((sum, item) => sum + item.subtotal, 0));
    readonly deliveryFee = computed(() => this.cartTotal() > 500 ? 0 : 40);
    readonly grandTotal = computed(() => this.cartTotal() + this.deliveryFee());
    
    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            // Load local first
            const savedCart = localStorage.getItem(this.CART_KEY);
            if (savedCart) {
                try {
                    this.cartItems.set(JSON.parse(savedCart));
                } catch (e) {
                    console.error('Failed to parse cart from localStorage', e);
                }
            }
            
            // Sync from backend if logged in
            this.authService.currentUser$.subscribe(user => {
                if (user) {
                    this.fetchCartFromBackend();
                }
            });

            const savedCustomer = localStorage.getItem(this.CUSTOMER_KEY);
            if (savedCustomer) {
                try {
                    this.selectedCustomerSignal.set(JSON.parse(savedCustomer));
                } catch (e) {
                    console.error('Failed to parse customer from localStorage', e);
                }
            }
        }

        // Persistence effect
        effect(() => {
            if (isPlatformBrowser(this.platformId)) {
                localStorage.setItem(this.CART_KEY, JSON.stringify(this.cartItems()));
                localStorage.setItem(this.CUSTOMER_KEY, JSON.stringify(this.selectedCustomerSignal()));
                
                // Sync to backend if logged in
                if (this.authService.getCurrentUser()) {
                    this.saveCartToBackend(this.cartItems());
                }
            }
        });
    }

    public fetchCartFromBackend() {
        this.http.get<any>(`${environment.apiUrl}/cart`).subscribe({
            next: (res) => {
                const items = Array.isArray(res) ? res : (res.data || []);
                if (items.length > 0) {
                    this.cartItems.set(items);
                }
            },
            error: (err) => console.error('Failed to fetch cart from BE:', err)
        });
    }

    private saveCartToBackend(items: CartItem[]) {
        this.http.post(`${environment.apiUrl}/cart`, { items }).subscribe({
            error: (err) => console.error('Failed to save cart to BE:', err)
        });
    }

    setCustomer(customer: any): void {
        this.selectedCustomerSignal.set(customer);
    }

    clearCustomer(): void {
        this.selectedCustomerSignal.set(null);
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

    removeFromCart(productId: string | number): void {
        this.cartItems.set(this.cartItems().filter(item => item.product.id != productId));
    }

    updateQuantity(productId: string | number, quantity: number): void {
        if (quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }
        const updated = this.cartItems().map(item => {
            if (item.product.id == productId) {
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
