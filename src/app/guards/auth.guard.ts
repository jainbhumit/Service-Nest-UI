import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import jwt_decode, { jwtDecode, JwtPayload } from 'jwt-decode';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('authToken');
  const authService = inject(AuthService);
  if (token) {
    try {
      const decodedToken = jwtDecode<JwtPayload>(
        token
      ) as unknown as JwtPayload;

      if (
        decodedToken &&
        typeof decodedToken === 'object' &&
        'role' in decodedToken
      ) {
        const userRole = (decodedToken as any).role;
        const url = state.url;
        authService.userRole.set(userRole);
        if (url.startsWith('/householder') && userRole === 'Householder') {
          return true;
        }
        if (url.startsWith('/provider') && userRole === 'ServiceProvider') {
          return true;
        }
        if (url.startsWith('/admin') && userRole === 'Admin') {
          return true;
        }

        return router.parseUrl('/unauthorized');
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      return router.parseUrl('/login'); // Redirect to login if decoding fails
    }
  }
  // Redirect to login if no token is found
  return router.parseUrl('/login');
};
