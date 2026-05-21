import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {ConnexionIdematFormModel} from '../../models/forms/connexion-idemat-form.model';

import {AuthService} from '../../services/auth/auth.service';
import {AuthenticationServiceAgents} from '../../services/agents/authentication-service-agents';
import {ContratIdematServiceAgents} from '../../services/agents/idemat/contrat-idemat-service-agents';
import {routesConstantes} from '../../constantes/routes.constantes';

@Component({
  selector: 'app-connexion-idemat',
  imports: [ReactiveFormsModule, MatProgressSpinnerModule],
  templateUrl: './connexion-idemat.component.html',
  styleUrl: './connexion-idemat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnexionIdematComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly apiService = inject(AuthenticationServiceAgents);
  private readonly contratService = inject(ContratIdematServiceAgents);

  protected contrat = signal<string | null>(null);
  protected logoUrl = signal('');
  protected enCours = signal(false);
  protected erreurLogin = signal(false);
  protected erreurMotdepasse = signal(false);
  protected erreurCompteSupprime = signal(false);

  protected form = new FormGroup<ConnexionIdematFormModel>({
    login: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    motdepasse: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
  });

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.logout();
    }
    this.route.paramMap.subscribe(params => {
      const contrat = params.get('contrat');
      this.contrat.set(contrat);
      if (contrat) {
        this.contratService.getContratByUrl(contrat).subscribe(c => {
          this.logoUrl.set(c.logoUrl);
        });
      }
    });
  }

  protected onLogin(): void {
    this.erreurLogin.set(false);
    this.erreurMotdepasse.set(false);
    this.erreurCompteSupprime.set(false);
    if (this.form.invalid) return;
    this.enCours.set(true);
    const {login, motdepasse} = this.form.getRawValue();
    this.apiService.authenticateUser(login, motdepasse).subscribe({
      next: (resp) => {
        this.authService.loginSuccess({
          sub: 'ext-' + Math.random(),
          name: 'Utilisateur Idemat',
          email: login,
          picture: '',
          idGoogle: '',
          jwt: resp,
        });
        this.router.navigate(['/' + routesConstantes.home]);
      },
      error: (err) => {
        this.enCours.set(false);
        if (err.status === 403) {
          this.erreurCompteSupprime.set(true);
        } else {
          this.erreurLogin.set(true);
        }
      },
    });
  }

  protected onMotDePasseOublie(): void {
    // TODO #122 : naviguer vers l'écran mot de passe oublié IDemat
    this.router.navigate(['/' + routesConstantes.motDePasseOublie]);
  }

  protected onSInscrire(): void {
    const contrat = this.contrat() ?? 'default';
    this.router.navigate([`/${routesConstantes.creationCompte}/${contrat}`]);
  }
}
