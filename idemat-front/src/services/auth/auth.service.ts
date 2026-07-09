import {inject, Injectable, signal} from '@angular/core';
import {UserProfileModel} from '../../models/UserProfileModel';
import {routesConstantes} from '../../constantes/routes.constantes';
import {storagesConstantes} from '../../constantes/storages.constantes';
import {Router} from '@angular/router';
import {StorageService} from '../storage.service';
import {AuthenticationServiceAgents} from '../agents/authentication-service-agents';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = signal<UserProfileModel | null>(null);
  isLoggedIn = signal(false);
  hasChangedPassword = signal(true);
  private storageService = inject(StorageService);
  private authenticationServiceAgents = inject(AuthenticationServiceAgents);
  private readonly channel = new BroadcastChannel('idemat_auth');

  router = inject(Router);

  private lastActivityAt = Date.now();
  private refreshIntervalId: ReturnType<typeof setInterval> | null = null;
  private readonly onActivity = () => { this.lastActivityAt = Date.now(); };
  private readonly onVisible = () => { if (document.visibilityState === 'visible') this.checkAndRefresh(); };

  constructor() {
    this.restoreSession();
    this.channel.onmessage = (event) => {
      if (event.data?.type === 'PASSWORD_CHANGED') {
        this.hasChangedPassword.set(true);
      }
    };
  }

  loginSuccess(profile: UserProfileModel): void {
    this.hasChangedPassword.set(profile.hasChangedPassword !== false);
    this.user.set(profile);
    this.isLoggedIn.set(true);
    this.storageService.setLocalStorage(storagesConstantes.userSession, JSON.stringify(profile));
    this.startActivityTracking();
  }

  updateHasChangedPassword(value: boolean): void {
    const profile = this.user();
    if (profile) {
      const updated = {...profile, hasChangedPassword: value};
      this.user.set(updated);
      this.storageService.setLocalStorage(storagesConstantes.userSession, JSON.stringify(updated));
    }
    this.hasChangedPassword.set(value);
  }

  markPasswordChanged(): void {
    this.updateHasChangedPassword(true);
    this.channel.postMessage({type: 'PASSWORD_CHANGED'});
  }

  logout(): void {
    const slug = this.storageService.getLocalStorage(storagesConstantes.contratSlug);
    this.clearSession();
    this.router.navigate(['/' + (slug ?? routesConstantes.lienInvalide)]);
  }

  clearSession(): void {
    this.stopActivityTracking();
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
        this.hasChangedPassword.set(userProfile.hasChangedPassword !== false);
        this.startActivityTracking();
        return;
      } catch (e) {

        console.error('Erreur lors de la restauration de la session', e);
        this.clearSession();
      }
    }
    this.clearSession();
  }

  private startActivityTracking(): void {
    if (this.refreshIntervalId) {
      return; // déjà démarré (ex: restoreSession + login successifs)
    }
    document.addEventListener('click', this.onActivity, {passive: true});
    document.addEventListener('keydown', this.onActivity, {passive: true});
    document.addEventListener('visibilitychange', this.onVisible);
    this.refreshIntervalId = setInterval(() => this.checkAndRefresh(), 60_000);
  }

  private stopActivityTracking(): void {
    document.removeEventListener('click', this.onActivity);
    document.removeEventListener('keydown', this.onActivity);
    document.removeEventListener('visibilitychange', this.onVisible);
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  }

  private checkAndRefresh(): void {
    if (!this.isLoggedIn()) {
      return;
    }
    if (Date.now() - this.lastActivityAt > 60_000) {
      return; // inactif depuis le dernier tick → on laisse la session expirer naturellement
    }
    const currentJwt = this.user()?.jwt;
    if (!currentJwt) {
      return;
    }
    this.authenticationServiceAgents.refreshToken(currentJwt).subscribe({
      next: (newJwt) => this.applyRefreshedJwt(newJwt),
      error: (err) => console.warn('Rafraîchissement JWT échoué — la session expirera naturellement', err),
    });
  }

  private applyRefreshedJwt(newJwt: string): void {
    const profile = this.user();
    if (!profile) {
      return;
    }
    const updated = {...profile, jwt: newJwt};
    this.user.set(updated);
    this.storageService.setLocalStorage(storagesConstantes.userSession, JSON.stringify(updated));
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

    const securityMarginInSeconds: number = 60; // 1 min
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
