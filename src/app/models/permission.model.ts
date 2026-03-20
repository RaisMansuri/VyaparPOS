export type UserRole = 'owner' | 'admin' | 'manager' | 'cashier' | 'guest';

export interface RoutePermission {
  path: string;
  label: string;
  icon: string;
  section?: 'main' | 'shopping' | 'account' | 'settings' | 'security';
  allowedRoles: UserRole[];
  requiredFeature?: string;
  requiredPermission?: string;
  badge?: boolean;
}
