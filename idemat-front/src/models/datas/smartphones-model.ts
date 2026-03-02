import {AllSmartphoneDto, SmartphoneDto} from '../../core/api';

export class SmartphonesModel {
  id: number = 0;
  numSerie?: string;
  nom: string = '';
  typeTerminal?: string;
  isSpare: boolean = false;
  isActif: boolean = true;

  static fromAllSmartphoneDto(dto: AllSmartphoneDto): SmartphonesModel {
    const model = new SmartphonesModel();
    model.id = dto.id;
    model.numSerie = dto.numSerie;
    model.nom = dto.nom;
    model.typeTerminal = dto.typeTerminal;
    model.isSpare = dto.isSpare;
    model.isActif = dto.isActif;
    return model;
  }

  static fromSmartphoneDto(dto: SmartphoneDto): SmartphonesModel {
    const model = new SmartphonesModel();
    model.id = dto.id;
    model.numSerie = dto.numSerie;
    model.nom = dto.nom;
    model.typeTerminal = dto.typeTerminal;
    model.isSpare = dto.isSpare;
    model.isActif = dto.isActif;
    return model;
  }

  static fromArrayAllSmartphoneDto(content: Array<AllSmartphoneDto> | undefined): SmartphonesModel[] {
    if (!content) {
      return [];
    }
    return content.map(dto => this.fromAllSmartphoneDto(dto));
  }
}
