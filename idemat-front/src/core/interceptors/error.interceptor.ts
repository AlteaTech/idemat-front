import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {catchError, throwError} from 'rxjs';
import {ApiError} from '../api/model/api-error.model';
import {ErrorDialogComponent} from '../../app/shared/components/error-dialog/error-dialog.component';
import {ErrorDialogData} from '../../models/error-dialog-data';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const dialog = inject(MatDialog);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur inattendue est survenue.';
      let errorTitle = 'Erreur';
      let errorType: 'error' | 'warning' = 'error';

      if (error.error && typeof error.error === 'object' && 'message' in error.error) {
        const apiError = error.error as ApiError;
        errorMessage = apiError.message;

        if (error.status === 400) {
          errorTitle = 'Attention';
          errorType = 'warning';
        }
      } else if (error.status === 400) {
        errorMessage = 'Requête invalide (400).';
        errorTitle = 'Attention';
        errorType = 'warning';
      } else if (error.status === 500) {
        errorMessage = 'Erreur serveur (500).';
      }

      dialog.open(ErrorDialogComponent, {
        data: {
          title: errorTitle,
          message: errorMessage,
          type: errorType
        } as ErrorDialogData,
        width: '400px'
      });

      return throwError(() => error);
    })
  );
};
