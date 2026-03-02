import {AllMatiereDto, MatiereDto} from "../../core/api";

export class MatieresModel {
  id: number = 0;
  libelle: string = "";
  code: string = "";

  static fromAllMatiereDtos(content: Array<AllMatiereDto> | undefined): MatieresModel[] {
    if (!content) {
      return [];
    }
    return content.map(dto => this.fromAllMatiereDto(dto));
  }

  static fromMatiereDto(dto: MatiereDto): MatieresModel {
    const model = new MatieresModel();
    model.id = dto.id;
    model.libelle = dto.libelle;
    model.code = dto.code;
    return model;
  }

  static fromAllMatiereDto(dto: AllMatiereDto): MatieresModel {
    const model = new MatieresModel();
    model.id = dto.id;
    model.libelle = dto.libelle;
    model.code = dto.code;
    return model;
  }
}
