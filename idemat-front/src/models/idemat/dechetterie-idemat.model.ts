export type {HoraireJour} from './horaire-jour.model';
export type {AffluenceJour} from './affluence-jour.model';
import {HoraireJour} from './horaire-jour.model';
import {AffluenceJour} from './affluence-jour.model';

export interface DechetterieIdematModel {
  id: number;
  nom: string;
  adresse: string;
  codePostal: string;
  ville: string;
  horaires: {
    lundi: HoraireJour;
    mardi: HoraireJour;
    mercredi: HoraireJour;
    jeudi: HoraireJour;
    vendredi: HoraireJour;
    samedi: HoraireJour;
    dimanche: HoraireJour;
  };
  affluence: AffluenceJour[];
}
