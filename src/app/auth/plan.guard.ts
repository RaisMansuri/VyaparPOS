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

  if (!auth.isAuthenticated()) {
    router.navigate(['/auth/login'], { queryParams: { redirectTo: state.url } });
    return false;
  }

  if (requiredFeature && subscriptionService.canAccessFeature(requiredFeature)) {
    return true;
  }

  if (requiredPlan && subscriptionService.canAccessPlan(requiredPlan)) {
    return true;
  }

  router.navigate(['/settings/subscription'], {
    queryParams: {
      redirectTo: state.url,
      blocked: requiredFeature || requiredPlan || 'subscription',
    },
  });
  return false;
};
