import {Routes} from '@angular/router';
import {ConnexionComponent} from './connexion/connexion.component';
import {ConnexionIdematComponent} from './connexion-idemat/connexion-idemat.component';
import {IdematShellComponent} from './idemat-shell/idemat-shell.component';
import {HomeComponent} from './home/home.component';
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
import {NouveauMotDePasseComponent} from './nouveau-mot-de-passe/nouveau-mot-de-passe.component';
import {MesDepotsComponent} from './mes-depots/mes-depots.component';
import {authGuard} from './core/guards/auth.guard';
import {passwordChangedGuard} from './core/guards/password-changed.guard';

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
  {path: `${routesConstantes.nouveauMotDePasse}/:contrat`, component: NouveauMotDePasseComponent},

  // --- ROUTES PROTÉGÉES (shell IDemat) ---
  {
    path: '',
    canActivate: [authGuard],
    component: IdematShellComponent,
    children: [
      {path: '', redirectTo: routesConstantes.home, pathMatch: 'full'},
      {path: routesConstantes.modificationMotDePasseIdemat, component: ModificationMotDePasseComponent},

      {path: routesConstantes.home, component: HomeComponent, canActivate: [passwordChangedGuard]},
      {path: routesConstantes.carteAcces, component: CarteAccesComponent, canActivate: [passwordChangedGuard]},
      {path: routesConstantes.dechetteries, component: DechetteriesComponent, canActivate: [passwordChangedGuard]},
      {path: routesConstantes.dechetterieDetail, component: DechetterieDetailComponent, canActivate: [passwordChangedGuard]},
      {path: routesConstantes.consultationSolde, component: PassagesPointsComponent, canActivate: [passwordChangedGuard]},
      {path: routesConstantes.achatPassages, component: AchatPassagesComponent, canActivate: [passwordChangedGuard]},
      {path: routesConstantes.mentionsLegales, component: MentionsLegalesComponent, canActivate: [passwordChangedGuard]},
      {path: routesConstantes.informationsPersonnelles, component: InformationsPersonnellesComponent, canActivate: [passwordChangedGuard]},
      {path: routesConstantes.parametresCompte, component: ParametresCompteComponent, canActivate: [passwordChangedGuard]},
      {path: routesConstantes.modificationEmail, component: ModificationEmailComponent, canActivate: [passwordChangedGuard]},
      {path: routesConstantes.modificationProfil, component: ModificationProfilComponent, canActivate: [passwordChangedGuard]},
      {path: routesConstantes.mesDepots, component: MesDepotsComponent, canActivate: [passwordChangedGuard]},
    ]
  },

  {path: '**', redirectTo: routesConstantes.home}
];
