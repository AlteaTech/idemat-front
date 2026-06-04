import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {delay, Observable, of} from 'rxjs';
import {Configuration} from '../../../core/api';
import {PassagesInfoModel} from '../../../models/idemat/passages-idemat.model';
import {DepotIdematModel} from '../../../models/idemat/depot-idemat.model';
import {PageIdematModel} from '../../../models/idemat/page-idemat.model';

@Injectable({providedIn: 'root'})
export class PassagesIdematServiceAgents {
  private readonly http = inject(HttpClient);
  private readonly config = inject(Configuration);

  // TODO: remplacer par appels HTTP GET /api/idemat/passages/info
  getPassagesInfo(): Observable<PassagesInfoModel> {
    return of({
      passagesRestants: 10,
      achatsAnnee: [
        {date: '2025-04-10', nbPassages: 2},
        {date: '2025-04-04', nbPassages: 5},
      ],
      nbPassagesAchetesTotal: 24,
      forfaitGratuitAnnuel: 10,
      forfaitAcheteAnnuel: 0,
      passagesConsommesAnnee: 2,
    }).pipe(delay(300));
  }

  // TODO #130: basculer sur client généré après merge + generate-client-local
  getDepots(page: number, size: number): Observable<PageIdematModel<DepotIdematModel>> {
    return this.http.get<PageIdematModel<DepotIdematModel>>(
      `${this.config.basePath}/api/passages?page=${page}&size=${size}&sort=datePassage,DESC`
    );
  }

  getStatsJour(): Observable<number> {
    return this.http.get<number>(`${this.config.basePath}/api/passages/stats/jour`);
  }

  getStatsMois(): Observable<number> {
    return this.http.get<number>(`${this.config.basePath}/api/passages/stats/mois`);
  }

  getStatsAnnee(): Observable<number> {
    return this.http.get<number>(`${this.config.basePath}/api/passages/stats/annee`);
  }
}
