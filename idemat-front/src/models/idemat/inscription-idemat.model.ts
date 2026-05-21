export type TypeInscription = 'Part' | 'Pro';

export interface InscriptionIdematModel {
  type: TypeInscription;
  contrat: string;
  // Pro uniquement
  societe?: string;
  siret?: string;
  // Particulier uniquement
  civilite?: string;
  // Commun
  nom: string;
  prenom: string;
  adresse: string;
  codePostal: string;
  ville: string;
  email: string;
  telephone: string;
  cartePhysique: boolean;
  carteDematerialisee: boolean;
  mentionsLegales: boolean;
  // Véhicule (conditionnel)
  immatriculation?: string;
  zoneJ1?: string;
  zoneF3?: number;
  // Fichiers
  carteGrise?: File;
  carteIdentite?: File;       // Particulier uniquement
  justificatifDomicile?: File; // Particulier uniquement
}
