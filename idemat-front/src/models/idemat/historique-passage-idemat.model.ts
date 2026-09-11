import {PassageMatiereIdematModel} from './passage-matiere-idemat.model';

export interface HistoriquePassageIdematModel {
  id: number;
  date: string;
  heure: string;
  nomSite: string;
  estRefuse: boolean;
  estDepotQualifie: boolean;
  matieres: PassageMatiereIdematModel[];
  valeurPoints: number;
  commentaire?: string;
}
