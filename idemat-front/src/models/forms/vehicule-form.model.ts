import {FormControl} from '@angular/forms';

export interface VehiculeFormModel {
  immatriculation: FormControl<string>;
  zoneJ1: FormControl<string>;
  zoneF3: FormControl<string>;
}
