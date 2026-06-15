import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {BASE_PATH, Configuration} from '../core/api';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {environment} from '../environments/environment';
import {authInterceptor} from '../core/interceptors/auth.interceptor';
import {errorInterceptor} from '../core/interceptors/error.interceptor';


import {MatPaginatorIntl} from '@angular/material/paginator';
import {MatPaginatorIntlFr} from './core/i18n/mat-paginator-intl-fr';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import {provideAnimations} from '@angular/platform-browser/animations';
import {loaderInterceptor} from '../core/interceptors/loader.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor, loaderInterceptor]),
    ),
    provideAnimations(),

    {
      provide: Configuration,
      useFactory: () => {
        const config = new Configuration({basePath: environment.apiUrl});
        // Les services générés utilisent Accept: */* → Angular traite la réponse comme Blob.
        // On force application/json pour que les réponses soient correctement parsées.
        config.selectHeaderAccept = () => 'application/json';
        return config;
      },
    },


    {provide: MatPaginatorIntl, useClass: MatPaginatorIntlFr},
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {hideRequiredMarker: true}}
  ]
};
