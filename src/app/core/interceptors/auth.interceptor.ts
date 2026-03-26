import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';

/**
 * Functional Interceptor to attach JWT token to all outgoing API requests.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Check for session timeout
  if (authService.isAuthenticated() && authService.isSessionExpired()) {
    authService.logout();
    // Pass original request as logout will trigger navigation anyway
    return next(req);
  }

  const user = authService.getCurrentUser();
  const token = user?.token;

  // Clone the request and add the authorization header if we have a token
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  // If no token, just pass the original request
  return next(req);
};
