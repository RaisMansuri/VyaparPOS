export type SubscriptionPlanId = 'starter' | 'growth' | 'enterprise';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'expired';

export type SubscriptionFeature =
  | 'basic_inventory'
  | 'customer_management'
  | 'advanced_reports'
  | 'mobile_pos'
  | 'team_management'
  | 'priority_support';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  tagline: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  featured?: boolean;
  features: SubscriptionFeature[];
  limits: {
    users: number;
    products: number | 'unlimited';
    locations: number;
  };
}

export interface UserSubscription {
  userId: string;
  planId: SubscriptionPlanId;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  startedAt: string;
  renewsAt: string;
  cancelAtPeriodEnd: boolean;
}

export const SUBSCRIPTION_FEATURE_LABELS: Record<SubscriptionFeature, string> = {
  basic_inventory: 'Inventory and billing',
  customer_management: 'Customer management',
  advanced_reports: 'Advanced reports',
  mobile_pos: 'Mobile POS scanner',
  team_management: 'User and staff management',
  priority_support: 'Priority support',
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For a single counter getting started',
    description: 'Covers core billing, inventory, and customer basics.',
    priceMonthly: 0,
    priceYearly: 0,
    features: ['basic_inventory', 'customer_management'],
    limits: {
      users: 1,
      products: 100,
      locations: 1,
    },
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'For growing stores that need smarter operations',
    description: 'Unlocks reports, mobile billing, and priority help.',
    priceMonthly: 999,
    priceYearly: 9990,
    featured: true,
    features: [
      'basic_inventory',
      'customer_management',
      'advanced_reports',
      'mobile_pos',
      'priority_support',
    ],
    limits: {
      users: 3,
      products: 1000,
      locations: 2,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For teams managing multiple counters or stores',
    description: 'Adds team controls and larger operational limits.',
    priceMonthly: 2499,
    priceYearly: 24990,
    features: [
      'basic_inventory',
      'customer_management',
      'advanced_reports',
      'mobile_pos',
      'team_management',
      'priority_support',
    ],
    limits: {
      users: 20,
      products: 'unlimited',
      locations: 10,
    },
  },
];

export const PLAN_RANK: Record<SubscriptionPlanId, number> = {
  starter: 0,
  growth: 1,
  enterprise: 2,
};
