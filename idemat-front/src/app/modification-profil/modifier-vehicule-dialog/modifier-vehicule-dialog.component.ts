import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {VehiculeFormModel} from '../../../models/forms/vehicule-form.model';
import {ZONES_J1} from '../../../constantes/inscription.constantes';
import {ModifierVehiculeDialogData, ModifierVehiculeDialogResult} from '../../../models/idemat/modifier-vehicule-dialog.model';

@Component({
  selector: 'app-modifier-vehicule-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './modifier-vehicule-dialog.component.html',
  styleUrl: './modifier-vehicule-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModifierVehiculeDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ModifierVehiculeDialogComponent>);
  protected readonly data = inject<ModifierVehiculeDialogData>(MAT_DIALOG_DATA);

  readonly zonesJ1 = ZONES_J1;

  protected form = new FormGroup<VehiculeFormModel>({
    immatriculation: new FormControl(this.data.vehicule.immatriculation, {nonNullable: true, validators: [Validators.required]}),
    zoneJ1: new FormControl(this.data.vehicule.zoneJ1 ?? '', {nonNullable: true}),
    zoneF3: new FormControl(this.data.vehicule.zoneF3?.toString() ?? '', {nonNullable: true, validators: [Validators.pattern('^[0-9]+$')]}),
  });

  get showZones(): boolean {
    return this.data.isPro || this.data.contrat.demandeZoneJ1F3;
  }

  protected onConfirmer(): void {
    if (this.form.invalid) return;
    const {immatriculation, zoneJ1, zoneF3} = this.form.getRawValue();
    this.dialogRef.close({
      nouvelleImmatriculation: immatriculation,
      zoneJ1: zoneJ1 || undefined,
      zoneF3: zoneF3 ? Number(zoneF3) : undefined,
    } as ModifierVehiculeDialogResult);
  }

  protected onAnnuler(): void {
    this.dialogRef.close(undefined);
  }
}
