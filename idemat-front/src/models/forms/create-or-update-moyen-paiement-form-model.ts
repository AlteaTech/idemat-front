// On peut créer un modèle de formulaire si nécessaire, mais pour un seul champ, ce n'est pas obligatoire.
import {FormControl} from "@angular/forms";

export interface CreateOrUpdateMoyenPaiementFormModel {
  libelle: FormControl<string>;
}
