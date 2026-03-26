import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
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
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { SubscriptionService } from '../core/services/subscription.service';
import { AuthUser } from '../auth/auth.service';
import { SubscriptionPlan } from '../models/subscription.model';
import { PermissionService } from '../core/services/permission.service';
import { RoutePermission } from '../models/permission.model';
import { Notification } from '../models/notification.model';
import { ChatbotComponent } from '../shared/components/chatbot/chatbot.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarModule, ToolbarModule, ButtonModule, BadgeModule, MenuModule, ToastModule, PopoverModule, SelectModule, FormsModule, ChatbotComponent, ConfirmDialogModule],
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
  public subscriptionService = inject(SubscriptionService);
  public permissionService = inject(PermissionService);
  private messageService = inject(MessageService);

  sidebarVisible = false;
  categories: string[] = [];
  profileMenuItems: MenuItem[] | undefined;
  notifications: Notification[] = [];
  unreadCount = 0;
  pageTitle = 'Dashboard';
  private checkInterval: any;
  currentUser: AuthUser | null = null;
  currentPlan: SubscriptionPlan | null = null;
  visibleRoutes: RoutePermission[] = [];
  private destroy$ = new Subject<void>();

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

    this.auth.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.subscriptionService.currentPlan$.subscribe(plan => {
      this.currentPlan = plan;
    });

    this.notificationService.notifications$.subscribe(n => {
      this.notifications = n;
    });

    this.notificationService.unreadCount$.subscribe(c => {
      this.unreadCount = c;
    });

    // Initial check and set interval
    this.notificationService.checkStockLevels();
    this.checkInterval = setInterval(() => {
      this.notificationService.checkStockLevels();
    }, 300000); // Check every 5 minutes

    // Subscribe to visible routes
    this.permissionService.getVisibleRoutes()
      .pipe(takeUntil(this.destroy$))
      .subscribe(routes => {
        this.visibleRoutes = routes;
      });

    this.profileMenuItems = [
      {
        label: 'My Profile',
        icon: 'pi pi-user',
        command: () => this.navigate('/profile')
      },
      {
        label: 'Manage Subscription',
        icon: 'pi pi-credit-card',
        command: () => this.navigate('/settings/subscription')
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
    this.destroy$.next();
    this.destroy$.complete();
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

  isConsumer(): boolean {
    return this.auth.isConsumer();
  }

  onNotificationClick(notification: Notification, op: any): void {
    this.notificationService.markAsRead(notification.id);
    if (notification.link) {
      this.router.navigate([notification.link]);
    }
    op.hide();
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  hasVisibleSection(section: string): boolean {
    return this.visibleRoutes.some(r => r.section === section);
  }

  getRouteLabel(route: RoutePermission): string {
    const translated = this.translationService.translate(route.label);
    return translated !== route.label ? translated : route.label;
  }

  updatePageTitle(url: string): void {
    if (url.includes('/dashboard')) this.pageTitle = this.translationService.translate('DASHBOARD') || 'Dashboard';
    else if (url.includes('/mobile-pos')) this.pageTitle = 'Mobile POS';
    // else if (url.includes('/customers')) this.pageTitle = this.translationService.translate('CUSTOMERS') || 'Customers';
    else if (url.includes('/reports')) this.pageTitle = this.translationService.translate('REPORTS') || 'Payment History';
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
    else if (url.includes('/settings/products')) this.pageTitle = this.translationService.translate('INVENTORY_MANAGEMENT') || 'Inventory Management';
    else if (url.includes('/settings/categories')) this.pageTitle = this.translationService.translate('CATEGORIES') || 'Category Management';
    else if (url.includes('/settings/subscription')) this.pageTitle = 'Subscription';
    else if (url.includes('/settings/users')) this.pageTitle = 'User Settings';
    else if (url.includes('/settings/expenses')) this.pageTitle = 'Expense Management';
    // else if (url.includes('/marketing')) this.pageTitle = 'Marketing & Promotions';
    else if (url.includes('/settings/permissions')) this.pageTitle = 'Permission Settings';
    else this.pageTitle = 'VyaparPOS';
  }

  getCategoryIcon(category: string): string {
    const normalizedCategory = category.toLowerCase();

    if (normalizedCategory.includes('bread')) return 'pi pi-box';
    if (normalizedCategory.includes('pastr')) return 'pi pi-star';
    if (normalizedCategory.includes('cake')) return 'pi pi-heart';
    if (normalizedCategory.includes('drink') || normalizedCategory.includes('beverage')) return 'pi pi-shopping-bag';
    if (normalizedCategory.includes('snack')) return 'pi pi-shopping-bag';
    if (normalizedCategory.includes('dairy')) return 'pi pi-box';
    if (normalizedCategory.includes('pie')) return 'pi pi-chart-pie';
    if (normalizedCategory.includes('cookie')) return 'pi pi-clone';

    return 'pi pi-tag';
  }
}

