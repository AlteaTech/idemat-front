export interface ContratIdematModel {
  idEnseigne: string;
  urlEnseigne: string;
  nomEnseigne: string;
  logoUrl: string;
  allowAchatPassages: boolean;
  allowCarteDematerialisee: boolean;
  allowCartePhysique: boolean;
  allowImmatriculations: boolean;
  demandeZoneJ1F3: boolean;
  communes: { id: number; nom: string; codePostal: string }[];
  mentionsLegales?: string;
}
