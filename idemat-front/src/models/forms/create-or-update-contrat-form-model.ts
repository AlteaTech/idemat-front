import {FormControl} from "@angular/forms";

export interface CreateOrUpdateContratFormModel {
  trigramme: FormControl<string>;
  nom: FormControl<string>;
}
