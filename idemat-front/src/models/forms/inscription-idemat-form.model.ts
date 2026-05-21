import {FormControl} from '@angular/forms';

export interface InscriptionIdematFormModel {
  societe: FormControl<string>;
  siret: FormControl<string>;
  civilite: FormControl<string>;
  nom: FormControl<string>;
  prenom: FormControl<string>;
  adresse: FormControl<string>;
  codePostal: FormControl<string>;
  ville: FormControl<string>;
  email: FormControl<string>;
  telephone: FormControl<string>;
  cartePhysique: FormControl<boolean>;
  carteDematerialisee: FormControl<boolean>;
  mentionsLegales: FormControl<boolean>;
  immatriculation: FormControl<string>;
  zoneJ1: FormControl<string>;
  zoneF3: FormControl<string>;
}
