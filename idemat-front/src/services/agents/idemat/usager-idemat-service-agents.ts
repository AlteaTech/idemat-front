import {Injectable} from '@angular/core';
import {delay, Observable, of} from 'rxjs';
import {ProfilIdematUpdateModel, UsagerIdematModel} from '../../../models/idemat/usager-idemat.model';

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
      immatriculations: ['AA-123-BB', 'CD-456-EF'],
    }).pipe(delay(300));
  }

  // TODO: remplacer par appel HTTP PUT /api/idemat/usager/profil
  updateProfil(data: ProfilIdematUpdateModel): Observable<void> {
    return of(void 0).pipe(delay(600));
  }

  // TODO: remplacer par appel HTTP PUT /api/idemat/usager/email
  updateEmail(email: string): Observable<void> {
    return of(void 0).pipe(delay(600));
  }

  // TODO: remplacer par appel HTTP PUT /api/idemat/usager/mot-de-passe
  updateMotDePasse(ancienMotDePasse: string, nouveauMotDePasse: string): Observable<void> {
    return of(void 0).pipe(delay(600));
  }

  // TODO: remplacer par appel HTTP POST /api/idemat/usager/vehicules (multipart)
  addVehicule(immat: string, carteGrise: File, zoneJ1?: string, zoneF3?: number): Observable<void> {
    return of(void 0).pipe(delay(800));
  }

  // TODO: remplacer par appel HTTP DELETE /api/idemat/usager/vehicules/{immat}
  deleteVehicule(immat: string): Observable<void> {
    return of(void 0).pipe(delay(400));
  }

  // TODO: remplacer par appel HTTP POST /api/idemat/usager/reset-password
  demanderResetPassword(email: string): Observable<void> {
    return of(void 0).pipe(delay(600));
  }
}
