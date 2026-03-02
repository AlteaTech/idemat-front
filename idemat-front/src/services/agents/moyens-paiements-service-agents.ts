import {inject, Injectable} from '@angular/core';
import {catchError, map, Observable, of} from 'rxjs';
import {
  CreerMoyenPaiementRequest,
  MoyenPaiementDto,
  MoyensPaiementsControllerService,
  PageAllMoyenPaiementDto,
  PutMoyenPaiementByIdRequest
} from '../../core/api';
import {PaginatedModel} from '../../models/paginated-model';
import {MoyensPaiementsModel} from '../../models/datas/moyens-paiements-model';

@Injectable({
  providedIn: 'root'
})
export class MoyensPaiementsServiceAgents {
  private apiService = inject(MoyensPaiementsControllerService);

  getAllMoyensPaiements(libelle?: string, page: number = 0, size: number = 10, sort?: Array<string>): Observable<PaginatedModel<MoyensPaiementsModel>> {
    return this.apiService.getAllMoyenPaiements(libelle, page, size, sort ?? ["id,ASC"], 'body', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map((dto: PageAllMoyenPaiementDto) => {
          const response = new PaginatedModel<MoyensPaiementsModel>();
          response.totalElements = dto.totalElements ?? 0;
          response.totalPages = dto.totalPages ?? 0;
          response.datas = MoyensPaiementsModel.fromArrayAllMoyenPaiementDto(dto.content);
          return response;
        }),
        catchError(error => {
          console.error('Error fetching all moyens de paiement:', error);
          throw error;
        })
      );
  }

  getMoyenPaiement(id: number): Observable<MoyensPaiementsModel> {
    return this.apiService.getMoyenPaiementById(
      id,
      'body',
      false,
      {
        httpHeaderAccept: 'application/json' as any
      }
    ).pipe(
      map((apiResponse: any) => {
        const dto = apiResponse as MoyenPaiementDto;
        return MoyensPaiementsModel.fromMoyenPaiementDto(dto);
      })
    );
  }

  deleteMoyenPaiement(id: number): Observable<boolean> {
    return this.apiService.deleteMoyenPaiementById(id, 'response', false)
      .pipe(
        map(response => response.status === 200 || response.status === 204),
        catchError(error => {
          console.error(`Error deleting moyen de paiement with ID: ${id}`, error);
          return of(false);
        })
      );
  }

  updateMoyenPaiement(id: number, libelle: string): Observable<boolean> {
    const requestBody: PutMoyenPaiementByIdRequest = {libelle};
    return this.apiService.putMoyenPaiementById(id, requestBody, 'response', false)
      .pipe(
        map(response => response.status === 200 || response.status === 204),
        catchError(error => {
          console.error(`Error updating moyen de paiement with ID: ${id}`, error);
          return of(false);
        })
      );
  }

  creerMoyenPaiement(libelle: string): Observable<number> {
    const requestBody: CreerMoyenPaiementRequest = {libelle};
    return this.apiService.creerMoyenPaiement(requestBody, 'response', false)
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
