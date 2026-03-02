import {inject, Injectable} from '@angular/core';
import {catchError, map, Observable, of} from 'rxjs';
import {
  CommuneDto,
  CommunesControllerService,
  CreerCommuneRequest,
  PageAllCommuneDto,
  PutCommuneByIdRequest
} from '../../core/api';
import {PaginatedModel} from '../../models/paginated-model';
import {CommunesModel} from '../../models/datas/communes-model';
import {getAllCommunesModel} from '../../models/datas/get-all-communes-model';

@Injectable({
  providedIn: 'root'
})
export class CommunesServiceAgents {
  private apiService = inject(CommunesControllerService);

  getAllCommunes(model?: getAllCommunesModel, page: number = 0, size: number = 10, sort?: Array<string>): Observable<PaginatedModel<CommunesModel>> {
    return this.apiService.getAllCommunes(model?.ville, model?.pays, model?.codePostal, page, size, sort ?? ["id,ASC"], 'body', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map((dto: PageAllCommuneDto) => {
          const response = new PaginatedModel<CommunesModel>();
          response.totalElements = dto.totalElements ?? 0;
          response.totalPages = dto.totalPages ?? 0;
          response.datas = CommunesModel.fromAllCommuneDtos(dto.content);
          return response;
        }),
        catchError(error => {
          console.error('Error fetching all communes:', error);
          throw error;
        })
      );
  }

  getCommune(id: number): Observable<CommunesModel> {
    return this.apiService.getCommuneById(id, 'body', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map((dto: CommuneDto) => {

          return CommunesModel.fromCommuneDto(dto);
        }),
        catchError(error => {
          console.error(`Error fetching commune by ID: ${id}`, error);
          throw error;
        })
      );
  }

  deleteCommune(id: number): Observable<boolean> {
    return this.apiService.deleteCommuneById(id, 'response', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map(response => response.status === 200 || response.status === 204),
        catchError(error => {
          console.error(`Error deleting commune with ID: ${id}`, error);
          return of(false);
        })
      );
  }

  updateCommune(id: number, ville: string, codePostal: string, pays: string): Observable<boolean> {
    const requestBody: PutCommuneByIdRequest = {ville, codePostal, pays};
    return this.apiService.putCommuneById(id, requestBody, 'response', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map(response => response.status === 200 || response.status === 204),
        catchError(error => {
          console.error(`Error updating commune with ID: ${id}`, error);
          return of(false);
        })
      );
  }

  creerCommune(ville: string, codePostal: string, pays: string): Observable<number> {
    const requestBody: CreerCommuneRequest = {ville, pays, codePostal};
    return this.apiService.creerCommune(requestBody, 'response', false,
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
