import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {ZONES_J1} from '../../../constantes/inscription.constantes';
import {MajusculeOnlyDirective} from '../../../directives/majuscule-only.directive';
import {AlphaNumOnlyDirective} from '../../../directives/alpha-num-only.directive';
import {ChiffresOnlyDirective} from '../../../directives/chiffres-only.directive';
import {VehiculeFormModel} from '../../../models/forms/vehicule-form.model';
import {AjouterVehiculeDialogData, AjouterVehiculeDialogResult} from '../../../models/idemat/ajouter-vehicule-dialog.model';

@Component({
  selector: 'app-ajouter-vehicule-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MajusculeOnlyDirective, AlphaNumOnlyDirective, ChiffresOnlyDirective],
  templateUrl: './ajouter-vehicule-dialog.component.html',
  styleUrl: './ajouter-vehicule-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AjouterVehiculeDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AjouterVehiculeDialogComponent>);
  protected readonly data = inject<AjouterVehiculeDialogData>(MAT_DIALOG_DATA);

  protected fileCarteGrise = signal<File | null>(null);
  protected erreurFichier = signal(false);

  readonly zonesJ1 = ZONES_J1;

  protected form = new FormGroup<VehiculeFormModel>({
    immatriculation: new FormControl(this.data.immatriculation ?? '', {nonNullable: true, validators: [Validators.required]}),
    zoneJ1: new FormControl('', {
      nonNullable: true,
      validators: this.data.contrat.demandeZoneJ1F3 ? [Validators.required] : [],
    }),
    zoneF3: new FormControl('', {
      nonNullable: true,
      validators: this.data.contrat.demandeZoneJ1F3
        ? [Validators.required, Validators.pattern('^[0-9]+$')]
        : [Validators.pattern('^[0-9]+$')],
    }),
  });

  get contrat() { return this.data.contrat; }
  get showZones() { return this.data.contrat.demandeZoneJ1F3; }

  protected onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.fileCarteGrise.set(file);
    this.erreurFichier.set(false);
  }

  protected onConfirmer(): void {
    if (this.form.invalid) return;
    if (!this.fileCarteGrise()) { this.erreurFichier.set(true); return; }
    const {immatriculation, zoneJ1, zoneF3} = this.form.getRawValue();
    const label = this.showZones && zoneJ1 && zoneF3
      ? `${immatriculation} (${zoneJ1}-${zoneF3} kg)`
      : immatriculation;
    this.dialogRef.close({label, immatriculation, zoneJ1, zoneF3, fileCarteGrise: this.fileCarteGrise()} as AjouterVehiculeDialogResult);
  }

  protected onAnnuler(): void {
    this.dialogRef.close(undefined);
  }
}
