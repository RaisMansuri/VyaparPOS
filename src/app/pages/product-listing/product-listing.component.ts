import { Component, OnInit, OnDestroy, AfterViewInit, ViewChildren, QueryList, ElementRef, inject, HostListener } from '@angular/core';
import { Product } from '../../models/product.model';
import { CommonModule, CurrencyPipe, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { MessageService } from 'primeng/api';
import { SidebarModule } from 'primeng/sidebar';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-product-listing',
  standalone: true,
  imports: [
    CommonModule, 
    CurrencyPipe, 
    KeyValuePipe, 
    FormsModule, 
    ToastModule, 
    SidebarModule, 
    DropdownModule, 
    InputSwitchModule, 
    TagModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule
  ],
  providers: [MessageService],
  templateUrl: './product-listing.component.html',
  styleUrls: ['./product-listing.component.css']
})
export class ProductListingComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChildren('productGrid') productGrids!: QueryList<ElementRef>;

  private scrollIntervals: any[] = [];
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private messageService = inject(MessageService);

  allProducts: Product[] = [];
  products: Product[] = [];
  groupedProducts: { [key: string]: Product[] } = {};
  currentCategory: string | null = null;

  // UI state
  viewMode: 'grid' | 'list' = 'grid';
  sortOptions = [
    { label: 'Default', value: 'default' },
    { label: 'Price: Low to High', value: 'price-low' },
    { label: 'Price: High to Low', value: 'price-high' },
    { label: 'Name: A-Z', value: 'name-az' },
    { label: 'Name: Z-A', value: 'name-za' },
    { label: 'Highest Discount', value: 'discount' }
  ];

  // Barcode state
  private barcodeBuffer = '';
  private lastKeyTime = 0;

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const currentTime = new Date().getTime();

    // Check if it's a barcode scanner (fast typing)
    if (currentTime - this.lastKeyTime > 100) {
      this.barcodeBuffer = '';
    }

    if (event.key === 'Enter') {
      if (this.barcodeBuffer.length > 3) {
        this.processBarcode(this.barcodeBuffer);
        this.barcodeBuffer = '';
      }
    } else if (event.key.length === 1) {
      this.barcodeBuffer += event.key;
    }

    this.lastKeyTime = currentTime;
  }

  private processBarcode(barcode: string): void {
    // Try finding by exact barcode match first
    let product = this.allProducts.find(p => p.barcode === barcode);
    
    // Fallback to id or partial name if barcode not found (optional, depending on business rule)
    if (!product) {
      product = this.allProducts.find(p => p.id.toString() === barcode);
    }

    if (product) {
      this.addToCart(product);
      // Play a beep sound (simulated by console log for now)
      console.log('BEEP! Product found via barcode:', product.name);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Barcode Scanned',
        detail: `${product.name} added to cart`,
        life: 2000
      });
    } else {
      console.warn('BEEP-BEEP! Barcode not recognized:', barcode);
      this.messageService.add({
        severity: 'warn',
        summary: 'Barcode Not Found',
        detail: `No product matches barcode: ${barcode}`,
        life: 3000
      });
    }
  }

  // For testing purposes: manually simulate a scan
  simulateScan(barcode: string): void {
    this.processBarcode(barcode);
  }

  // Filter state
  searchQuery = '';
  selectedCategory = 'all';
  sortBy = 'default';
  priceRange = 'all';
  showDiscountOnly = false;
  categories: string[] = [];
  activeFilterCount = 0;

  // View mode
  showFilterPanel = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.currentCategory = params.get('id');
      if (this.currentCategory) {
        this.selectedCategory = this.currentCategory;
      }
      this.loadProducts();
    });
  }

  private loadProducts(): void {
    this.productService.products$.subscribe(products => {
      this.allProducts = products;
      this.categories = [...new Set(products.map(p => p.category))];

      if (this.currentCategory && this.currentCategory !== 'all') {
        this.selectedCategory = this.currentCategory;
      }

      this.applyFilters();
    });
  }

  applyFilters(): void {
    let filtered = [...this.allProducts];

    // Category filter
    if (this.selectedCategory && this.selectedCategory !== 'all') {
      filtered = filtered.filter(p =>
        p.category.toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }

    // Search by name
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Price range
    switch (this.priceRange) {
      case 'under50':
        filtered = filtered.filter(p => this.getDiscountedPrice(p) < 50);
        break;
      case '50to100':
        filtered = filtered.filter(p => {
          const price = this.getDiscountedPrice(p);
          return price >= 50 && price <= 100;
        });
        break;
      case '100to200':
        filtered = filtered.filter(p => {
          const price = this.getDiscountedPrice(p);
          return price >= 100 && price <= 200;
        });
        break;
      case 'above200':
        filtered = filtered.filter(p => this.getDiscountedPrice(p) > 200);
        break;
    }

    // Discount only
    if (this.showDiscountOnly) {
      filtered = filtered.filter(p => p.discount && p.discount.value > 0);
    }

    // Sort
    switch (this.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => this.getDiscountedPrice(a) - this.getDiscountedPrice(b));
        break;
      case 'price-high':
        filtered.sort((a, b) => this.getDiscountedPrice(b) - this.getDiscountedPrice(a));
        break;
      case 'name-az':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-za':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'discount':
        filtered.sort((a, b) => (b.discount?.value || 0) - (a.discount?.value || 0));
        break;
    }

    this.products = filtered;
    this.groupProducts();
    this.updateFilterCount();
    setTimeout(() => this.initAutoScrollIntervals(), 100);
  }

  updateFilterCount(): void {
    let count = 0;
    if (this.searchQuery.trim()) count++;
    if (this.selectedCategory !== 'all') count++;
    if (this.priceRange !== 'all') count++;
    if (this.sortBy !== 'default') count++;
    if (this.showDiscountOnly) count++;
    this.activeFilterCount = count;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = this.currentCategory || 'all';
    this.priceRange = 'all';
    this.sortBy = 'default';
    this.showDiscountOnly = false;
    this.applyFilters();
  }

  private groupProducts(): void {
    this.groupedProducts = this.products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {} as { [key: string]: Product[] });
  }

  ngAfterViewInit(): void {
    this.startAutoScroll();
  }

  ngOnDestroy(): void {
    this.stopAutoScroll();
  }

  private startAutoScroll(): void {
    this.productGrids.changes.subscribe(() => {
      this.initAutoScrollIntervals();
    });

    if (this.productGrids.length > 0) {
      this.initAutoScrollIntervals();
    }
  }

  public initAutoScrollIntervals(): void {
    this.stopAutoScroll();

    this.productGrids.forEach((grid) => {
      const element = grid.nativeElement;
      if (element.scrollWidth > element.clientWidth) {
        const interval = setInterval(() => {
          if (element.scrollLeft + element.clientWidth >= element.scrollWidth - 1) {
            element.scrollLeft = 0;
          } else {
            element.scrollLeft += 1;
          }
        }, 50);
        this.scrollIntervals.push(interval);
      }
    });
  }

  public stopAutoScroll(): void {
    this.scrollIntervals.forEach(interval => clearInterval(interval));
    this.scrollIntervals = [];
  }

  addToCart(product: Product, event?: Event): void {
    if (event) {
        event.stopPropagation();
    }
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

  decrementQuantity(productId: number, event?: Event): void {
      if (event) {
          event.stopPropagation();
      }
      const currentQty = this.getCartQuantity(productId);
      if (currentQty > 0) {
          this.cartService.updateQuantity(productId, currentQty - 1);
      }
  }

  getCartQuantity(productId: number): number {
      const item = this.cartService.items().find(i => i.product.id === productId);
      return item ? item.quantity : 0;
  }

  getAvailableStock(product: Product): number {
      return product.stock - this.getCartQuantity(product.id);
  }

  getDiscountedPrice(product: Product): number {
    if (product.discount) {
      const discountAmount = (product.price * product.discount.value) / 100;
      return product.price - discountAmount;
    }
    return product.price;
  }
}
