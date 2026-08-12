import {AbstractControl, ValidationErrors} from '@angular/forms';

// Même regex que MotDePasseHelper.isMotdePasseValide (back) : 8-15 car., maj/min/chiffre/spécial
export const motDePasseComplexiteRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,15}$/;

export function motDePasseComplexiteValidator(control: AbstractControl): ValidationErrors | null {
  const valeur = control.value ?? '';
  return motDePasseComplexiteRegex.test(valeur) ? null : {complexite: true};
}
