import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {from, Observable, switchMap} from 'rxjs';
import {Configuration} from '../../../core/api';
import {FichierIdematParam} from '../../../models/idemat/fichier-idemat-param.model';
import {InscriptionIdematParams} from '../../../models/idemat/inscription-idemat-params.model';
import {VehiculeInscriptionParam} from '../../../models/idemat/vehicule-inscription-param.model';

@Injectable({providedIn: 'root'})
export class InscriptionIdematServiceAgents {
  private readonly http = inject(HttpClient);
  private readonly config = inject(Configuration);

  inscrire(params: InscriptionIdematParams): Observable<void> {
    return from(this.buildBody(params)).pipe(
      switchMap(body => this.http.post<void>(`${this.config.basePath}/api/inscription`, body))
    );
  }

  private async buildBody(params: InscriptionIdematParams): Promise<object> {
    const [carteIdentite, justificatifDomicile, kbis, vehicules] = await Promise.all([
      params.carteIdentite ? toFichier(params.carteIdentite) : Promise.resolve(undefined),
      params.justificatifDomicile ? toFichier(params.justificatifDomicile) : Promise.resolve(undefined),
      params.kbis ? toFichier(params.kbis) : Promise.resolve(undefined),
      Promise.all((params.vehicules ?? []).map(v => convertVehicule(v)))
    ]);

    return {
      type: params.type,
      contratUrl: params.contratUrl,
      nom: params.nom,
      prenom: params.prenom,
      adresse: params.adresse,
      communeContratId: params.communeContratId,
      courriel: params.email,
      telephone: params.telephone,
      cartePhysique: params.cartePhysique,
      mentionsLegales: params.mentionsLegales,
      ...(params.deuxiemeNom && {deuxiemeNom: params.deuxiemeNom}),
      ...(params.deuxiemePrenom && {deuxiemePrenom: params.deuxiemePrenom}),
      ...(params.complementAdresse && {complementAdresse: params.complementAdresse}),
      ...(params.societe && {societe: params.societe}),
      ...(params.siret && {siret: params.siret}),
      ...(vehicules.length > 0 && {vehicules}),
      ...(carteIdentite && {carteIdentite}),
      ...(justificatifDomicile && {justificatifDomicile}),
      ...(kbis && {kbis}),
    };
  }
}

async function convertVehicule(v: VehiculeInscriptionParam): Promise<object> {
  const carteGrise = v.fileCarteGrise ? await toFichier(v.fileCarteGrise) : undefined;
  return {
    immatriculation: v.immatriculation,
    ...(v.zoneJ1 && {zoneJ1: v.zoneJ1}),
    ...(v.zoneF3 && {zoneF3: v.zoneF3}),
    ...(carteGrise && {carteGrise}),
  };
}

function toFichier(file: File): Promise<FichierIdematParam> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // dataUrl format: "data:<mimeType>;base64,<base64>" — on extrait uniquement la partie base64
      const base64 = (reader.result as string).split(',')[1];
      resolve({base64, mimeType: file.type, nomFichier: file.name});
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
