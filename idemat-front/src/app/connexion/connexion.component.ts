import {AfterViewInit, Component, effect, inject, NgZone, signal} from '@angular/core';
import {AuthService} from '../../services/auth/auth.service';
import {Router} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';


import {MatButtonModule} from '@angular/material/button';
import {MatError, MatFormField, MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {routesConstantes} from '../../constantes/routes.constantes';
import {LoginFormModel} from '../../models/forms/login-form-model';
import {AuthenticationServiceAgents} from '../../services/agents/authentication-service-agents';

declare var google: any;

@Component({
  selector: 'app-connexion',
  imports: [
    MatError,
    MatFormField,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonToggleGroup,
    MatIconModule,
    MatButtonToggle
  ],
  templateUrl: './connexion.component.html',
  styleUrl: './connexion.component.scss',
})
export class ConnexionComponent implements AfterViewInit {
  authService = inject(AuthService);
  router = inject(Router);
  ngZone = inject(NgZone);

  loginMode = signal<'veolia' | 'external'>('external');

  loginForm = new FormGroup<LoginFormModel>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });
  private apiService = inject(AuthenticationServiceAgents);
  private clientId = '830537101442-hdge5v34pqu69m8i3oc9221bnv7oevmc.apps.googleusercontent.com';

  constructor() {
    if (this.authService.isLoggedIn()) {
      this.authService.logout()
    }
    effect(() => {
      if (this.loginMode() === 'veolia') {
        setTimeout(() => this.loadGsiScript(), 100);
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.loginMode() === 'veolia') {
      this.loadGsiScript();
    }
  }

  onExternalLogin() {
    if (this.loginForm.valid) {
      this.apiService.authenticateUser(this.loginForm.value.email ?? "", this.loginForm.value.password ?? "")
        .subscribe({
          next: (resp) => {
            this.authService.loginSuccess({
              sub: 'ext-' + Math.random(),
              name: 'Utilisateur Externe',
              email: this.loginForm.value.email!,
              picture: 'https://ui-avatars.com/api/?name=User+Ext&background=random',
              idGoogle: '',
              jwt: resp,
            });
            this.ngZone.run(() => {
              this.goToProfile();
            });
          },
          error: (err) => {
            console.error('Erreur lors de l\'appel back', err);
          }
        });
    }
  }

  goToProfile(): void {
    this.router.navigate(['/' + routesConstantes.home]);
  }

  goToMotDePasseOublie():void{
    this.router.navigate(['/' + routesConstantes.motDePasseOublie]);
  }

  private loadGsiScript() {
    if (document.getElementById('google-gsi-script')) {
      this.initializeGoogleSignIn();
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => this.initializeGoogleSignIn();
    document.body.appendChild(script);
  }

  private initializeGoogleSignIn() {
    if (typeof google === 'undefined') return;

    google.accounts.id.initialize({
      client_id: this.clientId,
      callback: this.handleCredentialResponse.bind(this),
    });

    const buttonDiv = document.getElementById('google-signin-button');
    if (buttonDiv) {
      google.accounts.id.renderButton(buttonDiv, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'signin_with',
        shape: 'pill',
      });
    }
  }

  private handleCredentialResponse(response: any): void {
    if (!response.credential) return;
    const payload = JSON.parse(atob(response.credential.split('.')[1]));

    this.authService.loginSuccess({
      sub: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      idGoogle: '',
      jwt: ''
    });

    this.ngZone.run(() => {
      this.goToProfile();
    });
  }
}
