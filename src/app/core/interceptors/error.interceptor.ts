import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { catchError, throwError } from 'rxjs';

/**
 * Universal Error Interceptor to handle API failures globally.
 * Displays user-friendly toast notifications for different error types.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Check if we should skip the global toast for this request
      const skipToast = req.headers.has('X-Skip-Error-Toast');
      
      let errorMessage = 'Something went wrong. Please try again later.';
      let errorTitle = 'API Error';
      
      if (error.error instanceof ErrorEvent) {
        // A client-side or network error occurred.
        errorMessage = `Connection Error: ${error.error.message}`;
      } else {
        // The backend returned an unsuccessful response code.
        if (error.status === 0) {
          errorMessage = 'Unable to reach the server. Please check your connection.';
          errorTitle = 'Connection Failed';
        } else if (error.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
          errorTitle = 'Unauthorized';
          // Optional: Add logout logic here via AuthService
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
          errorTitle = 'Access Denied';
        } else if (error.status === 404) {
          errorMessage = 'The requested resource was not found.';
          errorTitle = 'Not Found';
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        }
      }
      
      console.error(`[Global Error Interceptor] ${errorTitle}:`, error);
      
      if (!skipToast) {
        toastService.error(errorTitle, errorMessage);
      }
      
      return throwError(() => error);
    })
  );
};
