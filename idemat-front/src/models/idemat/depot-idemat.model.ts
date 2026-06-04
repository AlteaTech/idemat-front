import {PassageMatiereIdematModel} from './passage-matiere-idemat.model';

export interface DepotIdematModel {
  id: number;
  date: string;
  heure: string;
  nomSite: string;
  matieres: PassageMatiereIdematModel[];
}
