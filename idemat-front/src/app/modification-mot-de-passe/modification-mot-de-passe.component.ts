import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {UsagerIdematServiceAgents} from '../../services/agents/idemat/usager-idemat-service-agents';
import {UsagerIdematModel} from '../../models/idemat/usager-idemat.model';
import {routesConstantes} from '../../constantes/routes.constantes';
import {passwordsMatchValidator} from '../../validateurs/passwords-match.validator';
import {ModificationMotDePasseFormModel} from '../../models/forms/modification-mot-de-passe-form.model';

@Component({
  selector: 'app-modification-mot-de-passe',
  imports: [ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './modification-mot-de-passe.component.html',
  styleUrl: './modification-mot-de-passe.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModificationMotDePasseComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly usagerService = inject(UsagerIdematServiceAgents);

  protected usager = signal<UsagerIdematModel | null>(null);
  protected enCours = signal(false);
  protected erreur = signal('');

  protected form = new FormGroup<ModificationMotDePasseFormModel>({
    ancienMotDePasse: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    nouveauMotDePasse: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.minLength(8)]}),
    confirmation: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
  }, {validators: passwordsMatchValidator});

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
    this.usagerService.updateMotDePasse(ancienMotDePasse, nouveauMotDePasse).subscribe({
      next: () => this.router.navigate(['/' + routesConstantes.parametresCompte]),
      error: (err) => {
        this.enCours.set(false);
        this.erreur.set(err?.error?.message ?? 'Une erreur est survenue, veuillez réessayer.');
      },
    });
  }
}
