import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {Configuration} from '../../../core/api';
import {PassagesControllerService} from '../../../core/api/api/passages-controller.service';
import {PassagesInfoModel, PassagesStatsIdematModel} from '../../../models/idemat/passages-idemat.model';
import {DepotIdematModel} from '../../../models/idemat/depot-idemat.model';
import {PageIdematModel} from '../../../models/idemat/page-idemat.model';

@Injectable({providedIn: 'root'})
export class PassagesIdematServiceAgents {
  private readonly passagesService = inject(PassagesControllerService);
  private readonly http = inject(HttpClient);
  private readonly config = inject(Configuration);

  // TODO: remplacer par le client OpenAPI généré une fois le back démarré (table PayFiP en attente de migration)
  getPassagesInfo(): Observable<PassagesInfoModel> {
    return this.http.get<PassagesInfoModel>(`${this.config.basePath}/api/passages/info`);
  }

  getDepots(page: number, size: number): Observable<PageIdematModel<DepotIdematModel>> {
    return this.passagesService.getPassages(page, size, ['datePassage,DESC']).pipe(
      map(p => ({
        content: (p.content ?? []) as DepotIdematModel[],
        totalElements: p.totalElements ?? 0,
        totalPages: p.totalPages ?? 0,
        number: p.number ?? 0,
        size: p.size ?? size,
        first: p.first ?? true,
        last: p.last ?? true,
      }))
    );
  }

  getStats(): Observable<PassagesStatsIdematModel> {
    return this.passagesService.getStats();
  }
}
