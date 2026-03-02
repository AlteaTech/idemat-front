import {inject, Injectable} from '@angular/core';
import {catchError, map, Observable, of} from 'rxjs';
import {
  CreerSmartphoneRequest,
  PageAllSmartphoneDto,
  PutSmartphoneByIdRequest,
  SmartphoneDto,
  SmartphonesControllerService
} from '../../core/api';
import {PaginatedModel} from '../../models/paginated-model';
import {SmartphonesModel} from '../../models/datas/smartphones-model';
import {GetAllSmartphonesModel} from '../../models/datas/get-all-smartphones-model';

@Injectable({
  providedIn: 'root'
})
export class SmartphonesServiceAgents {
  private apiService = inject(SmartphonesControllerService);

  getAllSmartphones(model?: GetAllSmartphonesModel, page: number = 0, size: number = 10, sort?: Array<string>): Observable<PaginatedModel<SmartphonesModel>> {
    return this.apiService.getAllSmartphones(model?.numSerie, model?.nom, model?.typeTerminal, model?.isSpare, model?.isActif, page, size, sort ?? ["id,ASC"], 'body', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map((dto: PageAllSmartphoneDto) => {
          const response = new PaginatedModel<SmartphonesModel>();
          response.totalElements = dto.totalElements ?? 0;
          response.totalPages = dto.totalPages ?? 0;
          response.datas = SmartphonesModel.fromArrayAllSmartphoneDto(dto.content);
          return response;
        }),
        catchError(error => {
          console.error('Error fetching all smartphones:', error);
          throw error;
        })
      );
  }

  getSmartphone(id: number): Observable<SmartphonesModel> {
    return this.apiService.getSmartphoneById(id, 'body', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map((dto: SmartphoneDto) => {
          return SmartphonesModel.fromSmartphoneDto(dto);
        }),
        catchError(error => {
          console.error(`Error fetching smartphone by ID: ${id}`, error);
          throw error;
        })
      );
  }

  deleteSmartphone(id: number): Observable<boolean> {
    return this.apiService.deleteSmartphoneById(id, 'response', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map(response => response.status === 200 || response.status === 204),
        catchError(error => {
          console.error(`Error deleting smartphone with ID: ${id}`, error);
          return of(false);
        })
      );
  }

  updateSmartphone(id: number, numSerie: string | undefined, nom: string, typeTerminal: string | undefined, isSpare: boolean, isActif: boolean, contratId: number): Observable<boolean> {
    const requestBody: PutSmartphoneByIdRequest = {numSerie, nom, typeTerminal, isSpare, isActif, contratId};
    return this.apiService.putSmartphoneById(id, requestBody, 'response', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map(response => response.status === 200 || response.status === 204),
        catchError(error => {
          console.error(`Error updating smartphone with ID: ${id}`, error);
          return of(false);
        })
      );
  }

  creerSmartphone(numSerie: string | undefined, nom: string, typeTerminal: string | undefined, isSpare: boolean, isActif: boolean, contratId: number): Observable<number> {
    const requestBody: CreerSmartphoneRequest = {numSerie, nom, typeTerminal, isSpare, isActif, contratId};
    return this.apiService.creerSmartphone(requestBody, 'response', false,
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
