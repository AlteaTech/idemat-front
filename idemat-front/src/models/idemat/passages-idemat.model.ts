export interface AchatPassagesModel {
  date: string;
  nbPassages: number;
}

export interface PassagesInfoModel {
  passagesRestants: number;
  achatsAnnee: AchatPassagesModel[];
  nbPassagesAchetesTotal: number;
  forfaitGratuitAnnuel: number;
  forfaitAcheteAnnuel: number;
  passagesConsommesAnnee: number;
}
