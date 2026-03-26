export type UserRole = 'superadmin' | 'owner' | 'admin' | 'manager' | 'cashier' | 'inventory_manager' | 'accountant' | 'customer' | 'delivery_staff' | 'guest' | 'consumer';

export interface RoutePermission {
  path: string;
  label: string;
  icon: string;
  section?: 'main' | 'shopping' | 'account' | 'settings' | 'security' | 'overview' | 'management' | 'help' | 'inventory';
  allowedRoles: UserRole[];
  requiredFeature?: string;
  requiredPermission?: string;
  badge?: boolean;
}
