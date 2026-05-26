import {ContratDio} from '../../core/api/model/contrat-dio';

export interface AjouterVehiculeDialogData {
  contrat: ContratDio;
  isPro: boolean;
  immatriculation?: string;
}

export interface AjouterVehiculeDialogResult {
  label: string;
  immatriculation: string;
  zoneJ1: string;
  zoneF3: string;
  fileCarteGrise: File | null;
}
