import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export interface ConfirmationSuppressionVehiculeData {
  immatriculation: string;
}

@Component({
  selector: 'app-confirmation-suppression-vehicule',
  imports: [],
  templateUrl: './confirmation-suppression-vehicule.component.html',
  styleUrl: './confirmation-suppression-vehicule.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationSuppressionVehiculeComponent {
  protected readonly data = inject<ConfirmationSuppressionVehiculeData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ConfirmationSuppressionVehiculeComponent>);

  protected annuler(): void {
    this.dialogRef.close(false);
  }

  protected confirmer(): void {
    this.dialogRef.close(true);
  }
}
