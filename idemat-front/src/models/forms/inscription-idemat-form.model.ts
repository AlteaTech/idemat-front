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
  codePostal: FormControl<string>;
  ville: FormControl<string>;
  email: FormControl<string>;
  telephone: FormControl<string>;
  cartePhysique: FormControl<boolean>;
  carteDematerialisee: FormControl<boolean>;
  mentionsLegales: FormControl<boolean>;
}
