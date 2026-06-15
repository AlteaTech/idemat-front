import {FormControl} from '@angular/forms';

export interface ModificationProfilFormModel {
  nom: FormControl<string>;
  prenom: FormControl<string>;
  adresse: FormControl<string>;
  telephone: FormControl<string>;
  codePostal: FormControl<string>;
  ville: FormControl<string>;
}
