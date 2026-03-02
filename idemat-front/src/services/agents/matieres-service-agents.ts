import {inject, Injectable} from '@angular/core';
import {catchError, map, Observable, of} from 'rxjs';
import {
  CreerMatiereRequest,
  MatiereDto,
  MatieresControllerService,
  PageAllMatiereDto,
  PutMatiereByIdRequest
} from '../../core/api';
import {PaginatedModel} from '../../models/paginated-model';
import {MatieresModel} from '../../models/datas/matieres-model';
import {getAllMatieresModel} from '../../models/datas/get-all-matieres-model';

@Injectable({
  providedIn: 'root'
})
export class MatieresServiceAgents {
  private apiService = inject(MatieresControllerService);

  getAllMatieres(model?: getAllMatieresModel, page: number = 0, size: number = 10, sort?: Array<string>): Observable<PaginatedModel<MatieresModel>> {
    return this.apiService.getAllMatieres(model?.libelle, model?.code, page, size, sort ?? ["id,ASC"], 'body', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map((dto: PageAllMatiereDto) => {
          const response = new PaginatedModel<MatieresModel>();
          response.totalElements = dto.totalElements ?? 0;
          response.totalPages = dto.totalPages ?? 0;
          response.datas = MatieresModel.fromAllMatiereDtos(dto.content);
          return response;
        }),
        catchError(error => {
          console.error('Error fetching all matieres:', error);
          throw error;
        })
      );
  }

  getMatiere(id: number): Observable<MatieresModel> {
    return this.apiService.getMatiereById(id, 'body', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map((dto: MatiereDto) => {

          return MatieresModel.fromMatiereDto(dto);
        }),
        catchError(error => {
          console.error(`Error fetching matiere by ID: ${id}`, error);
          throw error;
        })
      );
  }

  deleteMatiere(id: number): Observable<boolean> {
    return this.apiService.deleteMatiereById(id, 'response', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map(response => response.status === 200 || response.status === 204),
        catchError(error => {
          console.error(`Error deleting matiere with ID: ${id}`, error);
          return of(false);
        })
      );
  }

  updateMatiere(id: number, libelle: string, code: string): Observable<boolean> {
    const requestBody: PutMatiereByIdRequest = {code, libelle};
    return this.apiService.putMatiereById(id, requestBody, 'response', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map(response => response.status === 200 || response.status === 204),
        catchError(error => {
          console.error(`Error updating matiere with ID: ${id}`, error);
          return of(false);
        })
      );
  }

  creerMatiere(libelle: string, code: string): Observable<number> {
    const requestBody: CreerMatiereRequest = {code, libelle};
    return this.apiService.creerMatiere(requestBody, 'response', false,
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
