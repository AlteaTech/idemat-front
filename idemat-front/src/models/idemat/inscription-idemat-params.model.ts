import {VehiculeInscriptionParam} from './vehicule-inscription-param.model';

export interface InscriptionIdematParams {
  type: string;
  contratUrl: string;
  nom: string;
  prenom: string;
  adresse: string;
  communeContratId: number;
  email: string;
  telephone: string;
  cartePhysique: boolean;
  mentionsLegales: boolean;
  deuxiemeNom?: string;
  deuxiemePrenom?: string;
  complementAdresse?: string;
  societe?: string;
  siret?: string;
  vehicules?: VehiculeInscriptionParam[];
  carteIdentite?: File;
  justificatifDomicile?: File;
  kbis?: File;
}
