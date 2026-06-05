import {HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {UserProfileModel} from '../../models/UserProfileModel';
import {storagesConstantes} from '../../constantes/storages.constantes';
import {inject} from '@angular/core';
import {AuthService} from '../../services/auth/auth.service';
import {StorageService} from '../../services/storage.service';

/**
 * Intercepteur fonctionnel pour ajouter le token d'authentification aux requêtes sortantes.
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const storageService = inject(StorageService);
  const storedUser = storageService.getLocalStorage(storagesConstantes.userSession);

  if (!storedUser) return next(req);

  try {
    const userProfile: UserProfileModel = JSON.parse(storedUser);
    const authToken = userProfile?.jwt;
    if (!authToken) return next(req);

    return next(req.clone({
      setHeaders: {Authorization: `Bearer ${authToken}`}
    }));
  } catch {
    return next(req);
  }
};
