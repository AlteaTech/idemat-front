// Injection du service généré (le "brut")
import {AuthControllerService, LoginRequest} from '../../core/api';
import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthenticationServiceAgents {
  private apiService = inject(AuthControllerService);

  authenticateUser(login: string, motDePasse: string): Observable<string> {
    const request = {
      login: login,
      motDePasse: motDePasse
    } as LoginRequest
    return this.apiService.authenticateUser(
      request,
      'body',
      false,
      {
        httpHeaderAccept: 'application/json' as any
      }
    ).pipe(
      map((apiResponse: any) => {
        return apiResponse.token as string;
      })
    );
  }
}
