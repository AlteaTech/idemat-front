import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {ConnexionIdematFormModel} from '../../models/forms/connexion-idemat-form.model';

import {AuthService} from '../../services/auth/auth.service';
import {AuthIdmControllerService} from '../../core/api/api/auth-idm-controller.service';
import {ContratControllerService} from '../../core/api/api/contrat-controller.service';
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
  private readonly apiService = inject(AuthIdmControllerService);
  private readonly contratService = inject(ContratControllerService);

  protected contrat = signal<string | null>(null);
  protected logoUrl = signal('');
  protected nomContrat = signal('');
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
      this.authService.clearSession();
    }
    this.route.paramMap.subscribe(params => {
      const contrat = params.get('contrat');
      this.contrat.set(contrat);
      if (contrat) {
        this.contratService.getByUrl(contrat).subscribe(c => {
          this.nomContrat.set(c.nom);
          if (c.logoBase64 && c.logoMime) {
            this.logoUrl.set(`data:${c.logoMime};base64,${c.logoBase64}`);
          }
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
    this.apiService.login({courriel: login, motDePasse: motdepasse}).subscribe({
      next: (resp) => {
        this.authService.loginSuccess({
          sub: 'ext-' + Math.random(),
          name: 'Utilisateur Idemat',
          email: login,
          picture: '',
          idGoogle: '',
          jwt: resp.token,
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
    const contrat = this.contrat();
    const path = contrat
      ? `/${routesConstantes.motDePasseOublie}/${contrat}`
      : `/${routesConstantes.motDePasseOublie}`;
    this.router.navigate([path]);
  }

  protected onSInscrire(): void {
    const contrat = this.contrat();
    if (!contrat) return;
    this.router.navigate([`/${routesConstantes.creationCompte}/${contrat}`]);
  }
}
