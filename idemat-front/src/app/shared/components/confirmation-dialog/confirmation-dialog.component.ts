import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {ConfirmationDialogModel} from '../../models/confirmation-dialog.model';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {
  public data: ConfirmationDialogModel = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<ConfirmationDialogComponent>);

  onConfirm(): void {
    this.data.action.subscribe({
      next: (result) => {
        this.dialogRef.close(result);
      },
      error: (err) => {
        console.error('Action in confirmation dialog failed', err);
        this.dialogRef.close(false);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
