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
    { path: '/dashboard', label: 'DASHBOARD', icon: 'pi pi-home', section: 'main', allowedRoles: ['owner', 'admin', 'manager', 'cashier'], requiredPermission: 'View Sales' },
    { path: '/mobile-pos', label: 'Mobile POS', icon: 'pi pi-camera', section: 'main', allowedRoles: ['owner', 'admin', 'manager', 'cashier'], requiredFeature: 'mobile_pos', requiredPermission: 'Process Sales' },
    { path: '/customers', label: 'CUSTOMERS', icon: 'pi pi-users', section: 'main', allowedRoles: ['owner', 'admin', 'manager'] },
    { path: '/reports', label: 'REPORTS', icon: 'pi pi-chart-bar', section: 'main', allowedRoles: ['owner', 'admin', 'manager'], requiredFeature: 'advanced_reports', requiredPermission: 'View Reports' },
    { path: '/reports/payments', label: 'Payment History', icon: 'pi pi-history', section: 'main', allowedRoles: ['owner', 'admin', 'manager'], requiredPermission: 'View Reports' },
    // { path: '/marketing', label: 'MARKETING', icon: 'pi pi-megaphone', section: 'main', allowedRoles: ['owner', 'admin', 'manager'], requiredPermission: 'Manage Marketing' },
    { path: '/notifications', label: 'Notifications', icon: 'pi pi-bell', section: 'main', allowedRoles: ['owner', 'admin', 'manager', 'cashier'] },
    { path: '/support', label: 'Customer Support', icon: 'pi pi-question-circle', section: 'main', allowedRoles: ['owner', 'admin', 'manager', 'cashier'] },
    { path: '/products', label: 'PRODUCTS', icon: 'pi pi-th-large', section: 'shopping', allowedRoles: ['owner', 'admin', 'manager', 'cashier'], requiredPermission: 'Manage Products' },
    { path: '/cart', label: 'Cart', icon: 'pi pi-shopping-cart', section: 'shopping', allowedRoles: ['owner', 'admin', 'manager', 'cashier'], badge: true, requiredPermission: 'Process Sales' },
    { path: '/orders', label: 'My Orders', icon: 'pi pi-list', section: 'shopping', allowedRoles: ['owner', 'admin', 'manager', 'cashier'] },
    { path: '/profile', label: 'My Profile', icon: 'pi pi-user', section: 'account', allowedRoles: ['owner', 'admin', 'manager', 'cashier'] },
    { path: '/settings/subscription', label: 'Subscription', icon: 'pi pi-credit-card', section: 'account', allowedRoles: ['owner', 'admin'], requiredPermission: 'Manage Settings' },
    { path: '/settings/products', label: 'Products', icon: 'pi pi-box', section: 'settings', allowedRoles: ['owner', 'admin', 'manager'], requiredPermission: 'Manage Products' },
    { path: '/settings/users', label: 'Users', icon: 'pi pi-users', section: 'settings', allowedRoles: ['owner', 'admin'], requiredFeature: 'team_management', requiredPermission: 'Manage Users' },
    { path: '/settings/expenses', label: 'Expenses', icon: 'pi pi-wallet', section: 'settings', allowedRoles: ['owner', 'admin', 'manager'], requiredPermission: 'Manage Expenses' },
    { path: '/settings/permissions', label: 'Permissions', icon: 'pi pi-lock', section: 'settings', allowedRoles: ['owner', 'admin'], requiredPermission: 'Manage Settings' },
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
      // Merge with default to ensure icons/labels are preserved if new ones added
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

    const role = (user.role?.toLowerCase() || 'owner') as UserRole;
    if (role === 'owner' || role === 'admin') return true; // Owner and Admin always have full access

    const permission = this.permissionsSubject.value.find(p => p.path === path);
    if (!permission) return true; // If not in list, assume allowed? Or handle fallback

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
