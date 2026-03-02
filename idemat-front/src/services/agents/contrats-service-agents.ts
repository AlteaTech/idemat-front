import {inject, Injectable} from '@angular/core';
import {catchError, map, Observable, of} from 'rxjs';
import {
  ContratCommuneRequest,
  ContratDto,
  ContratEvenementRequest,
  ContratMatiereRequest,
  ContratMotifListeNoireRequest,
  ContratMoyenPaiementRequest,
  ContratsControllerService,
  ContratTypeApporteurRequest,
  CreerContratRequest,
  PageAllContratDto,
  PutContratByIdRequest
} from '../../core/api';
import {PaginatedModel} from '../../models/paginated-model';
import {ContratsModel} from '../../models/datas/contrats-model';
import {getAllContratsModel} from '../../models/datas/get-all-contrats-model';

@Injectable({
  providedIn: 'root'
})
export class ContratsServiceAgents {
  private apiService = inject(ContratsControllerService);

  getAllContrats(model?: getAllContratsModel, page: number = 0, size: number = 10, sort?: Array<string>): Observable<PaginatedModel<ContratsModel>> {
    return this.apiService.getAllContrats(model?.trigramme, model?.nom, page, size, sort ?? ["id,ASC"], 'body', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map((dto: PageAllContratDto) => {
          const response = new PaginatedModel<ContratsModel>();
          response.totalElements = dto.totalElements ?? 0;
          response.totalPages = dto.totalPages ?? 0;
          response.datas = ContratsModel.fromAllContratDtos(dto.content);
          return response;
        }),
        catchError(error => {
          console.error('Error fetching all contrats:', error);
          throw error;
        })
      );
  }

  getContrat(id: number): Observable<ContratsModel> {
    return this.apiService.getContratById(id, 'body', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map((dto: ContratDto) => {

          return ContratsModel.fromContratDto(dto);
        }),
        catchError(error => {
          console.error(`Error fetching contrat by ID: ${id}`, error);
          throw error;
        })
      );
  }

  deleteContrat(id: number): Observable<boolean> {
    return this.apiService.deleteContratById(id, 'response', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map(response => response.status === 200 || response.status === 204),
        catchError(error => {
          console.error(`Error deleting contrat with ID: ${id}`, error);
          return of(false);
        })
      );
  }

  updateContrat(id: number, nom: string, trigramme: string): Observable<boolean> {
    const typesApporteurs: Array<ContratTypeApporteurRequest> = [];
    const communes: Array<ContratCommuneRequest> = [];
    const motifsListeNoires: Array<ContratMotifListeNoireRequest> = [];
    const moyensPaiements: Array<ContratMoyenPaiementRequest> = [];
    const matieres: Array<ContratMatiereRequest> = [];
    const evenements: Array<ContratEvenementRequest> = [];

    const requestBody: PutContratByIdRequest = {trigramme, nom, typesApporteurs, communes, motifsListeNoires, moyensPaiements, matieres, evenements};
    return this.apiService.putContratById(id, requestBody, 'response', false,
      {
        httpHeaderAccept: 'application/json' as any
      })
      .pipe(
        map(response => response.status === 200 || response.status === 204),
        catchError(error => {
          console.error(`Error updating contrat with ID: ${id}`, error);
          return of(false);
        })
      );
  }

  creerContrat(nom: string, trigramme: string): Observable<number> {
    const typesApporteurs: Array<ContratTypeApporteurRequest> = [];
    const communes: Array<ContratCommuneRequest> = [];
    const motifsListeNoires: Array<ContratMotifListeNoireRequest> = [];
    const moyensPaiements: Array<ContratMoyenPaiementRequest> = [];
    const matieres: Array<ContratMatiereRequest> = [];
    const evenements: Array<ContratEvenementRequest> = [];

    const requestBody: CreerContratRequest = {trigramme, nom, typesApporteurs, communes, motifsListeNoires, moyensPaiements, matieres, evenements};
    return this.apiService.creerContrat(requestBody, 'response', false,
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
