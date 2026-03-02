import {FormControl} from "@angular/forms";

export interface RechercheAvanceCommuneFormModel {
  ville: FormControl<string | null>;
  codePostal: FormControl<string | null>;
  pays: FormControl<string | null>;
}
