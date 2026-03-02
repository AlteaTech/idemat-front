import {Routes} from '@angular/router';
import {LoggedComponent} from './logged/logged.component';
import {HomeComponent} from './home/home.component';
import {ConnexionComponent} from './connexion/connexion.component';
import {routesConstantes} from '../constantes/routes.constantes';
import {MocksComponent} from '../mocks/mocks.component';
import {authGuard} from './core/guards/auth.guard';

export const routes: Routes = [
  // --- ROUTES PUBLIQUES ---
  {path: routesConstantes.login, component: ConnexionComponent},

  // --- ROUTES PROTÉGÉES ---
  {
    path: '', // Route parente
    canActivate: [authGuard], // Le guard s'applique à tous les enfants
    children: [
      {path: '', redirectTo: 'home', pathMatch: 'full'},
      {path: routesConstantes.home, component: HomeComponent, pathMatch: 'full'},
      {path: routesConstantes.profile, component: LoggedComponent, pathMatch: 'full'},
      {path: routesConstantes.mocks, component: MocksComponent},
   ]
  },

  {path: '**', redirectTo: 'home'}
];
