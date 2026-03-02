import {FormControl} from "@angular/forms";

export interface RechercheAvanceSmartphoneFormModel {
  numSerie: FormControl<string | null>;
  nom: FormControl<string | null>;
  typeTerminal: FormControl<string | null>;
  isSpare: FormControl<boolean | null>;
  isActif: FormControl<boolean | null>;
}
