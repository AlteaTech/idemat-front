import {AuthControllerService} from '../../core/api/api/auth-controller.service';
import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationServiceAgents {
  private refreshApiService = inject(AuthControllerService);

  refreshToken(currentJwt: string): Observable<string> {
    return this.refreshApiService.refresh({token: currentJwt}).pipe(
      map(resp => resp.token)
    );
  }
}
