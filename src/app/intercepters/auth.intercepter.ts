import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { TokenKey } from '../config';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

export function authInterceptor(
  req: HttpRequest<any>,
  next: HttpHandler
): Observable<HttpEvent<any>> {
  const authToken = localStorage.getItem(TokenKey);
  if (authToken) {
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authToken}`),
    });
    return next.handle(clonedReq);
  }
  return next.handle(req);
}

export function authResponseInterceptor(
  req: HttpRequest<any>,
  next: HttpHandler
): Observable<HttpEvent<any>> {
  const router: Router = inject(Router);

  return next.handle(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        router.navigate(['/login']);
      }
      return throwError(error);
    })
  );
}
