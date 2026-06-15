import {VehiculeIdematModel} from './vehicule-idemat.model';
import {ContratIdematModel} from './contrat-idemat.model';

export interface ModifierVehiculeDialogData {
  vehicule: VehiculeIdematModel;
  contrat: ContratIdematModel;
  isPro: boolean;
}

export interface ModifierVehiculeDialogResult {
  nouvelleImmatriculation: string;
  zoneJ1?: string;
  zoneF3?: number;
}
