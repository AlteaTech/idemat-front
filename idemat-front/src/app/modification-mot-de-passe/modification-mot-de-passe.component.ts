import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {UsagerIdematServiceAgents} from '../../services/agents/idemat/usager-idemat-service-agents';
import {UsagerIdematModel} from '../../models/idemat/usager-idemat.model';
import {AuthService} from '../../services/auth/auth.service';
import {routesConstantes} from '../../constantes/routes.constantes';
import {passwordsMatchValidator} from '../../validateurs/passwords-match.validator';
import {motDePasseComplexiteValidator} from '../../validateurs/mot-de-passe-complexite.validator';
import {ModificationMotDePasseFormModel} from '../../models/forms/modification-mot-de-passe-form.model';

@Component({
  selector: 'app-modification-mot-de-passe',
  imports: [ReactiveFormsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './modification-mot-de-passe.component.html',
  styleUrl: './modification-mot-de-passe.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModificationMotDePasseComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly usagerService = inject(UsagerIdematServiceAgents);
  private readonly authService = inject(AuthService);

  protected usager = signal<UsagerIdematModel | null>(null);
  protected enCours = signal(false);
  protected erreur = signal('');
  protected afficherAncien = signal(false);
  protected afficherNouveau = signal(false);
  protected afficherConfirmation = signal(false);

  protected form = new FormGroup<ModificationMotDePasseFormModel>({
    ancienMotDePasse: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    nouveauMotDePasse: new FormControl('', {nonNullable: true, validators: [Validators.required, motDePasseComplexiteValidator]}),
    confirmation: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
  }, {validators: passwordsMatchValidator});

  // Critères de complexité affichés en direct entre les champs (issue #383) — même regex que le back
  protected get critereLongueur(): boolean {
    const valeur = this.form.controls.nouveauMotDePasse.value;
    return valeur.length >= 8 && valeur.length <= 15;
  }

  protected get critereMajuscule(): boolean {
    return /[A-Z]/.test(this.form.controls.nouveauMotDePasse.value);
  }

  protected get critereMinuscule(): boolean {
    return /[a-z]/.test(this.form.controls.nouveauMotDePasse.value);
  }

  protected get critereChiffre(): boolean {
    return /[0-9]/.test(this.form.controls.nouveauMotDePasse.value);
  }

  protected get critereSpecial(): boolean {
    return /[^a-zA-Z0-9]/.test(this.form.controls.nouveauMotDePasse.value);
  }

  ngOnInit(): void {
    this.usagerService.getUsager().subscribe(u => this.usager.set(u));
  }

  protected retour(): void {
    this.router.navigate(['/' + routesConstantes.parametresCompte]);
  }

  protected onSubmit(): void {
    if (this.form.invalid) return;
    this.enCours.set(true);
    this.erreur.set('');
    const {ancienMotDePasse, nouveauMotDePasse} = this.form.getRawValue();
    const etaitObligatoire = !this.authService.hasChangedPassword();
    this.usagerService.updateMotDePasse(ancienMotDePasse, nouveauMotDePasse).subscribe({
      next: () => {
        this.authService.markPasswordChanged();
        this.router.navigate(['/' + (etaitObligatoire ? routesConstantes.home : routesConstantes.parametresCompte)]);
      },
      error: (err) => {
        this.enCours.set(false);
        this.erreur.set(err?.error?.message ?? 'Une erreur est survenue, veuillez réessayer.');
      },
    });
  }
}
