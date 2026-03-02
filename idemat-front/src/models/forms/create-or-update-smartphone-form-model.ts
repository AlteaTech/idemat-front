import {FormControl} from "@angular/forms";

export interface CreateOrUpdateSmartphoneFormModel {
  numSerie: FormControl<string | undefined>;
  nom: FormControl<string>;
  typeTerminal: FormControl<string | undefined>;
  isSpare: FormControl<boolean>;
  isActif: FormControl<boolean>;
  contratId: FormControl<number>;
}
