export interface HoraireJour {
  ouvert: boolean;
  matin: string;
  apresMidi: string;
}

export interface AffluenceJour {
  jour: string;
  valeur: number;
}

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
