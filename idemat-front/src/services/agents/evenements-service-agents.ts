import {inject, Injectable} from '@angular/core';
import {catchError, map, Observable, of} from 'rxjs';
import {
  CreerEvenementRequest,
  EvenementDto,
  EvenementsControllerService,
  PageAllEvenementDto,
  PutEvenementByIdRequest
} from '../../core/api';
import {PaginatedModel} from '../../models/paginated-model';
import {EvenementsModel} from '../../models/datas/evenements-model';

@Injectable({
  providedIn: 'root'
})
export class EvenementsServiceAgents {
  private apiService = inject(EvenementsControllerService);

  getAllEvenements(libelle?: string, page: number = 0, size: number = 10, sort?: Array<string>): Observable<PaginatedModel<EvenementsModel>> {
    return this.apiService.getAllEvenements(libelle, page, size, sort ?? ["id,ASC"], 'body', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map((dto: PageAllEvenementDto) => {
          const response = new PaginatedModel<EvenementsModel>();
          response.totalElements = dto.totalElements ?? 0;
          response.totalPages = dto.totalPages ?? 0;
          response.datas = EvenementsModel.fromArrayAllEvenementDto(dto.content);
          return response;
        }),
        catchError(error => {
          console.error('Error fetching all moyens de paiement:', error);
          throw error;
        })
      );
  }

  getEvenement(id: number): Observable<EvenementsModel> {
    return this.apiService.getEvenementById(
      id,
      'body',
      false,
      {
        httpHeaderAccept: 'application/json' as any
      }
    ).pipe(
      map((apiResponse: any) => {
        const dto = apiResponse as EvenementDto;
        return EvenementsModel.fromEvenementDto(dto);
      })
    );
  }

  deleteEvenement(id: number): Observable<boolean> {
    return this.apiService.deleteEvenementById(id, 'response', false)
      .pipe(
        map(response => response.status === 200 || response.status === 204),
        catchError(error => {
          console.error(`Error deleting moyen de paiement with ID: ${id}`, error);
          return of(false);
        })
      );
  }

  updateEvenement(id: number, libelle: string): Observable<boolean> {
    const requestBody: PutEvenementByIdRequest = {libelle};
    return this.apiService.putEvenementById(id, requestBody, 'response', false)
      .pipe(
        map(response => response.status === 200 || response.status === 204),
        catchError(error => {
          console.error(`Error updating moyen de paiement with ID: ${id}`, error);
          return of(false);
        })
      );
  }

  creerEvenement(libelle: string): Observable<number> {
    const requestBody: CreerEvenementRequest = {libelle};
    return this.apiService.creerEvenement(requestBody, 'response', false)
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
