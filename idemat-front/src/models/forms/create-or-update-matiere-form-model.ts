import {FormControl} from "@angular/forms";

export interface CreateOrUpdateMatiereFormModel {
  libelle: FormControl<string>;
  code: FormControl<string>;
}
