import {DemandeResetPasswordRequest, MotDePasseControllerService, ResetPasswordRequest} from '../../core/api';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class MotDePasseServiceAgents {
  private apiService = inject(MotDePasseControllerService);

  demanderResetPassword(email: string): Observable<void> {
    const request = {
      email: email
    } as DemandeResetPasswordRequest
    return this.apiService.demanderResetPassword(
      request,
      'body',
      false,
      {
        httpHeaderAccept: 'application/json' as any
      }
    );
  }

  resetPassword(token: string, motDePasse: string): Observable<void> {
    const request = {
      token: token,
      motDePasse: motDePasse
    } as ResetPasswordRequest
    return this.apiService.resetPassword(
      request,
      'body',
      false,
      {
        httpHeaderAccept: 'application/json' as any
      }
    );
  }
}
