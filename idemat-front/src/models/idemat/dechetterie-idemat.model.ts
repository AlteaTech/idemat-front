export interface SiteMatiereIdematModel {
  libelle: string;
  tarif: number | null;
  unite: string | null;
}

export interface DechetterieIdematModel {
  id: number;
  nom: string;
  adresse: string;
  codePostal: string;
  ville: string;
  horaires: string | null;
  matieres: SiteMatiereIdematModel[];
}
