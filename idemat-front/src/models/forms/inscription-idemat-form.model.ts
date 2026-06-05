import {FormControl} from '@angular/forms';

export interface InscriptionIdematFormModel {
  societe: FormControl<string>;
  siret: FormControl<string>;
  nom: FormControl<string>;
  prenom: FormControl<string>;
  deuxiemeNom: FormControl<string>;
  deuxiemePrenom: FormControl<string>;
  adresse: FormControl<string>;
  complementAdresse: FormControl<string>;
  communeContratId: FormControl<number | null>;
  email: FormControl<string>;
  telephone: FormControl<string>;
  cartePhysique: FormControl<boolean>;
  mentionsLegales: FormControl<boolean>;
}
