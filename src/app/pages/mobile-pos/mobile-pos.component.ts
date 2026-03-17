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

  ngOnInit(): void {
    this.productService.getProductsByCategory('all').subscribe(products => {
      this.allProducts = products;
      // Show top 6 items as "Quick Add" (could be logic-based later)
      this.quickAddProducts = products.slice(0, 6);
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

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
  }

  goToCheckout(): void {
    this.router.navigate(['/cart']);
  }

  get filteredProducts(): Product[] {
    if (!this.searchQuery.trim()) return [];
    const query = this.searchQuery.toLowerCase().trim();
    return this.allProducts.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query)
    ).slice(0, 5);
  }

  getDiscountedPrice(product: Product): number {
    if (product.discount) {
      const discountAmount = (product.price * product.discount.value) / 100;
      return product.price - discountAmount;
    }
    return product.price;
  }
}
