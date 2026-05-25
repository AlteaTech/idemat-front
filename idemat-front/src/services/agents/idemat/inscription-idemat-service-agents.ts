import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Configuration} from '../../../core/api';

export interface VehiculeInscriptionParam {
  immatriculation: string;
  zoneJ1?: string;
  zoneF3?: string;
}

interface InscriptionParams {
  type: string;
  contratUrl: string;
  nom: string;
  prenom: string;
  adresse: string;
  ville: string;
  email: string;
  telephone: string;
  cartePhysique: boolean;
  carteDematerialisee: boolean;
  mentionsLegales: boolean;
  deuxiemeNom?: string;
  deuxiemePrenom?: string;
  complementAdresse?: string;
  societe?: string;
  siret?: string;
  vehicules?: VehiculeInscriptionParam[];
  codePostal?: string;
  carteIdentite?: File;
  justificatifDomicile?: File;
  kbis?: File;
}

@Injectable({providedIn: 'root'})
export class InscriptionIdematServiceAgents {
  private readonly http = inject(HttpClient);
  private readonly config = inject(Configuration);

  inscrire(params: InscriptionParams): Observable<void> {
    const fd = new FormData();
    fd.append('type', params.type);
    fd.append('contratUrl', params.contratUrl);
    fd.append('nom', params.nom);
    fd.append('prenom', params.prenom);
    fd.append('adresse', params.adresse);
    fd.append('ville', params.ville);
    fd.append('courriel', params.email);
    fd.append('telephone', params.telephone);
    fd.append('cartePhysique', String(params.cartePhysique));
    fd.append('carteDematerialisee', String(params.carteDematerialisee));
    fd.append('mentionsLegales', String(params.mentionsLegales));
    if (params.deuxiemeNom) fd.append('deuxiemeNom', params.deuxiemeNom);
    if (params.deuxiemePrenom) fd.append('deuxiemePrenom', params.deuxiemePrenom);
    if (params.complementAdresse) fd.append('complementAdresse', params.complementAdresse);
    if (params.societe) fd.append('societe', params.societe);
    if (params.siret) fd.append('siret', params.siret);
    if (params.codePostal) fd.append('codePostal', params.codePostal);

    params.vehicules?.forEach(v => {
      fd.append('immatriculations', v.immatriculation);
      fd.append('zonesJ1', v.zoneJ1 ?? '');
      fd.append('zonesF3', v.zoneF3 ?? '');
    });

    if (params.carteIdentite) fd.append('carteIdentite', params.carteIdentite);
    if (params.justificatifDomicile) fd.append('justificatifDomicile', params.justificatifDomicile);
    if (params.kbis) fd.append('kbis', params.kbis);

    // HttpClient direct : le client généré envoie les @RequestParam en query string,
    // ce qui rompt l'alignement des tableaux parallèles immatriculations/zonesJ1/zonesF3.
    // FormData manuelle garantit toujours le même nombre d'entrées par véhicule.
    return this.http.post<void>(`${this.config.basePath}/api/inscription`, fd);
  }
}
