import {Routes} from '@angular/router';
import {ConnexionComponent} from './connexion/connexion.component';
import {ConnexionIdematComponent} from './connexion-idemat/connexion-idemat.component';
import {IdematShellComponent} from './idemat-shell/idemat-shell.component';
import {HomeComponent} from './home/home.component';
import {LoggedComponent} from './logged/logged.component';
import {routesConstantes} from '../constantes/routes.constantes';
import {CarteAccesComponent} from './carte-acces/carte-acces.component';
import {DechetteriesComponent} from './dechetteries/dechetteries.component';
import {DechetterieDetailComponent} from './dechetterie-detail/dechetterie-detail.component';
import {PassagesPointsComponent} from './passages-points/passages-points.component';
import {AchatPassagesComponent} from './achat-passages/achat-passages.component';
import {MentionsLegalesComponent} from './mentions-legales/mentions-legales.component';
import {InformationsPersonnellesComponent} from './informations-personnelles/informations-personnelles.component';
import {ParametresCompteComponent} from './parametres-compte/parametres-compte.component';
import {ModificationEmailComponent} from './modification-email/modification-email.component';
import {ModificationMotDePasseComponent} from './modification-mot-de-passe/modification-mot-de-passe.component';
import {ModificationProfilComponent} from './modification-profil/modification-profil.component';
import {MotDePasseOublieIdematComponent} from './mot-de-passe-oublie-idemat/mot-de-passe-oublie-idemat.component';
import {InscriptionTypeComponent} from './inscription-type/inscription-type.component';
import {InscriptionComponent} from './inscription/inscription.component';
import {DemandOkIdematComponent} from './demande-ok-idemat/demande-ok-idemat.component';
import {MocksComponent} from '../mocks/mocks.component';
import {authGuard} from './core/guards/auth.guard';

export const routes: Routes = [
  // --- ROUTES PUBLIQUES ---
  {path: routesConstantes.login, component: ConnexionComponent},
  {path: routesConstantes.connexionIdemat, component: ConnexionIdematComponent},
  {path: `${routesConstantes.connexionIdemat}/:contrat`, component: ConnexionIdematComponent},
  {path: routesConstantes.motDePasseOublie, component: MotDePasseOublieIdematComponent},
  {path: `${routesConstantes.motDePasseOublie}/:contrat`, component: MotDePasseOublieIdematComponent},
  {path: `${routesConstantes.creationCompte}/:contrat`, component: InscriptionTypeComponent},
  {path: `${routesConstantes.creationCompte}/:contrat/:type`, component: InscriptionComponent},
  {path: routesConstantes.demandeOk, component: DemandOkIdematComponent},

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

      {path: routesConstantes.carteAcces, component: CarteAccesComponent},
      {path: routesConstantes.dechetteries, component: DechetteriesComponent},
      {path: routesConstantes.dechetterieDetail, component: DechetterieDetailComponent},
      {path: routesConstantes.consultationSolde, component: PassagesPointsComponent},
      {path: routesConstantes.achatPassages, component: AchatPassagesComponent},
      {path: routesConstantes.mentionsLegales, component: MentionsLegalesComponent},
      {path: routesConstantes.informationsPersonnelles, component: InformationsPersonnellesComponent},
      {path: routesConstantes.parametresCompte, component: ParametresCompteComponent},
      {path: routesConstantes.modificationEmail, component: ModificationEmailComponent},
      {path: routesConstantes.modificationMotDePasseIdemat, component: ModificationMotDePasseComponent},
      {path: routesConstantes.modificationProfil, component: ModificationProfilComponent},
      // IDEMAT - à compléter au fil des issues
      // {path: routesConstantes.dechetteries, component: DechetteriesComponent},
      // {path: routesConstantes.consultationSolde, component: ConsultationSoldeComponent},
      // {path: routesConstantes.achatPassages, component: AchatPassagesComponent},
      // {path: routesConstantes.informationsPersonnelles, component: InformationsPersonnellesComponent},
      // {path: routesConstantes.mentionsLegales, component: MentionsLegalesComponent},
    ]
  },

  {path: '**', redirectTo: routesConstantes.home}
];
