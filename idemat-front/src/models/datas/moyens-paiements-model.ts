import {AllMoyenPaiementDto, MoyenPaiementDto} from '../../core/api';

export class MoyensPaiementsModel {
  id: number = 0;
  libelle: string = "";

  static fromAllMoyenPaiementDto(dto: AllMoyenPaiementDto): MoyensPaiementsModel {
    const model = new MoyensPaiementsModel();
    model.id = dto.id;
    model.libelle = dto.libelle;
    return model;
  }

  static fromMoyenPaiementDto(dto: MoyenPaiementDto): MoyensPaiementsModel {
    const model = new MoyensPaiementsModel();
    model.id = dto.id;
    model.libelle = dto.libelle;
    return model;
  }

  /**
   * Convertit une liste de DTOs en une liste de MoyensPaiementsModel.
   */
  static fromArrayAllMoyenPaiementDto(content: Array<AllMoyenPaiementDto> | undefined): MoyensPaiementsModel[] {
    if (!content) {
      return [];
    }
    return content.map(dto => this.fromAllMoyenPaiementDto(dto));
  }
}
