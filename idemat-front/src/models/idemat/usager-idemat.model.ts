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
  immatriculations?: string[];
}

export interface ProfilIdematUpdateModel {
  nomPrenom: string;
  adresse: string;
  telephone: string;
  codePostal: string;
  ville: string;
}
