import { Component, inject, NgZone, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services/auth/auth.service';
import { AuthenticationServiceAgents } from '../../services/agents/authentication-service-agents';
import { routesConstantes } from '../../constantes/routes.constantes';

interface IdematLoginFormModel {
  login: FormControl<string>;
  motdepasse: FormControl<string>;
}

@Component({
  selector: 'app-connexion-idemat',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './connexion-idemat.component.html',
  styleUrls: ['./connexion-idemat.component.scss']
})
export class ConnexionIdematComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  ngZone = inject(NgZone);
  apiService = inject(AuthenticationServiceAgents);

  // Variables du modèle ASPX
  contrat: string | null = null;
  logoUrl: string = ''; // Model.Variables.strURLLogo
  idEnseigne: string = ''; // Model.Variables.idEnseigne

  // Gestion des erreurs comme dans le modèle ASPX
  erreurLogin: boolean = false;
  erreurMotdepasse: boolean = false;
  erreurCompteSupprime: boolean = false;

  loginForm = new FormGroup<IdematLoginFormModel>({
    login: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    motdepasse: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  constructor() {
    if (this.authService.isLoggedIn()) {
      this.authService.logout();
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.contrat = params.get('contrat');
      // TODO: Charger les variables du modèle (Logo, IdEnseigne) via une API si nécessaire
      // Pour l'instant, initialisé à vide comme demandé pour la traduction stricte
    });
  }

  onLogin() {
    // Réinitialisation des erreurs
    this.erreurLogin = false;
    this.erreurMotdepasse = false;
    this.erreurCompteSupprime = false;

    if (this.loginForm.valid) {
      const { login, motdepasse } = this.loginForm.getRawValue();

      this.apiService.authenticateUser(login, motdepasse)
        .subscribe({
          next: (resp) => {
            this.authService.loginSuccess({
              sub: 'ext-' + Math.random(),
              name: 'Utilisateur Idemat',
              email: login,
              picture: '',
              idGoogle: '',
              jwt: resp,
            });
            this.ngZone.run(() => {
              this.router.navigate(['/' + routesConstantes.home]);
            });
          },
          error: (err) => {
            // Mapping des codes d'erreur HTTP vers les booléens du modèle
            if (err.status === 401) {
                 // On ne sait pas distinguer login/mdp incorrect via un simple 401 générique souvent,
                 // mais pour l'exemple on active l'erreur générique ou on tente de deviner.
                 // Dans le doute, on peut activer erreurLogin ou erreurMotdepasse selon le retour backend précis.
                 // Ici je simule le comportement ASPX qui semblait les distinguer.
                 this.erreurLogin = true;
                 // Ou this.erreurMotdepasse = true;
            } else if (err.status === 403) {
                 this.erreurCompteSupprime = true;
            } else {
                 this.erreurLogin = true; // Fallback
            }
          }
        });
    }
  }
}
