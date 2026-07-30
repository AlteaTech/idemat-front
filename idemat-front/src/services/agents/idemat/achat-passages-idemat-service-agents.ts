import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Configuration} from '../../../core/api';
import {AchatPassagesOptionsModel} from '../../../models/idemat/achat-passages-idemat.model';

@Injectable({providedIn: 'root'})
export class AchatPassagesIdematServiceAgents {
  private readonly http = inject(HttpClient);
  private readonly config = inject(Configuration);

  // TODO: remplacer par le client OpenAPI généré une fois le back démarré (table PayFiP en attente de migration)
  getOptions(): Observable<AchatPassagesOptionsModel> {
    return this.http.get<AchatPassagesOptionsModel>(`${this.config.basePath}/api/achat-passages/options`);
  }

  // TODO: remplacer par le client OpenAPI généré une fois le back démarré (table PayFiP en attente de migration)
  initierPaiement(): Observable<string> {
    return this.http.post(`${this.config.basePath}/api/achat-passages/initier`, {}, {responseType: 'text'});
  }

  // Réconciliation ciblée sur l'usager connecté — à appeler avant l'affichage du solde pour
  // garantir sa fraîcheur (le job Quartz global couvre le reste, cadence plus large).
  // TODO: remplacer par le client OpenAPI généré une fois le back démarré (table PayFiP en attente de migration)
  reconcilierMesAchatsEnAttente(): Observable<void> {
    return this.http.post<void>(`${this.config.basePath}/api/achat-passages/reconcilier`, {});
  }
}
