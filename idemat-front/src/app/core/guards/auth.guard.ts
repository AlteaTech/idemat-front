import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from '../../../services/auth/auth.service';
import {StorageService} from '../../../services/storage.service';
import {storagesConstantes} from '../../../constantes/storages.constantes';
import {routesConstantes} from '../../../constantes/routes.constantes';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const storageService = inject(StorageService);

  if (!authService.isLoggedIn()) {
    authService.restoreSession();
  }

  if (authService.isLoggedIn()) {
    return true;
  }

  const slug = storageService.getLocalStorage(storagesConstantes.contratSlug);
  return router.parseUrl('/' + (slug ?? routesConstantes.lienInvalide));
};
