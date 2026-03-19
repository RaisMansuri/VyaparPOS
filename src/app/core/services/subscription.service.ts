import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import {
  BillingCycle,
  PLAN_RANK,
  SUBSCRIPTION_PLANS,
  SubscriptionFeature,
  SubscriptionPlan,
  SubscriptionPlanId,
  UserSubscription,
} from '../../models/subscription.model';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authService = inject(AuthService);
  private readonly storagePrefix = 'vyaparpos_subscription_';

  private readonly currentSubscriptionSubject = new BehaviorSubject<UserSubscription>(
    this.createDefaultSubscription('guest')
  );

  readonly currentSubscription$ = this.currentSubscriptionSubject.asObservable();
  readonly currentPlan$: Observable<SubscriptionPlan> = this.currentSubscription$.pipe(
    map((subscription) => this.getPlan(subscription.planId))
  );

  constructor() {
    this.authService.currentUser$.subscribe((user) => {
      const userId = user?.id || 'guest';
      const subscription = this.loadSubscription(userId);
      this.currentSubscriptionSubject.next(subscription);
      this.syncAuthUser(subscription);
    });
  }

  getPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  }

  getPlan(planId: SubscriptionPlanId): SubscriptionPlan {
    return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId) || SUBSCRIPTION_PLANS[0];
  }

  getCurrentSubscription(): UserSubscription {
    return this.currentSubscriptionSubject.value;
  }

  getCurrentPlan(): SubscriptionPlan {
    return this.getPlan(this.getCurrentSubscription().planId);
  }

  changePlan(
    planId: SubscriptionPlanId,
    billingCycle: BillingCycle = this.getCurrentSubscription().billingCycle
  ): Observable<UserSubscription> {
    const current = this.getCurrentSubscription();
    const nextSubscription: UserSubscription = {
      userId: current.userId,
      planId,
      billingCycle,
      status: 'active',
      startedAt: new Date().toISOString(),
      renewsAt: this.calculateRenewalDate(billingCycle),
      cancelAtPeriodEnd: false,
    };

    this.saveSubscription(nextSubscription);
    return of(nextSubscription);
  }

  cancelSubscription(): Observable<UserSubscription> {
    const updated: UserSubscription = {
      ...this.getCurrentSubscription(),
      cancelAtPeriodEnd: true,
      status: 'canceled',
    };

    this.saveSubscription(updated);
    return of(updated);
  }

  resumeSubscription(): Observable<UserSubscription> {
    const updated: UserSubscription = {
      ...this.getCurrentSubscription(),
      cancelAtPeriodEnd: false,
      status: 'active',
      renewsAt: this.calculateRenewalDate(this.getCurrentSubscription().billingCycle),
    };

    this.saveSubscription(updated);
    return of(updated);
  }

  canAccessPlan(planId: SubscriptionPlanId): boolean {
    return PLAN_RANK[this.getCurrentSubscription().planId] >= PLAN_RANK[planId];
  }

  canAccessFeature(feature: SubscriptionFeature): boolean {
    return this.getCurrentPlan().features.includes(feature);
  }

  private loadSubscription(userId: string): UserSubscription {
    if (!isPlatformBrowser(this.platformId)) {
      return this.createDefaultSubscription(userId);
    }

    const raw = localStorage.getItem(this.storageKey(userId));
    if (!raw) {
      const fallback = this.createDefaultSubscription(userId);
      this.persist(fallback);
      return fallback;
    }

    try {
      const parsed = JSON.parse(raw) as UserSubscription;
      return {
        ...parsed,
        userId,
      };
    } catch {
      const fallback = this.createDefaultSubscription(userId);
      this.persist(fallback);
      return fallback;
    }
  }

  private saveSubscription(subscription: UserSubscription): void {
    this.persist(subscription);
    this.currentSubscriptionSubject.next(subscription);
    this.syncAuthUser(subscription);
  }

  private persist(subscription: UserSubscription): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(this.storageKey(subscription.userId), JSON.stringify(subscription));
  }

  private storageKey(userId: string): string {
    return `${this.storagePrefix}${userId}`;
  }

  private createDefaultSubscription(userId: string): UserSubscription {
    return {
      userId,
      planId: 'starter',
      billingCycle: 'monthly',
      status: 'active',
      startedAt: new Date().toISOString(),
      renewsAt: this.calculateRenewalDate('monthly'),
      cancelAtPeriodEnd: false,
    };
  }

  private calculateRenewalDate(billingCycle: BillingCycle): string {
    const next = new Date();
    next.setDate(next.getDate() + (billingCycle === 'yearly' ? 365 : 30));
    return next.toISOString();
  }

  private syncAuthUser(subscription: UserSubscription): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return;
    }

    const plan = this.getPlan(subscription.planId);
    if (
      currentUser.subscriptionPlanId === plan.id &&
      currentUser.subscriptionPlanName === plan.name &&
      currentUser.subscriptionStatus === subscription.status &&
      currentUser.subscriptionRenewalDate === subscription.renewsAt
    ) {
      return;
    }

    this.authService.updateProfile({
      subscriptionPlanId: plan.id,
      subscriptionPlanName: plan.name,
      subscriptionStatus: subscription.status,
      subscriptionRenewalDate: subscription.renewsAt,
    });
  }
}
