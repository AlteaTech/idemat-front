import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {ProfilIdematUpdateModel, UsagerIdematModel} from '../../../models/idemat/usager-idemat.model';
import {VehiculeIdematModel} from '../../../models/idemat/vehicule-idemat.model';
import {UsagerControllerService} from '../../../core/api/api/usager-controller.service';
import {VehiculeControllerService} from '../../../core/api/api/vehicule-controller.service';
import {MotDePasseIdmControllerService} from '../../../core/api/api/mot-de-passe-idm-controller.service';

@Injectable({providedIn: 'root'})
export class UsagerIdematServiceAgents {
  private readonly usagerService = inject(UsagerControllerService);
  private readonly vehiculeService = inject(VehiculeControllerService);
  private readonly motDePasseService = inject(MotDePasseIdmControllerService);

  getUsager(): Observable<UsagerIdematModel> {
    return this.usagerService.getMe().pipe(map(r => {
      let nom = r.nom ?? '';
      let prenom = r.prenom ?? '';
      if (!prenom && nom.includes(' ')) {
        const idx = nom.indexOf(' ');
        prenom = nom.slice(idx + 1);
        nom = nom.slice(0, idx);
      }
      return {
        guid: String(r.id),
        nom,
        prenom,
        email: r.courriel,
        telephone: r.telephone,
        adresse: r.adresse,
        codePostal: r.codePostal,
        ville: r.ville,
        hasChangedPassword: r.hasChangedPassword,
        codeBarres: r.codeBarres,
        isPro: r.isPro,
        vehicules: r.vehicules.map((v): VehiculeIdematModel => ({
          immatriculation: v.immatriculation,
          zoneJ1: v.zoneJ1 ?? undefined,
          zoneF3: v.zoneF3 ?? undefined,
        })),
      };
    }));
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

  addVehicule(immat: string, carteGrise?: File | null, zoneJ1?: string, zoneF3?: number): Observable<void> {
    return this.vehiculeService.ajouterVehicule(immat, zoneJ1, zoneF3, carteGrise ?? undefined);
  }

  updateVehicule(immatriculation: string, nouvelleImmatriculation: string, zoneJ1?: string, zoneF3?: number): Observable<void> {
    return this.vehiculeService.modifierVehicule(immatriculation, {nouvelleImmatriculation, zoneJ1, zoneF3});
  }

  deleteVehicule(immat: string): Observable<void> {
    return this.vehiculeService.supprimerVehicule(immat);
  }

  deleteAccount(): Observable<void> {
    return this.usagerService.deleteAccount();
  }

  demanderResetPassword(email: string): Observable<void> {
    return this.motDePasseService.demanderReset({courriel: email});
  }
}
