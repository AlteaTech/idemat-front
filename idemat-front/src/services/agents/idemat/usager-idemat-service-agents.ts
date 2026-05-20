import {Injectable} from '@angular/core';
import {delay, Observable, of} from 'rxjs';
import {UsagerIdematModel} from '../../../models/idemat/usager-idemat.model';

@Injectable({providedIn: 'root'})
export class UsagerIdematServiceAgents {

  // TODO: remplacer par appel HTTP GET /api/idemat/usager/me
  getUsager(): Observable<UsagerIdematModel> {
    return of({
      guid: 'mock-guid-abc123',
      nom: 'DUPONT',
      prenom: 'Jean',
      email: 'jean.dupont@example.com',
      telephone: '0612345678',
      adresse: '12 rue des Fleurs',
      codePostal: '69001',
      ville: 'Lyon',
      hasChangedPassword: true,
      codeBarres: 'MOCK-CB-0012345678',
    }).pipe(delay(300));
  }
}
