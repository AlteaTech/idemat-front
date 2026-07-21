import {AbstractControl, ValidationErrors} from '@angular/forms';

// Algorithme repris de l'écran usagers du BO (idbatv7-front, create-or-update-usager-form-validators.ts)
// — double Luhn : SIREN (9 premiers chiffres) puis SIRET complet (14 chiffres).
export function siretValidator(control: AbstractControl): ValidationErrors | null {
  const siret = control.value;

  if (!siret || siret.length !== 14) return {pattern: true};

  let cumulImpair = 0;
  for (let i = 1; i <= 9; i += 2) {
    cumulImpair += parseInt(siret.substring(i - 1, i), 10);
  }
  let cumulPair = 0;
  for (let i = 2; i <= 8; i += 2) {
    let j = parseInt(siret.substring(i - 1, i), 10) * 2;
    if (j > 9) j = 1 + (j - 10);
    cumulPair += j;
  }
  if ((cumulImpair + cumulPair) % 10 !== 0) return {formatInvalide: true};

  cumulImpair = 0;
  for (let i = 1; i <= 13; i += 2) {
    let j = parseInt(siret.substring(i - 1, i), 10) * 2;
    if (j > 9) j = 1 + (j - 10);
    cumulImpair += j;
  }
  cumulPair = 0;
  for (let i = 2; i <= 14; i += 2) {
    cumulPair += parseInt(siret.substring(i - 1, i), 10);
  }
  if ((cumulImpair + cumulPair) % 10 !== 0) return {formatInvalide: true};

  return null;
}
