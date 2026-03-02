// Injection du service généré (le "brut")
import {
  CreerTypeApporteurRequest,
  PageAllTypeApporteurDto,
  PutTypeApporteurByIdRequest,
  TypeApporteurDto,
  TypesApporteursControllerService
} from '../../core/api';
import {inject, Injectable} from '@angular/core';
import {catchError, map, Observable, of} from 'rxjs';
import {TypesApporteursModel} from '../../models/datas/types-apporteurs-model';
import {PaginatedModel} from '../../models/paginated-model';

@Injectable({
  providedIn: 'root'
})

export class TypesApporteursServiceAgents {
  private apiService = inject(TypesApporteursControllerService);


  getTypeApporteur(id: number): Observable<TypesApporteursModel> {
    return this.apiService.getTypeApporteurById(
      id,
      'body',
      false,
      {
        httpHeaderAccept: 'application/json' as any
      }
    ).pipe(
      map((apiResponse: any) => {
        const dto = apiResponse as TypeApporteurDto;
        return TypesApporteursModel.fromTypeApporteurDto(dto);
      })
    );
  }

  updateTypeApporteur(id: number, libelle: string): Observable<boolean> {
    const requestBody: PutTypeApporteurByIdRequest = {
      libelle: libelle
    };
    return this.apiService.putTypeApporteurById(
      id,
      requestBody,
      'response',
      false,
      {
        httpHeaderAccept: 'application/json' as any
      }
    ).pipe(
      map(response => response.status === 200 || response.status === 204),
      catchError(error => {
        console.error(`Error updating type apporteur with ID: ${id}`, error);
        return of(false); // On retourne `false` en cas d'échec
      })
    );
  }

  deleteTypeApporteur(id: number): Observable<boolean> {
    return this.apiService.deleteTypeApporteurById(id, 'response', false)
      .pipe(
        map(response => response.status === 200 || response.status === 204),
        catchError(error => {
          console.error(`Error deleting type apporteur with ID: ${id}`, error);
          return of(false);
        })
      );
  }

  creerTypeApporteur(libelle: string): Observable<number> {
    const requestBody: CreerTypeApporteurRequest = {
      libelle: libelle
    };
    return this.apiService.creerTypeApporteur(
      requestBody,
      'response',
      false,
      {
        httpHeaderAccept: 'application/json' as any
      }
    )
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

  getAllTypesApporteurs(libelle?: string, page: number = 0, size: number = 10, sort?: Array<string>): Observable<PaginatedModel<TypesApporteursModel>> {
    return this.apiService.getAllTypesApporteurs(
      libelle,
      page,
      size,
      sort ?? ["libelle", "ASC"],
      'body',
      false,
      {
        httpHeaderAccept: 'application/json' as any
      }
    ).pipe(
      map((apiResponse: any) => {
        let dto = apiResponse as PageAllTypeApporteurDto;

        const response = new PaginatedModel<TypesApporteursModel>();
        response.totalElements = dto.totalElements ?? 0;
        response.totalPages = dto.totalPages ?? 0;
        response.datas = TypesApporteursModel.fromArrayAllTypeApporteurDto(dto.content);
        return response;
      })
    );
  }
}
