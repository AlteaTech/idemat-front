import {inject, Injectable} from '@angular/core';
import {catchError, map, Observable, of} from 'rxjs';
import {
  CreerMotifListeNoireRequest,
  MotifListeNoireDto,
  MotifsListeNoireControllerService,
  PageAllMotifListeNoireDto,
  PutMotifListeNoireByIdRequest
} from '../../core/api';
import {PaginatedModel} from '../../models/paginated-model';
import {MotifsListeNoireModel} from '../../models/datas/motifs-liste-noire-model';


@Injectable({
  providedIn: 'root'
})
export class MotifsListeNoireServiceAgents {
  private apiService = inject(MotifsListeNoireControllerService);

  getAllMotifsListeNoire(libelle?: string, page: number = 0, size: number = 10, sort?: Array<string>): Observable<PaginatedModel<MotifsListeNoireModel>> {
    return this.apiService.getAllMotifListeNoires(libelle, page, size, sort ?? ["id,ASC"], 'body', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map((dto: PageAllMotifListeNoireDto) => {
          const response = new PaginatedModel<MotifsListeNoireModel>();
          response.totalElements = dto.totalElements ?? 0;
          response.totalPages = dto.totalPages ?? 0;
          response.datas = MotifsListeNoireModel.fromArrayAllMotifListeNoireDto(dto.content);
          return response;
        }),
        catchError(error => {
          console.error('Error fetching all motifs liste noire:', error);
          throw error;
        })
      );
  }

  getMotifListeNoire(id: number): Observable<MotifsListeNoireModel> {
    return this.apiService.getMotifListeNoireById(id, 'body', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map((dto: MotifListeNoireDto) => {
          return MotifsListeNoireModel.fromMotifListeNoireDto(dto);
        }),
        catchError(error => {
          console.error(`Error fetching motif liste noire by ID: ${id}`, error);
          throw error;
        })
      );
  }

  deleteMotifListeNoire(id: number): Observable<boolean> {
    return this.apiService.deleteMotifListeNoireById(id, 'response', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map(response => response.status === 200 || response.status === 204),
        catchError(error => {
          console.error(`Error deleting motif liste noire with ID: ${id}`, error);
          return of(false);
        })
      );
  }

  updateMotifListeNoire(id: number, libelle: string): Observable<boolean> {
    const requestBody: PutMotifListeNoireByIdRequest = {libelle};
    return this.apiService.putMotifListeNoireById(id, requestBody, 'response', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map(response => response.status === 200 || response.status === 204),
        catchError(error => {
          console.error(`Error updating motif liste noire with ID: ${id}`, error);
          return of(false);
        })
      );
  }

  creerMotifListeNoire(libelle: string): Observable<number> {
    const requestBody: CreerMotifListeNoireRequest = {libelle};
    return this.apiService.creerMotifListeNoire(requestBody, 'response', false,
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
