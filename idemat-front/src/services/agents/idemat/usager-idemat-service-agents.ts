import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {ProfilIdematUpdateModel, UsagerIdematModel} from '../../../models/idemat/usager-idemat.model';
import {UsagerControllerService} from '../../../core/api/api/usager-controller.service';
import {VehiculeControllerService} from '../../../core/api/api/vehicule-controller.service';
import {MotDePasseIdmControllerService} from '../../../core/api/api/mot-de-passe-idm-controller.service';

@Injectable({providedIn: 'root'})
export class UsagerIdematServiceAgents {
  private readonly usagerService = inject(UsagerControllerService);
  private readonly vehiculeService = inject(VehiculeControllerService);
  private readonly motDePasseService = inject(MotDePasseIdmControllerService);

  getUsager(): Observable<UsagerIdematModel> {
    return this.usagerService.getMe().pipe(map(r => ({
      guid: String(r.id),
      nom: r.nom ?? '',
      prenom: r.prenom ?? '',
      email: r.courriel,
      telephone: r.telephone,
      adresse: r.adresse,
      codePostal: r.codePostal,
      ville: r.ville,
      hasChangedPassword: r.hasChangedPassword,
      codeBarres: r.codeBarres,
      immatriculations: r.immatriculations,
    })));
  }

  updateProfil(data: ProfilIdematUpdateModel): Observable<void> {
    return this.usagerService.updateProfil(data);
  }

  updateEmail(email: string): Observable<void> {
    return this.usagerService.updateEmail({email});
  }

  updateMotDePasse(ancienMotDePasse: string, nouveauMotDePasse: string): Observable<void> {
    return this.usagerService.updateMotDePasse({ancienMotDePasse, nouveauMotDePasse});
  }

  addVehicule(immat: string, carteGrise: File, zoneJ1?: string, zoneF3?: number): Observable<void> {
    return this.vehiculeService.ajouterVehicule(immat, zoneJ1, zoneF3, carteGrise);
  }

  deleteVehicule(immat: string): Observable<void> {
    return this.vehiculeService.supprimerVehicule(immat);
  }

  demanderResetPassword(email: string): Observable<void> {
    return this.motDePasseService.demanderReset({courriel: email});
  }
}
