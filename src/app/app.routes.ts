import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { planGuard } from './auth/plan.guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./auth/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
      {
        path: 'verify-email',
        loadComponent: () =>
          import('./auth/verify-email/verify-email.component').then(
            (m) => m.VerifyEmailComponent
          ),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./auth/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
      },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'products',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/product-listing/product-listing.component').then(
            (m) => m.ProductListingComponent
          ),
      },
      {
        path: 'customers',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/customers/customers.component').then(
            (m) => m.CustomersComponent
          ),
      },
      {
        path: 'reports/payments',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/reports/payment-history/payment-history.component').then(
            (m) => m.PaymentHistoryComponent
          ),
      },
      {
        path: 'reports',
        canActivate: [authGuard, planGuard],
        data: {
          requiredFeature: 'advanced_reports',
        },
        loadComponent: () =>
          import('./pages/reports/reports.component').then(
            (m) => m.ReportsComponent
          ),
      },
      {
        path: 'support',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/support/support.component').then(
            (m) => m.SupportComponent
          ),
      },
      {
        path: 'category/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/product-listing/product-listing.component').then(
            (m) => m.ProductListingComponent
          ),
      },
      {
        path: 'cart',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/cart/cart.component').then(
            (m) => m.CartComponent
          ),
      },
      {
        path: 'checkout/address',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/checkout/address/address.component').then(
            (m) => m.AddressComponent
          ),
      },
      {
        path: 'checkout/payment',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/checkout/payment/payment.component').then(
            (m) => m.PaymentComponent
          ),
      },
      {
        path: 'checkout/confirmation',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/checkout/confirmation/confirmation.component').then(
            (m) => m.ConfirmationComponent
          ),
      },
      {
        path: 'orders',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/orders/my-orders/my-orders.component').then(
            (m) => m.MyOrdersComponent
          ),
      },
      {
        path: 'orders/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/orders/order-detail/order-detail.component').then(
            (m) => m.OrderDetailComponent
          ),
      },
      {
        path: 'orders/:id/invoice',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/orders/invoice/invoice.component').then(
            (m) => m.InvoiceComponent
          ),
      },
      {
        path: 'profile/edit',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/profile/edit-profile/edit-profile.component').then(
            (m) => m.EditProfileComponent
          ),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/profile/view-profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
      {
        path: 'settings/users',
        canActivate: [authGuard, planGuard],
        data: {
          requiredFeature: 'team_management',
          requiredRole: 'owner'
        },
        loadComponent: () =>
          import('./pages/settings/users/users.component').then(
            (m) => m.UsersComponent
          ),
      },
      {
        path: 'settings/subscription',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/settings/subscription/subscription.component').then(
            (m) => m.SubscriptionComponent
          ),
      },
      {
        path: 'settings/products',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/settings/product-management/product-management.component').then(
            (m) => m.ProductManagementComponent
          ),
      },
      {
        path: 'settings/categories',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/settings/category-management/category-management.component').then(
            (m) => m.CategoryManagementComponent
          ),
      },
      {
        path: 'settings/permissions',
        canActivate: [authGuard, planGuard],
        data: {
          requiredRole: 'owner'
        },
        loadComponent: () =>
          import('./pages/settings/permissions/permissions.component').then(
            (m) => m.PermissionsComponent
          ),
      },
      {
        path: 'settings/expenses',
        canActivate: [authGuard, planGuard],
        loadComponent: () =>
          import('./pages/settings/expenses/expenses.component').then(
            (m) => m.ExpensesComponent
          ),
      },
      {
        path: 'notifications',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/notifications/notifications.component').then(
            (m) => m.NotificationsComponent
          ),
      },
      {
        path: 'mobile-pos',
        canActivate: [authGuard, planGuard],
        data: {
          requiredFeature: 'mobile_pos',
        },
        loadComponent: () =>
          import('./pages/mobile-pos/mobile-pos.component').then(
            (m) => m.MobilePosComponent
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'products',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
