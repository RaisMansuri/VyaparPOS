import { Component, OnInit, OnDestroy, AfterViewInit, ViewChildren, QueryList, ElementRef, inject, HostListener } from '@angular/core';
import { Product } from '../../models/product.model';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { SidebarModule } from 'primeng/sidebar';
import { SelectModule } from 'primeng/select';
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
    FormsModule, 
    SidebarModule, 
    SelectModule, 
    InputSwitchModule, 
    TagModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule
  ],
  templateUrl: './product-listing.component.html',
  styleUrls: ['./product-listing.component.css']
})
export class ProductListingComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChildren('productGrid') productGrids!: QueryList<ElementRef>;

  private scrollIntervals: any[] = [];
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);

  allProducts: Product[] = [];
  products: Product[] = [];
  groupedProducts: { [key: string]: Product[] } = {};
  categorySections: Array<{ name: string; products: Product[] }> = [];
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
      
      this.toastService.success('Barcode Scanned', `${product.name} added to cart`);
    } else {
      console.warn('BEEP-BEEP! Barcode not recognized:', barcode);
      this.toastService.warn('Barcode Not Found', `No product matches barcode: ${barcode}`);
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
    // Explicitly trigger a refresh from the service for page-wise loading
    this.productService.getProducts().subscribe();

    this.productService.products$.subscribe(products => {
      this.allProducts = products;
      this.categories = [...new Set(products.map(p => p.category))];

      if (this.currentCategory && this.currentCategory !== 'all') {
        const found = this.categories.find(c => c.toLowerCase() === this.currentCategory?.toLowerCase());
        this.selectedCategory = found || this.currentCategory;
      } else {
        this.selectedCategory = 'all';
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

    this.categorySections =
      this.selectedCategory !== 'all'
        ? this.groupedProducts[this.selectedCategory]
          ? [{ name: this.selectedCategory, products: this.groupedProducts[this.selectedCategory] }]
          : []
        : this.categories
            .filter((category) => this.groupedProducts[category]?.length)
            .map((category) => ({
              name: category,
              products: this.groupedProducts[category],
            }));
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
        this.toastService.success('Added to Cart', `${product.name} added successfully`);
    } else {
        this.toastService.warn('Out of Stock', `Cannot add more ${product.name}. Stock limit reached.`);
    }
  }

  decrementQuantity(productId: string | number, event?: Event): void {
      if (event) {
          event.stopPropagation();
      }
      const currentQty = this.getCartQuantity(productId);
      if (currentQty > 0) {
          this.cartService.updateQuantity(productId, currentQty - 1);
      }
  }

  getCartQuantity(productId: string | number): number {
      const item = this.cartService.items().find(i => i.product.id == productId);
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

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  getCategoryProductCount(category: string): number {
    return this.allProducts.filter((product) => product.category === category).length;
  }

  getCategoryAvailabilityLabel(category: string): string {
    const count = this.getCategoryProductCount(category);
    return `${count} product${count === 1 ? '' : 's'} available`;
  }

  getCategoryIcon(category: string): string {
    const normalizedCategory = category.toLowerCase();

    if (normalizedCategory.includes('bread')) return 'pi pi-box';
    if (normalizedCategory.includes('pastr')) return 'pi pi-star';
    if (normalizedCategory.includes('cake')) return 'pi pi-heart';
    if (normalizedCategory.includes('drink') || normalizedCategory.includes('beverage')) return 'pi pi-shopping-bag';
    if (normalizedCategory.includes('snack')) return 'pi pi-shopping-bag';
    if (normalizedCategory.includes('dairy')) return 'pi pi-box';

    return 'pi pi-tag';
  }
}
