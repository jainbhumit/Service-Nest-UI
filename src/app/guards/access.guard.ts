import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

export class accessGuard {
  path: string;
  constructor(path: string) {
    this.path = path;
  }
  acessGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) => {
    const router = inject(Router);
    const previousUrl =
      router.getCurrentNavigation()?.previousNavigation?.finalUrl;

    if (previousUrl && previousUrl.toString().includes(this.path)) {
      return true;
    } else {
      router.navigate([this.path]);
      return false;
    }
  };
}
