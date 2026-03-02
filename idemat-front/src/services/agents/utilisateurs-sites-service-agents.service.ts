import {inject, Injectable} from '@angular/core';
import {catchError, map, Observable, of} from 'rxjs';
import {
  CreerUtilisateurSiteRequest,
  PutUtilisateurSiteByIdRequest,
  UtilisateurSiteDto,
  UtilisateursSitesControllerService
} from '../../core/api';
import {UtilisateursSitesModel} from '../../models/datas/utilisateurs-sites-model';

@Injectable({
  providedIn: 'root'
})
export class UtilisateursSitesServiceAgents {
  private apiService = inject(UtilisateursSitesControllerService);

  getUtilisateur(id: number): Observable<UtilisateursSitesModel> {
    return this.apiService.getUtilisateurById(id, 'body', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map((dto: UtilisateurSiteDto) => {
          return UtilisateursSitesModel.fromUtilisateurSiteDto(dto);
        }),
        catchError(error => {
          console.error(`Error fetching utilisateur by ID: ${id}`, error);
          throw error;
        })
      );
  }

  updateUtilisateur(id: number, login: string, motDePasse: string, isAdmin: boolean): Observable<boolean> {
    const requestBody: PutUtilisateurSiteByIdRequest = {login, motdepasse: motDePasse, isAdmin};
    return this.apiService.putUtilisateurById(id, requestBody, 'response', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map(response => response.status === 200 || response.status === 204),
        catchError(error => {
          console.error(`Error updating utilisateur with ID: ${id}`, error);
          return of(false);
        })
      );
  }

  creerUtilisateur(login: string, motDePasse: string, isAdmin: boolean): Observable<number> {
    const requestBody: CreerUtilisateurSiteRequest = {login, motdepasse: motDePasse, isAdmin};
    return this.apiService.creerUtilisateurSite(requestBody, 'response', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map(response => {
          if(response.status === 200 && response.body){
            return  response.body as number ;
          }
          else{
            throw new Error('Une erreur est survenue');
          }
        })
      );
  }
}
