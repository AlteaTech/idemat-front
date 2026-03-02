import {AllMotifListeNoireDto, MotifListeNoireDto} from "../../core/api";

export class MotifsListeNoireModel {

  id: number = 0;
  libelle: string = "";

  static fromArrayAllMotifListeNoireDto(content: Array<AllMotifListeNoireDto> | undefined): MotifsListeNoireModel[] {
    if (!content) {
      return [];
    }
    return content.map(dto => this.fromAllMotifListeNoireDto(dto));
  }


  static fromMotifListeNoireDto(dto: MotifListeNoireDto): MotifsListeNoireModel {
    let retour: MotifsListeNoireModel = {
      id: dto.id,
      libelle: dto.libelle
    };
    return retour;
  }

  private static fromAllMotifListeNoireDto(dto: AllMotifListeNoireDto): MotifsListeNoireModel {
    let retour: MotifsListeNoireModel = {
      id: dto.id,
      libelle: dto.libelle
    };
    return retour;
  }
}
