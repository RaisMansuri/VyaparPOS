import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../models/product.model';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CustomerService } from '../../core/services/customer.service';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-mobile-pos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ZXingScannerModule,
    ButtonModule,
    ToastModule,
    CardModule,
    InputTextModule,
    TagModule,
    AutoCompleteModule,
    CurrencyPipe
  ],
  providers: [MessageService],
  templateUrl: './mobile-pos.component.html',
  styleUrls: ['./mobile-pos.component.css']
})
export class MobilePosComponent implements OnInit {
  private productService = inject(ProductService);
  public cartService = inject(CartService);
  private messageService = inject(MessageService);
  private router = inject(Router);


  // Scanner state
  allowedFormats = [
    BarcodeFormat.QR_CODE,
    BarcodeFormat.EAN_13,
    BarcodeFormat.CODE_128,
    BarcodeFormat.DATA_MATRIX
  ];
  scannerEnabled = true;
  hasDevices = false;
  hasPermission = false;

  // Search and inventory
  searchQuery = '';
  allProducts: Product[] = [];
  quickAddProducts: Product[] = [];
  lastScannedProduct: Product | null = null;
  
  categories = ['All', 'Breads', 'Cakes', 'Pastries', 'Drinks'];
  selectedCategory = 'All';

  ngOnInit(): void {
    // Explicitly trigger a refresh from the service for page-wise loading
    this.productService.getProducts().subscribe();

    this.productService.getProductsByCategory('all').subscribe(products => {
      this.allProducts = products;
      // Show all items initially (removed 6 item limit)
      this.quickAddProducts = products;
    });

  }


  onCodeResult(resultString: string): void {
    const product = this.allProducts.find(p => p.barcode === resultString || p.id.toString() === resultString);
    
    if (product) {
      this.addToCart(product);
      this.lastScannedProduct = product;
      this.messageService.add({
        severity: 'success',
        summary: 'Scanned',
        detail: `${product.name} added to cart`,
        life: 2000
      });
      
      // Briefly disable scanner to prevent multiple rapid scans
      this.scannerEnabled = false;
      setTimeout(() => this.scannerEnabled = true, 1500);
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Not Found',
        detail: `No product matches: ${resultString}`,
        life: 3000
      });
    }
  }

  onHasDevices(hasDevices: boolean): void {
    this.hasDevices = hasDevices;
  }

  onPermissionResponse(hasPermission: boolean): void {
    this.hasPermission = hasPermission;
  }

  addToCart(product: Product, event?: Event): void {
    if (event) {
        event.stopPropagation();
    }
    // Check stock limit before adding
    if (this.getAvailableStock(product) > 0) {
        this.cartService.addToCart(product, 1);
    } else {
        this.messageService.add({
            severity: 'warn',
            summary: 'Out of Stock',
            detail: `Cannot add more ${product.name}. Stock limit reached.`,
            life: 2000
        });
    }
  }

  decrementQuantity(productId: string | number, event: Event): void {
      event.stopPropagation();
      const currentQty = this.getCartQuantity(productId);
      if (currentQty > 0) {
          this.cartService.updateQuantity(productId, currentQty - 1);
      }
  }

  goToCheckout(): void {
    this.router.navigate(['/cart']);
  }

  get filteredProducts(): Product[] {
    let filtered = this.allProducts;
    
    if (this.selectedCategory !== 'All') {
        filtered = filtered.filter(p => p.category.toLowerCase().includes(this.selectedCategory.toLowerCase()));
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      return filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query)
      ); // Removed .slice(0, 5) to show all search matches
    }
    
    return [];
  }
  
  selectCategory(category: string): void {
      this.selectedCategory = category;
      if(category === 'All') {
          this.quickAddProducts = this.allProducts; // Removed .slice(0, 6)
      } else {
          this.quickAddProducts = this.allProducts.filter(p => p.category.toLowerCase().includes(category.toLowerCase())); // Removed .slice(0, 6)
      }
  }

  getDiscountedPrice(product: Product): number {
    if (product.discount) {
      const discountAmount = (product.price * product.discount.value) / 100;
      return product.price - discountAmount;
    }
    return product.price;
  }

  isInCart(productId: string | number): boolean {
    return this.cartService.items().some(item => item.product.id == productId);
  }

  getCartQuantity(productId: string | number): number {
      const item = this.cartService.items().find(i => i.product.id == productId);
      return item ? item.quantity : 0;
  }

  getAvailableStock(product: Product): number {
      return product.stock - this.getCartQuantity(product.id);
  }
}
