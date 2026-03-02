import {AllUniteDesApportsDto, UniteDesApportsDto} from '../../core/api';

export class UnitesDesApportsModel {
  id: number = 0;
  libelle: string = "";

  static fromAllUniteDesApportsDto(dto: AllUniteDesApportsDto): UnitesDesApportsModel {
    const model = new UnitesDesApportsModel();
    model.id = dto.id;
    model.libelle = dto.libelle;
    return model;
  }

  static fromUniteDesApportsDto(dto: UniteDesApportsDto): UnitesDesApportsModel {
    const model = new UnitesDesApportsModel();
    model.id = dto.id;
    model.libelle = dto.libelle;
    return model;
  }

  static fromArrayAllUniteDesApportsDto(content: Array<AllUniteDesApportsDto> | undefined): UnitesDesApportsModel[] {
    if (!content) {
      return [];
    }
    return content.map(dto => this.fromAllUniteDesApportsDto(dto));
  }
}
