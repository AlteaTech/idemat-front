import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {DechetterieIdematModel, HoraireJour} from '../../../models/idemat/dechetterie-idemat.model';
import {DechetterieControllerService} from '../../../core/api/api/dechetterie-controller.service';

const HORAIRE_VIDE: HoraireJour = {ouvert: false, matin: '', apresMidi: ''};
const HORAIRES_VIDES = {
  lundi: HORAIRE_VIDE, mardi: HORAIRE_VIDE, mercredi: HORAIRE_VIDE,
  jeudi: HORAIRE_VIDE, vendredi: HORAIRE_VIDE, samedi: HORAIRE_VIDE, dimanche: HORAIRE_VIDE
};

@Injectable({providedIn: 'root'})
export class DechetteriesIdematServiceAgents {
  private readonly dechetterieService = inject(DechetterieControllerService);

  getListe(): Observable<DechetterieIdematModel[]> {
    return this.dechetterieService.getDechetteries().pipe(map(list => list.map(d => ({
      id: d.id,
      nom: d.nom,
      adresse: d.adresse,
      codePostal: d.codePostal,
      ville: d.ville,
      horaires: HORAIRES_VIDES,
      affluence: [],
    }))));
  }

  getById(id: number): Observable<DechetterieIdematModel | undefined> {
    return this.dechetterieService.getById(id).pipe(map(d => {
      let horaires = HORAIRES_VIDES;
      if (d.horaires) {
        try { horaires = JSON.parse(d.horaires); } catch {}
      }
      return {id: d.id, nom: d.nom, adresse: d.adresse, codePostal: d.codePostal, ville: d.ville, horaires, affluence: []};
    }));
  }
}
