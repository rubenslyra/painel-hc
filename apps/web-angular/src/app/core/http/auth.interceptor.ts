import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '@app/core/auth/auth.service';
import { Router } from '@angular/router';

/** Anexa Bearer e, em 401, tenta refresh uma única vez. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const tokens = auth.tokens();
  const withAuth = tokens ? req.clone({ setHeaders: { Authorization: `Bearer ${tokens.accessToken}` } }) : req;

  return next(withAuth).pipe(catchError(err => {
    if (err?.status !== 401 || req.url.includes('/auth/')) return throwError(() => err);
    return from(auth.refresh()).pipe(switchMap(t => {
      if (!t) { router.navigate(['/login']); return throwError(() => err); }
      return next(req.clone({ setHeaders: { Authorization: `Bearer ${t.accessToken}` } }));
    }));
  }));
};
