import {VehiculeIdematModel} from './vehicule-idemat.model';

export interface UsagerIdematModel {
  guid: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
  hasChangedPassword: boolean;
  codeBarres?: string;
  vehicules?: VehiculeIdematModel[];
  isPro: boolean;
}

export type {ProfilIdematUpdateModel} from './profil-idemat-update.model';
