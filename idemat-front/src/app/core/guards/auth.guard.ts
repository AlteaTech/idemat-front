import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from '../../../services/auth/auth.service';
import {routesConstantes} from '../../../constantes/routes.constantes';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!authService.isLoggedIn()) {
    authService.restoreSession();
  }

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.parseUrl('/' + routesConstantes.connexionIdemat);
};
