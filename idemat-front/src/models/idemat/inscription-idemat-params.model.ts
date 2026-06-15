import {VehiculeInscriptionParam} from './vehicule-inscription-param.model';

export interface InscriptionIdematParams {
  type: string;
  contratUrl: string;
  nom: string;
  prenom: string;
  adresse: string;
  ville: string;
  email: string;
  telephone: string;
  cartePhysique: boolean;
  carteDematerialisee: boolean;
  mentionsLegales: boolean;
  deuxiemeNom?: string;
  deuxiemePrenom?: string;
  complementAdresse?: string;
  societe?: string;
  siret?: string;
  vehicules?: VehiculeInscriptionParam[];
  codePostal?: string;
  carteIdentite?: File;
  justificatifDomicile?: File;
  carteGrise?: File;
  kbis?: File;
}
