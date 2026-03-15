import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

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
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/product-listing/product-listing.component').then(
            (m) => m.ProductListingComponent
          ),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./pages/customers/customers.component').then(
            (m) => m.CustomersComponent
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/reports/reports.component').then(
            (m) => m.ReportsComponent
          ),
      },
      {
        path: 'support',
        loadComponent: () =>
          import('./pages/support/support.component').then(
            (m) => m.SupportComponent
          ),
      },
      {
        path: 'category/:id',
        loadComponent: () =>
          import('./pages/product-listing/product-listing.component').then(
            (m) => m.ProductListingComponent
          ),
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./pages/cart/cart.component').then(
            (m) => m.CartComponent
          ),
      },
      {
        path: 'checkout/address',
        loadComponent: () =>
          import('./pages/checkout/address/address.component').then(
            (m) => m.AddressComponent
          ),
      },
      {
        path: 'checkout/payment',
        loadComponent: () =>
          import('./pages/checkout/payment/payment.component').then(
            (m) => m.PaymentComponent
          ),
      },
      {
        path: 'checkout/confirmation',
        loadComponent: () =>
          import('./pages/checkout/confirmation/confirmation.component').then(
            (m) => m.ConfirmationComponent
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./pages/orders/my-orders/my-orders.component').then(
            (m) => m.MyOrdersComponent
          ),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./pages/orders/order-detail/order-detail.component').then(
            (m) => m.OrderDetailComponent
          ),
      },
      {
        path: 'orders/:id/invoice',
        loadComponent: () =>
          import('./pages/orders/invoice/invoice.component').then(
            (m) => m.InvoiceComponent
          ),
      },
      {
        path: 'profile/edit',
        loadComponent: () =>
          import('./pages/profile/edit-profile/edit-profile.component').then(
            (m) => m.EditProfileComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/view-profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
      {
        path: 'settings/users',
        loadComponent: () =>
          import('./pages/settings/users/users.component').then(
            (m) => m.UsersComponent
          ),
      },
      {
        path: 'settings/products',
        loadComponent: () =>
          import('./pages/settings/products/products.component').then(
            (m) => m.ProductsComponent
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
