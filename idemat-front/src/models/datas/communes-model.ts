import {AllCommuneDto, CommuneDto} from "../../core/api";

export class CommunesModel {
  id: number = 0;
  ville: string = "";
  pays: string = "";
  codePostal: string = "";

  static fromAllCommuneDtos(content: Array<AllCommuneDto> | undefined): CommunesModel[] {
    if (!content) {
      return [];
    }
    return content.map(dto => this.fromAllCommuneDto(dto));
  }

  static fromCommuneDto(dto: CommuneDto): CommunesModel {
    const model = new CommunesModel();
    model.id = dto.id;
    model.ville = dto.ville;
    model.pays = dto.pays;
    model.codePostal = dto.codePostal;
    return model;
  }

  static fromAllCommuneDto(dto: AllCommuneDto): CommunesModel {

    const model = new CommunesModel();
    model.id = dto.id;
    model.ville = dto.ville;
    model.pays = dto.pays;
    model.codePostal = dto.codePostal;
    return model;
  }
}


