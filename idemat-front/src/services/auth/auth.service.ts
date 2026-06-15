import {inject, Injectable, signal} from '@angular/core';
import {UserProfileModel} from '../../models/UserProfileModel';
import {routesConstantes} from '../../constantes/routes.constantes';
import {Router} from '@angular/router';
import {storagesConstantes} from '../../constantes/storages.constantes';
import {StorageService} from '../storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = signal<UserProfileModel | null>(null);
  isLoggedIn = signal(false);
  private storageService = inject(StorageService);

  router = inject(Router);

  constructor() {

    this.restoreSession();
  }

  loginSuccess(profile: UserProfileModel): void {
    this.user.set(profile);
    this.isLoggedIn.set(true);

    this.storageService.setLocalStorage(storagesConstantes.userSession, JSON.stringify(profile));
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/' + routesConstantes.connexionIdemat]);
  }

  clearSession(): void {
    this.user.set(null);
    this.isLoggedIn.set(false);
    localStorage.removeItem(storagesConstantes.userSession);
  }

  public restoreSession(): void {
    const storedUser = this.storageService.getLocalStorage(storagesConstantes.userSession);
    if (storedUser) {
      try {
        const userProfile: UserProfileModel = JSON.parse(storedUser);
        // On rétablit l'état sans déclencher de nouvelle navigation
        if (this.isTokenExpired(userProfile.jwt)) {
          this.clearSession();
          return;
        }
        this.user.set(userProfile);
        this.isLoggedIn.set(true);
        return;
      } catch (e) {

        console.error('Erreur lors de la restauration de la session', e);
        this.clearSession();
      }
    }
    this.clearSession();
  }

  /**
   * Vérifie si un token JWT est expiré.
   * @param token Le token JWT à vérifier.
   * @returns `true` si le token est expiré ou invalide, sinon `false`.
   */
  private isTokenExpired(token: string | null): boolean {
    if (!token) {
      return true;
    }

    const securityMarginInSeconds: number = 1 * 60 * 60; //1h
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) {
        return true;
      }

      // JWT utilise base64url (- et _) ; atob() attend du base64 standard (+ et /)
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4);
      const payloadJson = atob(padded);
      const payload = JSON.parse(payloadJson);

      if (!payload.exp) {
        // Si le token n'a pas de date d'expiration, on le considère comme invalide/expiré.
        console.log("token absent");
        return true;
      }


      const nowInSeconds = Math.floor(Date.now() / 1000);


      const tokenExpiryTime = payload.exp;
      // On vérifie si la date d'expiration, avec la marge de sécurité, est passée.
      if (tokenExpiryTime - securityMarginInSeconds <= nowInSeconds) {
        console.log("token expiré");
        return true; // Le token est expiré ou dans la "zone rouge" de sécurité.
      }

      console.log("token valide");
      return false;

    } catch (error) {
      console.error("Erreur lors du décodage du token", error);
      return true;
    }
  }
}
