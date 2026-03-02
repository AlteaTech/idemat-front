import {UtilisateurSiteDto} from '../../core/api';

export class UtilisateursSitesModel {
  id: number = 0;
  login: string = '';
  isAdmin: boolean = false;

  static fromUtilisateurSiteDto(dto: UtilisateurSiteDto): UtilisateursSitesModel {
    const model = new UtilisateursSitesModel();
    model.id = dto.id;
    model.login = dto.login;
    model.isAdmin = dto.isAdmin;
    return model;
  }
}
