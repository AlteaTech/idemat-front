import {AuthIdmControllerService} from '../../core/api/api/auth-idm-controller.service';
import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationServiceAgents {
  private apiService = inject(AuthIdmControllerService);

  authenticateUser(login: string, motDePasse: string): Observable<string> {
    return this.apiService.login({courriel: login, motDePasse}).pipe(
      map(resp => resp.token)
    );
  }
}
