import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

@Injectable({providedIn: 'root'})
export class AuthenticationIdematServiceAgents {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  authenticateUser(courriel: string, motDePasse: string): Observable<string> {
    return this.http.post<{token: string}>(`${this.base}/api/auth/login`, {courriel, motDePasse})
      .pipe(map(res => res.token));
  }
}
