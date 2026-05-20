import {Injectable} from '@angular/core';
import {delay, Observable, of} from 'rxjs';
import {ContratIdematModel} from '../../../models/idemat/contrat-idemat.model';

@Injectable({providedIn: 'root'})
export class ContratIdematServiceAgents {

  // TODO: remplacer par appel HTTP GET /api/idemat/contrat/by-url/{url}
  getContratByUrl(urlContrat: string): Observable<ContratIdematModel> {
    return of({
      idEnseigne: 'ENS001',
      urlEnseigne: urlContrat,
      nomEnseigne: 'Communauté de Communes Test',
      logoUrl: '',
      allowAchatPassages: true,
      allowCarteDematerialisee: true,
      allowCartePhysique: false,
      allowImmatriculations: true,
    }).pipe(delay(300));
  }

  // TODO: remplacer par appel HTTP GET /api/idemat/contrat/current (depuis le token JWT)
  getContratForCurrentUser(): Observable<ContratIdematModel> {
    return this.getContratByUrl('test');
  }
}
