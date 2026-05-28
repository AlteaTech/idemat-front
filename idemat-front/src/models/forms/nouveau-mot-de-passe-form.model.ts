import {FormControl} from '@angular/forms';

export interface NouveauMotDePasseFormModel {
  nouveauMotDePasse: FormControl<string>;
  confirmation: FormControl<string>;
}
