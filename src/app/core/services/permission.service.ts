import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { SubscriptionService } from './subscription.service';
import { RoutePermission, UserRole } from '../../models/permission.model';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private auth = inject(AuthService);
  private subscription = inject(SubscriptionService);

  private readonly storageKey = 'vyaparpos_route_permissions';

  private defaultPermissions: RoutePermission[] = [
    { path: '/dashboard', label: 'DASHBOARD', icon: 'pi pi-home', section: 'overview', allowedRoles: ['superadmin', 'owner', 'admin', 'manager', 'cashier', 'accountant'], requiredPermission: 'View Sales' },
    { path: '/mobile-pos', label: 'Mobile POS', icon: 'pi pi-camera', section: 'management', allowedRoles: ['superadmin', 'owner', 'admin', 'manager', 'cashier'], requiredFeature: 'mobile_pos', requiredPermission: 'Process Sales' },
    { path: '/reports', label: 'REPORTS', icon: 'pi pi-chart-bar', section: 'management', allowedRoles: ['superadmin', 'owner', 'admin', 'manager', 'accountant', 'consumer'], requiredFeature: 'advanced_reports', requiredPermission: 'View Reports' },
    { path: '/reports/payments', label: 'Payment History', icon: 'pi pi-history', section: 'management', allowedRoles: ['superadmin', 'owner', 'admin', 'manager', 'accountant', 'consumer'], requiredPermission: 'View Reports' },
    { path: '/notifications', label: 'Notifications', icon: 'pi pi-bell', section: 'overview', allowedRoles: ['superadmin', 'owner', 'admin', 'manager', 'cashier', 'accountant', 'delivery_staff', 'consumer'] },
    { path: '/support', label: 'Customer Support', icon: 'pi pi-question-circle', section: 'help', allowedRoles: ['superadmin', 'owner', 'admin', 'manager', 'cashier', 'customer', 'consumer'] },
    { path: '/products', label: 'PRODUCTS', icon: 'pi pi-th-large', section: 'shopping', allowedRoles: ['superadmin', 'owner', 'admin', 'manager', 'cashier', 'inventory_manager', 'customer', 'consumer'], requiredPermission: 'Manage Products' },
    { path: '/cart', label: 'Cart', icon: 'pi pi-shopping-cart', section: 'shopping', allowedRoles: ['superadmin', 'owner', 'admin', 'manager', 'cashier', 'customer', 'consumer'], badge: true, requiredPermission: 'Process Sales' },
    { path: '/orders', label: 'My Orders', icon: 'pi pi-list', section: 'shopping', allowedRoles: ['superadmin', 'owner', 'admin', 'manager', 'cashier', 'delivery_staff', 'customer', 'consumer'] },
    { path: '/profile', label: 'My Profile', icon: 'pi pi-user', section: 'account', allowedRoles: ['superadmin', 'owner', 'admin', 'manager', 'cashier', 'inventory_manager', 'accountant', 'delivery_staff', 'customer', 'consumer'] },
    { path: '/settings/subscription', label: 'Subscription', icon: 'pi pi-credit-card', section: 'account', allowedRoles: ['superadmin', 'owner', 'admin'], requiredPermission: 'Manage Settings' },
    { path: '/settings/inventory-management', label: 'INVENTORY_MANAGEMENT', icon: 'pi pi-box', section: 'inventory', allowedRoles: ['superadmin', 'owner', 'admin', 'manager', 'inventory_manager'], requiredPermission: 'Manage Products' },
    { path: '/settings/categories', label: 'CATEGORIES', icon: 'pi pi-tags', section: 'inventory', allowedRoles: ['superadmin', 'owner', 'admin', 'manager', 'inventory_manager'], requiredPermission: 'Manage Products' },
    { path: '/settings/users', label: 'Users', icon: 'pi pi-users', section: 'settings', allowedRoles: ['superadmin', 'owner', 'admin'], requiredPermission: 'Manage Users' },
    { path: '/settings/expenses', label: 'Expenses', icon: 'pi pi-wallet', section: 'settings', allowedRoles: ['superadmin', 'owner', 'admin', 'manager', 'accountant'], requiredPermission: 'Manage Expenses' },
    { path: '/settings/permissions', label: 'Permissions', icon: 'pi pi-lock', section: 'settings', allowedRoles: ['superadmin', 'owner', 'admin'], requiredPermission: 'Manage Settings' },
  ];

  private permissionsSubject = new BehaviorSubject<RoutePermission[]>(this.loadPermissions());
  permissions$ = this.permissionsSubject.asObservable();

  constructor() { }

  private loadPermissions(): RoutePermission[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return this.defaultPermissions;
    }
    const raw = window.localStorage.getItem(this.storageKey);
    if (!raw) {
      return this.defaultPermissions;
    }
    try {
      const saved = JSON.parse(raw) as RoutePermission[];
      return this.defaultPermissions.map(def => {
        const found = saved.find(s => s.path === def.path);
        return found ? { ...def, allowedRoles: found.allowedRoles } : def;
      });
    } catch {
      return this.defaultPermissions;
    }
  }

  savePermissions(permissions: RoutePermission[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(this.storageKey, JSON.stringify(permissions));
    }
    this.permissionsSubject.next(permissions);
  }

  canAccess(path: string): boolean {
    const user = this.auth.getCurrentUser();
    if (!user) return false;

    const role = (user.role?.toLowerCase() || 'guest') as UserRole;
    if (role === 'superadmin' || role === 'owner') return true; // Full access

    const permission = this.permissionsSubject.value.find(p => p.path === path);
    if (!permission) return true;

    // Check User-Specific Permission (PRIORITY)
    if (permission.requiredPermission && user.permissions?.includes(permission.requiredPermission)) {
      return true;
    }

    // Check Role
    if (!permission.allowedRoles.includes(role)) {
      return false;
    }

    // Check Feature
    if (permission.requiredFeature && !this.subscription.canAccessFeature(permission.requiredFeature as any)) {
      return false;
    }

    return true;
  }

  getVisibleRoutes(): Observable<RoutePermission[]> {
    return this.permissions$.pipe(
      map(perms => perms.filter(p => this.canAccess(p.path)))
    );
  }
}
