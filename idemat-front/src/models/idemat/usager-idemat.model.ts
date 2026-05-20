export interface UsagerIdematModel {
  guid: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
  hasChangedPassword: boolean;
  codeBarres?: string;
}
