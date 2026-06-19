import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {ContratIdematModel} from '../../../models/idemat/contrat-idemat.model';
import {ContratControllerService} from '../../../core/api/api/contrat-controller.service';
import {ContratDio} from '../../../core/api/model/contrat-dio';

@Injectable({providedIn: 'root'})
export class ContratIdematServiceAgents {
  private readonly contratService = inject(ContratControllerService);

  getContratByUrl(urlContrat: string): Observable<ContratIdematModel> {
    return this.contratService.getByUrl(urlContrat).pipe(map(r => this.toModel(r)));
  }

  getContratForCurrentUser(): Observable<ContratIdematModel> {
    return this.contratService.getCurrent().pipe(map(r => this.toModel(r)));
  }

  private toModel(r: ContratDio): ContratIdematModel {
    const logoUrl = r.logoBase64 && r.logoMime
      ? `data:${r.logoMime};base64,${r.logoBase64}`
      : '';
    return {
      idEnseigne: String(r.id),
      urlEnseigne: r.urlIdemat,
      nomEnseigne: r.nom,
      logoUrl,
      communes: r.communes,
      allowCartePhysique: r.allowCartePhysique,
      allowCarteDematerialisee: r.allowCarteDematerialisee,
      allowImmatriculationsParticuliers: r.allowImmatriculationsParticuliers,
      allowImmatriculationsProfessionnels: r.allowImmatriculationsProfessionnels,
      demandeZoneJ1F3: r.demandeZoneJ1F3,
      allowAchatPassages: r.allowAchatPassages,
      mentionsLegales: r.mentionsLegales ?? undefined,
    };
  }
}
