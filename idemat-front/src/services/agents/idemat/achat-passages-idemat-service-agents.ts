import {Injectable} from '@angular/core';
import {delay, Observable, of} from 'rxjs';
import {AchatPassagesOptionsModel} from '../../../models/idemat/achat-passages-idemat.model';

@Injectable({providedIn: 'root'})
export class AchatPassagesIdematServiceAgents {

  // TODO: remplacer par appel HTTP GET /api/idemat/achat-passages/options
  getOptions(): Observable<AchatPassagesOptionsModel> {
    return of({
      nbPassages: 10,
      montant: 2500,
      montantFormate: '25€',
    }).pipe(delay(300));
  }

  // TODO: remplacer par appel HTTP POST /api/idemat/achat-passages/initier → retourne URL PayFip
  initierPaiement(): Observable<string> {
    return of('https://www.tipi-client.budget.gouv.fr/mock').pipe(delay(500));
  }
}
