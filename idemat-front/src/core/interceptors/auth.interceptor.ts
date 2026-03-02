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
  //    (La clé 'auth_token' est un exemple, vous pouvez l'adapter).
  let authToken = ""

  let authService = inject(AuthService);
  let storageService = inject(StorageService);
  const storedUser = storageService.getLocalStorage(storagesConstantes.userSession);
  
  if (storedUser) {
    try {
      authService.restoreSession();
      const userProfile: UserProfileModel = JSON.parse(storedUser);
      authToken = authService.user()!.jwt;
    } catch (e) {
      console.log(e);
    }
  } else {
    return next(req);
  }
  // 2. Si le token n'existe pas, on laisse la requête continuer sans la modifier.
  if (!authToken) {
    return next(req);
  }

  // 3. Si le token existe, on clone la requête pour y ajouter le header d'authentification.
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authToken}`
    }
  });

  // 4. On passe la nouvelle requête (avec le header) à la suite de la chaîne.
  return next(authReq);
};
