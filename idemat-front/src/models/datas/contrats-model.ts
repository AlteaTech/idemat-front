import {AllContratDto, ContratDto} from "../../core/api";

export class ContratsModel {
  id: number = 0;
  trigramme: string = "";
  nom: string = "";

  static fromAllContratDtos(content: Array<AllContratDto> | undefined): ContratsModel[] {
    if (!content) {
      return [];
    }
    return content.map(dto => this.fromAllContratDto(dto));
  }

  static fromContratDto(dto: ContratDto): ContratsModel {
    const model = new ContratsModel();
    model.id = dto.id;
    model.trigramme = dto.trigramme;
    model.nom = dto.nom;
    return model;
  }

  static fromAllContratDto(dto: AllContratDto): ContratsModel {
    const model = new ContratsModel();
    model.id = dto.id;
    model.trigramme = dto.trigramme;
    model.nom = dto.nom;
    return model;
  }
}
