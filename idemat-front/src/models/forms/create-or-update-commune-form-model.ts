import {FormControl} from "@angular/forms";

export interface CreateOrUpdateCommuneFormModel {
  ville: FormControl<string>;
  codePostal: FormControl<string>;
  pays: FormControl<string>;
}
