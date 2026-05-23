import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-confirmation-suppression-compte',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './confirmation-suppression-compte.component.html',
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
