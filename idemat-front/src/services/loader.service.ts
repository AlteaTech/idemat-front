import {inject, Injectable} from '@angular/core';
import {LoaderDialogComponent} from '../app/shared/components/loader-dialog/loader-dialog.component';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private dialogRef: MatDialogRef<LoaderDialogComponent> | null = null;
  private nbRequetesEnCours = 0;
  private dialog = inject(MatDialog);

  openLoaderDialog() {
    if (this.nbRequetesEnCours === 0) {
      this.dialogRef = this.dialog.open(LoaderDialogComponent, {
        disableClose: true
      });
    }
    this.nbRequetesEnCours++;
  }

  closeLoaderDialog() {
    this.nbRequetesEnCours--;
    if (this.nbRequetesEnCours <= 0) {
      this.nbRequetesEnCours = 0;
      this.dialogRef?.close();
      this.dialogRef = null;
    }
  }
}
