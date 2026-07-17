import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

/**
 * Global auth-error handler. If any request comes back 401 (invalid/expired
 * token) or 403 (not an admin), the stored session is no longer usable, so we
 * clear it and send the user to the login page instead of leaving each page to
 * fail with a confusing "load failed" message.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthError = error.status === 401 || error.status === 403;
      const isLoginRequest = req.url.includes('/auth/login');

      if (isAuthError && !isLoginRequest && typeof localStorage !== 'undefined') {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        toast.error('Session expired', 'Please sign in again.');
        router.navigate(['/admin/login']);
      }
      return throwError(() => error);
    })
  );
};
