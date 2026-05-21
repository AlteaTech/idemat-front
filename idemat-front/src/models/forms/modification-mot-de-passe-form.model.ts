import {FormControl} from '@angular/forms';

export interface ModificationMotDePasseFormModel {
  ancienMotDePasse: FormControl<string>;
  nouveauMotDePasse: FormControl<string>;
  confirmation: FormControl<string>;
}
