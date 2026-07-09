import {AuthIdmControllerService} from '../../core/api/api/auth-idm-controller.service';
import {AuthControllerService} from '../../core/api/api/auth-controller.service';
import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationServiceAgents {
  private apiService = inject(AuthIdmControllerService);
  private refreshApiService = inject(AuthControllerService);

  authenticateUser(login: string, motDePasse: string): Observable<string> {
    return this.apiService.login({courriel: login, motDePasse}).pipe(
      map(resp => resp.token)
    );
  }

  refreshToken(currentJwt: string): Observable<string> {
    return this.refreshApiService.refresh({token: currentJwt}).pipe(
      map(resp => resp.token)
    );
  }
}
