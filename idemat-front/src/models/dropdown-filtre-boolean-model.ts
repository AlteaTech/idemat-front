export class DropdownFiltreBooleanModel {
  libelle: string = '';
  valeur?: boolean = undefined;

  constructor(libelle: string, valeur?: boolean) {
    this.libelle = libelle;
    this.valeur = valeur;
  }

  static getAllValues(): DropdownFiltreBooleanModel[] {
    return [
      new DropdownFiltreBooleanModel('Tous', undefined),
      new DropdownFiltreBooleanModel('Oui', true),
      new DropdownFiltreBooleanModel('Non', false),
    ];
  }
}
