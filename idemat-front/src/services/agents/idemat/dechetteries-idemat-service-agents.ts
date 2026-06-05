import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {DechetterieIdematModel} from '../../../models/idemat/dechetterie-idemat.model';
import {DechetterieControllerService} from '../../../core/api/api/dechetterie-controller.service';

@Injectable({providedIn: 'root'})
export class DechetteriesIdematServiceAgents {
  private readonly dechetterieService = inject(DechetterieControllerService);

  getListe(): Observable<DechetterieIdematModel[]> {
    return this.dechetterieService.getDechetteries().pipe(map(list => list.map(d => ({
      id: d.id, nom: d.nom, adresse: d.adresse, codePostal: d.codePostal, ville: d.ville, horaires: null,
    }))));
  }

  getById(id: number): Observable<DechetterieIdematModel | undefined> {
    return this.dechetterieService.getById(id).pipe(map(d => ({
      id: d.id, nom: d.nom, adresse: d.adresse, codePostal: d.codePostal, ville: d.ville,
      horaires: d.horaires ?? null,
    })));
  }
}
