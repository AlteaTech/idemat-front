import {FormControl} from "@angular/forms";

export interface RechercheAvanceMatiereFormModel {
  libelle: FormControl<string | null>;
  code: FormControl<string | null>;
}
