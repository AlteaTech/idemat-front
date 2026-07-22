import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-suppression-compte',
  imports: [],
  templateUrl: './confirmation-suppression-compte.component.html',
  styleUrl: './confirmation-suppression-compte.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationSuppressionCompteComponent {
  private readonly dialogRef = inject(MatDialogRef<ConfirmationSuppressionCompteComponent>);

  protected annuler(): void {
    this.dialogRef.close(false);
  }

  protected confirmer(): void {
    this.dialogRef.close(true);
  }
}
