export type UserRole = 'owner' | 'manager' | 'cashier' | 'guest';

export interface RoutePermission {
  path: string;
  label: string;
  icon: string;
  section?: 'main' | 'shopping' | 'account' | 'settings' | 'security';
  allowedRoles: UserRole[];
  requiredFeature?: string;
  badge?: boolean;
}
