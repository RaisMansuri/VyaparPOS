import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { SubscriptionFeature, SubscriptionPlanId } from '../models/subscription.model';
import { AuthService } from './auth.service';
import { SubscriptionService } from '../core/services/subscription.service';

export const planGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const subscriptionService = inject(SubscriptionService);
  const requiredFeature = route.data['requiredFeature'] as SubscriptionFeature | undefined;
  const requiredPlan = route.data['requiredPlan'] as SubscriptionPlanId | undefined;
  const requiredRole = route.data['requiredRole'] as string | undefined;

  if (!auth.isAuthenticated()) {
    router.navigate(['/auth/login'], { queryParams: { redirectTo: state.url } });
    return false;
  }

  // Check Feature
  if (requiredFeature && !subscriptionService.canAccessFeature(requiredFeature)) {
    return redirectToSubscription(router, state.url, requiredFeature);
  }

  // Check Plan
  if (requiredPlan && !subscriptionService.canAccessPlan(requiredPlan)) {
    return redirectToSubscription(router, state.url, requiredPlan);
  }

  // Check Role
  if (requiredRole && !auth.hasRole(requiredRole)) {
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
