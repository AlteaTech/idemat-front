import {FormControl} from "@angular/forms";

export interface RechercheAvanceContratFormModel {
  trigramme: FormControl<string | null>;
  nom: FormControl<string | null>;
}
