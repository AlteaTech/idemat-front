import {AbstractControl, ValidationErrors} from '@angular/forms';

export function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const nouveau = control.get('nouveauMotDePasse')?.value;
  const confirmation = control.get('confirmation')?.value;
  return nouveau && confirmation && nouveau !== confirmation ? {passwordsMismatch: true} : null;
}
