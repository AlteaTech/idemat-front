import {AllEvenementDto, EvenementDto} from '../../core/api';

export class EvenementsModel {
  id: number = 0;
  libelle: string = "";

  static fromAllEvenementDto(dto: AllEvenementDto): EvenementsModel {
    const model = new EvenementsModel();
    model.id = dto.id;
    model.libelle = dto.libelle;
    return model;
  }

  static fromEvenementDto(dto: EvenementDto): EvenementsModel {
    const model = new EvenementsModel();
    model.id = dto.id;
    model.libelle = dto.libelle;
    return model;
  }

  static fromArrayAllEvenementDto(content: Array<AllEvenementDto> | undefined): EvenementsModel[] {
    if (!content) {
      return [];
    }
    return content.map(dto => this.fromAllEvenementDto(dto));
  }
}
