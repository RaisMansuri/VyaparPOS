import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarModule } from 'primeng/sidebar';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../auth/auth.service';
import { ProductService } from '../core/services/product.service';
import { ThemeService } from '../core/services/theme.service';
import { CartService } from '../core/services/cart.service';
import { NotificationService } from '../core/services/notification.service';
import { TranslationService } from '../core/services/translation.service';
import { BadgeModule } from 'primeng/badge';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarModule, ToolbarModule, ButtonModule, BadgeModule, MenuModule, ToastModule, OverlayPanelModule, DropdownModule, FormsModule],
  providers: [MessageService],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private router = inject(Router);
  private productService = inject(ProductService);
  public themeService = inject(ThemeService);
  public cartService = inject(CartService);
  public notificationService = inject(NotificationService);
  public translationService = inject(TranslationService);
  private messageService = inject(MessageService);

  sidebarVisible = false;
  categories: string[] = [];
  profileMenuItems: MenuItem[] | undefined;
  lowStockItems: any[] = [];
  pageTitle = 'Dashboard';
  private checkInterval: any;

  languages = [
    { label: 'English', value: 'en' },
    { label: 'Hindi', value: 'hi' }
  ];
  selectedLang = 'en';

  ngOnInit() {
    // Listen to route changes to update page title
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updatePageTitle(event.urlAfterRedirects);
    });
    // Set initial title
    this.updatePageTitle(this.router.url);

    this.productService.getCategories().subscribe(cats => {
      this.categories = cats;
    });

    this.translationService.currentLang$.subscribe(lang => {
      this.selectedLang = lang;
    });

    this.notificationService.lowStockAlerts$.subscribe(items => {
      this.lowStockItems = items;
      if (items.length > 0) {
        this.messageService.add({
          severity: 'warn',
          summary: this.translationService.translate('LOW_STOCK_ALERT'),
          detail: `You have ${items.length} items with low stock.`,
          life: 5000
        });
      }
    });

    // Initial check and set interval
    this.notificationService.checkStockLevels();
    this.checkInterval = setInterval(() => {
      this.notificationService.checkStockLevels();
    }, 300000); // Check every 5 minutes

    this.profileMenuItems = [
      {
        label: 'My Profile',
        icon: 'pi pi-user',
        command: () => this.navigate('/profile')
      },
      {
        separator: true
      },
      {
        label: this.translationService.translate('LOGOUT'),
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      }
    ];
  }

  onLanguageChange(event: any): void {
    this.translationService.setLanguage(event.value);
  }

  ngOnDestroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  navigate(path: string): void {
    this.router.navigate([path]);
    this.sidebarVisible = false;
  }

  logout(): void {
    this.auth.logout();
  }

  updatePageTitle(url: string): void {
    if (url.includes('/dashboard')) this.pageTitle = this.translationService.translate('DASHBOARD') || 'Dashboard';
    else if (url.includes('/mobile-pos')) this.pageTitle = 'Mobile POS';
    else if (url.includes('/customers')) this.pageTitle = this.translationService.translate('CUSTOMERS') || 'Customers';
    else if (url.includes('/reports')) this.pageTitle = this.translationService.translate('REPORTS') || 'Reports';
    else if (url.includes('/support')) this.pageTitle = 'Customer Support';
    else if (url.includes('/products')) this.pageTitle = this.translationService.translate('PRODUCTS') || 'Products';
    else if (url.includes('/category/')) {
        const cat = url.split('/').pop();
        // Capitalize first letter
        this.pageTitle = cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'Category';
    }
    else if (url.includes('/cart')) this.pageTitle = 'Cart';
    else if (url.includes('/orders')) this.pageTitle = 'My Orders';
    else if (url.includes('/profile')) this.pageTitle = 'My Profile';
    else if (url.includes('/settings/products')) this.pageTitle = 'Product Settings';
    else if (url.includes('/settings/users')) this.pageTitle = 'User Settings';
    else this.pageTitle = 'VyaparPOS';
  }
}

