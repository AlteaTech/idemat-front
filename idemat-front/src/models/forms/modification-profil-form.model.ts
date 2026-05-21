import {FormControl} from '@angular/forms';

export interface ModificationProfilFormModel {
  nomPrenom: FormControl<string>;
  adresse: FormControl<string>;
  telephone: FormControl<string>;
  codePostal: FormControl<string>;
  ville: FormControl<string>;
}
