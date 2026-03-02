import {inject, Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {ConfirmationDialogComponent} from '../components/confirmation-dialog/confirmation-dialog.component';
import {ConfirmationDialogModel} from '../models/confirmation-dialog.model';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private dialog = inject(MatDialog);

  open(data: ConfirmationDialogModel): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: data,
      width: '400px',
      disableClose: true
    });

    return dialogRef.afterClosed();
  }
}
