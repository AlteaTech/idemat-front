import {Injectable} from '@angular/core';
import {delay, Observable, of} from 'rxjs';
import {PassagesInfoModel} from '../../../models/idemat/passages-idemat.model';

@Injectable({providedIn: 'root'})
export class PassagesIdematServiceAgents {

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
}
