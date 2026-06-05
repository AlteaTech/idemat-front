export type {AchatPassagesModel} from './achat-passages.model';
import {AchatPassagesModel} from './achat-passages.model';

export interface PassagesInfoModel {
  passagesRestants: number;
  achatsAnnee: AchatPassagesModel[];
  nbPassagesAchetesTotal: number;
  forfaitGratuitAnnuel: number;
  forfaitAcheteAnnuel: number;
  passagesConsommesAnnee: number;
}

export interface PassagesStatsIdematModel {
  jour: number;
  mois: number;
  annee: number;
}
