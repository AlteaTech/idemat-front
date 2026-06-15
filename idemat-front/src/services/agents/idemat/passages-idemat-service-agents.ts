import {inject, Injectable} from '@angular/core';
import {delay, map, Observable, of} from 'rxjs';
import {PassagesControllerService} from '../../../core/api/api/passages-controller.service';
import {PassagesInfoModel, PassagesStatsIdematModel} from '../../../models/idemat/passages-idemat.model';
import {DepotIdematModel} from '../../../models/idemat/depot-idemat.model';
import {PageIdematModel} from '../../../models/idemat/page-idemat.model';

@Injectable({providedIn: 'root'})
export class PassagesIdematServiceAgents {
  private readonly passagesService = inject(PassagesControllerService);

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
