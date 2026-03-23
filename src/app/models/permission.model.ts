export type UserRole = 'owner' | 'admin' | 'manager' | 'cashier' | 'guest' | 'consumer';

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
