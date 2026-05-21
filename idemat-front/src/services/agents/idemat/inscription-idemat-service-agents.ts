import {Injectable} from '@angular/core';
import {delay, Observable, of} from 'rxjs';
import {InscriptionIdematModel} from '../../../models/idemat/inscription-idemat.model';

@Injectable({providedIn: 'root'})
export class InscriptionIdematServiceAgents {

  // TODO: remplacer par appel HTTP POST /api/idemat/inscription
  inscrire(data: InscriptionIdematModel): Observable<void> {
    return of(void 0).pipe(delay(800));
  }
}
