import {HttpInterceptorFn} from '@angular/common/http';
import {finalize} from 'rxjs';
import {inject} from '@angular/core';
import {LoaderService} from '../../services/loader.service';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);

  loaderService.openLoaderDialog();

  return next(req).pipe(
    finalize(() => loaderService.closeLoaderDialog())
  );
};
