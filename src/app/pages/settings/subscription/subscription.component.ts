import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SubscriptionService } from '../../../core/services/subscription.service';
import {
  BillingCycle,
  SUBSCRIPTION_FEATURE_LABELS,
  SubscriptionFeature,
  SubscriptionPlan,
  UserSubscription,
} from '../../../models/subscription.model';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    SelectButtonModule,
    TagModule,
    ToastModule,
    DatePipe,
  ],
  providers: [MessageService],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.css',
})
export class SubscriptionComponent implements OnInit {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly messageService = inject(MessageService);

  readonly plans = this.subscriptionService.getPlans();
  readonly featureLabels = SUBSCRIPTION_FEATURE_LABELS;
  readonly featureKeys = Object.keys(SUBSCRIPTION_FEATURE_LABELS) as SubscriptionFeature[];

  currentSubscription: UserSubscription | null = null;
  selectedBillingCycle: BillingCycle = 'monthly';

  billingOptions = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
  ];

  ngOnInit(): void {
    this.subscriptionService.currentSubscription$.subscribe((subscription) => {
      this.currentSubscription = subscription;
      this.selectedBillingCycle = subscription.billingCycle;
    });
  }

  get currentPlan(): SubscriptionPlan {
    return this.subscriptionService.getPlan(this.currentSubscription?.planId || 'starter');
  }

  getPrice(plan: SubscriptionPlan): number {
    return this.selectedBillingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
  }

  getPriceSuffix(): string {
    return this.selectedBillingCycle === 'yearly' ? '/year' : '/month';
  }

  getPlanButtonLabel(plan: SubscriptionPlan): string {
    if (this.isCurrentPlan(plan.id)) {
      return 'Current Plan';
    }

    return this.subscriptionService.canAccessPlan(plan.id) ? 'Switch Plan' : 'Upgrade';
  }

  isCurrentPlan(planId: SubscriptionPlan['id']): boolean {
    return this.currentSubscription?.planId === planId;
  }

  isFeatureAvailable(plan: SubscriptionPlan, feature: SubscriptionFeature): boolean {
    return plan.features.includes(feature);
  }

  choosePlan(plan: SubscriptionPlan): void {
    if (this.isCurrentPlan(plan.id)) {
      return;
    }

    this.subscriptionService.changePlan(plan.id, this.selectedBillingCycle).subscribe(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Plan Updated',
        detail: `${plan.name} is now active for your account.`,
        life: 3000,
      });
    });
  }

  cancelPlan(): void {
    if (this.currentSubscription?.planId === 'starter') {
      return;
    }

    this.subscriptionService.cancelSubscription().subscribe(() => {
      this.messageService.add({
        severity: 'warn',
        summary: 'Subscription Canceled',
        detail: 'Your current plan will remain visible until you choose a new one.',
        life: 3000,
      });
    });
  }

  resumePlan(): void {
    this.subscriptionService.resumeSubscription().subscribe(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Subscription Resumed',
        detail: 'Auto-renew is active again.',
        life: 3000,
      });
    });
  }
}
