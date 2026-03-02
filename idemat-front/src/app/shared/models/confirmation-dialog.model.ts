import {Observable} from "rxjs";

export interface ConfirmationDialogModel {
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  action: Observable<any>;
}
