import {inject, Injectable} from '@angular/core';
import {catchError, map, Observable, of} from 'rxjs';
import {
  CreerUniteDesApportsRequest,
  PageAllUniteDesApportsDto,
  PutUniteDesApportsByIdRequest,
  UniteDesApportsDto,
  UnitesDesApportsControllerService
} from '../../core/api';
import {UnitesDesApportsModel} from '../../models/datas/unites-des-apports-model';
import {PaginatedModel} from '../../models/paginated-model';

@Injectable({
  providedIn: 'root'
})
export class UnitesDesApportsServiceAgents {
  private apiService = inject(UnitesDesApportsControllerService);

  getAllUnitesDesApports(libelle?: string, page: number = 0, size: number = 10, sort?: Array<string>): Observable<PaginatedModel<UnitesDesApportsModel>> {
    return this.apiService.getAllUnitesDesApports(libelle, page, size, sort ?? ["id,ASC"], 'body', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map((dto: PageAllUniteDesApportsDto) => {
          const response = new PaginatedModel<UnitesDesApportsModel>();
          response.totalElements = dto.totalElements ?? 0;
          response.totalPages = dto.totalPages ?? 0;
          response.datas = UnitesDesApportsModel.fromArrayAllUniteDesApportsDto(dto.content);
          return response;
        }),
        catchError(error => {
          console.error('Error fetching all unites des apports:', error);
          throw error;
        })
      );
  }

  getUniteDesApports(id: number): Observable<UnitesDesApportsModel> {
    return this.apiService.getUniteDesApportsById(
      id,
      'body',
      false,
      {
        httpHeaderAccept: 'application/json' as any
      }
    ).pipe(
      map((apiResponse: any) => {
        const dto = apiResponse as UniteDesApportsDto;
        return UnitesDesApportsModel.fromUniteDesApportsDto(dto);
      })
    );
  }

  deleteUniteDesApportsById(id: number): Observable<boolean> {
    return this.apiService.deleteUniteDesApportsById(id, 'response', false)
      .pipe(
        map(response => response.status === 200 || response.status === 204),
        catchError(error => {
          console.error(`Error deleting unite des apports with ID: ${id}`, error);
          return of(false);
        })
      );
  }

  updateUniteDesApports(id: number, libelle: string): Observable<boolean> {
    const requestBody: PutUniteDesApportsByIdRequest = {libelle};
    return this.apiService.putUniteDesApportsById(id, requestBody, 'response', false)
      .pipe(
        map(response => response.status === 200 || response.status === 204),
        catchError(error => {
          console.error(`Error updating unité des apports with ID: ${id}`, error);
          return of(false);
        })
      );
  }

  creerUniteDesApports(libelle: string): Observable<number> {
    const requestBody: CreerUniteDesApportsRequest = {libelle};
    return this.apiService.creerUniteDesApports(requestBody, 'response', false)
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
