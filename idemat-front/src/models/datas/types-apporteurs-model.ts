import {AllTypeApporteurDto, TypeApporteurDto} from '../../core/api';

export class TypesApporteursModel {
  libelle: string = '';
  id: number = 0;

  static fromAllTypeApporteurDto(dto: AllTypeApporteurDto): TypesApporteursModel {
    const model = new TypesApporteursModel();
    model.id = dto.id;
    model.libelle = dto.libelle;
    return model;
  }


  static fromTypeApporteurDto(dto: TypeApporteurDto): TypesApporteursModel {
    const model = new TypesApporteursModel();
    model.id = dto.id;
    model.libelle = dto.libelle;
    return model;
  }

  static fromArrayAllTypeApporteurDto(content: Array<AllTypeApporteurDto> | undefined): TypesApporteursModel[] {
    if (!content) {
      return [];
    }
    return content.map(dto => this.fromAllTypeApporteurDto(dto));
  }
}
