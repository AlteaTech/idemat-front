import {Routes} from '@angular/router';
import {ConnexionComponent} from './connexion/connexion.component';
import {ConnexionIdematComponent} from './connexion-idemat/connexion-idemat.component';
import {IdematShellComponent} from './idemat-shell/idemat-shell.component';
import {HomeComponent} from './home/home.component';
import {LoggedComponent} from './logged/logged.component';
import {routesConstantes} from '../constantes/routes.constantes';
import {MocksComponent} from '../mocks/mocks.component';
import {authGuard} from './core/guards/auth.guard';

export const routes: Routes = [
  // --- ROUTES PUBLIQUES ---
  {path: routesConstantes.login, component: ConnexionComponent},
  {path: routesConstantes.connexionIdemat, component: ConnexionIdematComponent},
  {path: `${routesConstantes.connexionIdemat}/:contrat`, component: ConnexionIdematComponent},

  // --- ROUTES PROTÉGÉES (shell IDemat) ---
  {
    path: '',
    canActivate: [authGuard],
    component: IdematShellComponent,
    children: [
      {path: '', redirectTo: routesConstantes.home, pathMatch: 'full'},
      {path: routesConstantes.home, component: HomeComponent},
      {path: routesConstantes.profile, component: LoggedComponent},
      {path: routesConstantes.mocks, component: MocksComponent},

      // IDEMAT - à compléter au fil des issues
      // {path: routesConstantes.carteAcces, component: CarteAccesComponent},
      // {path: routesConstantes.dechetteries, component: DechetteriesComponent},
      // {path: routesConstantes.consultationSolde, component: ConsultationSoldeComponent},
      // {path: routesConstantes.achatPassages, component: AchatPassagesComponent},
      // {path: routesConstantes.informationsPersonnelles, component: InformationsPersonnellesComponent},
      // {path: routesConstantes.mentionsLegales, component: MentionsLegalesComponent},
    ]
  },

  {path: '**', redirectTo: routesConstantes.home}
];
