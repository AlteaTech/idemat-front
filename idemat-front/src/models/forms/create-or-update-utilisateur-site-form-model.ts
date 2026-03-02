import {FormControl} from "@angular/forms";

export interface CreateOrUpdateUtilisateurSiteFormModel {
  login: FormControl<string>;
  motDePasse: FormControl<string>;
  isAdmin: FormControl<boolean>;
}
