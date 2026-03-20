import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { SubscriptionFeature, SubscriptionPlanId } from '../models/subscription.model';
import { AuthService } from './auth.service';
import { SubscriptionService } from '../core/services/subscription.service';
import { PermissionService } from '../core/services/permission.service';

export const planGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const requiredFeature = route.data['requiredFeature'] as SubscriptionFeature | undefined;
  const requiredPlan = route.data['requiredPlan'] as SubscriptionPlanId | undefined;
  const requiredRole = route.data['requiredRole'] as string | undefined;
  const subscriptionService = inject(SubscriptionService);
  const permissionService = inject(PermissionService);

  if (!auth.isAuthenticated()) {
    router.navigate(['/auth/login'], { queryParams: { redirectTo: state.url } });
    return false;
  }

  // Owner and Admin always have full access to all routes/features/plans
  const userRole = (auth.getCurrentUser()?.role?.toLowerCase() || 'owner');
  if (userRole === 'owner' || userRole === 'admin') {
    return true;
  }

  // First check if user has access based on dynamic permission settings
  if (!permissionService.canAccess(state.url)) {
    return redirectToSubscription(router, state.url, 'dynamic_permission');
  }

  // Check Feature (additional layer)
  if (requiredFeature && !subscriptionService.canAccessFeature(requiredFeature)) {
    return redirectToSubscription(router, state.url, requiredFeature);
  }

  // Check Plan
  if (requiredPlan && !subscriptionService.canAccessPlan(requiredPlan)) {
    return redirectToSubscription(router, state.url, requiredPlan);
  }

  // Check Role
  if (requiredRole && !auth.hasRole(requiredRole) && !auth.isAdmin()) {
    return redirectToSubscription(router, state.url, `role_${requiredRole}`);
  }

  return true;
};

function redirectToSubscription(router: Router, url: string, reason: string): boolean {
  router.navigate(['/settings/subscription'], {
    queryParams: {
      redirectTo: url,
      blocked: reason,
    },
  });
  return false;
}
