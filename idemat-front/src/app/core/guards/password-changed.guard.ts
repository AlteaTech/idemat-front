import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from '../../../services/auth/auth.service';
import {routesConstantes} from '../../../constantes/routes.constantes';

export const passwordChangedGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.hasChangedPassword()) {
    return router.parseUrl('/' + routesConstantes.modificationMotDePasseIdemat);
  }

  return true;
};
