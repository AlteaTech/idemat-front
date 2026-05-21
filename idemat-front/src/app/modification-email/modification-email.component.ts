import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {UsagerIdematServiceAgents} from '../../services/agents/idemat/usager-idemat-service-agents';
import {routesConstantes} from '../../constantes/routes.constantes';
import {ModificationEmailFormModel} from '../../models/forms/modification-email-form.model';

@Component({
  selector: 'app-modification-email',
  imports: [ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  templateUrl: './modification-email.component.html',
  styleUrl: './modification-email.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModificationEmailComponent {
  private readonly router = inject(Router);
  private readonly usagerService = inject(UsagerIdematServiceAgents);

  protected enCours = signal(false);

  protected form = new FormGroup<ModificationEmailFormModel>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    })
  });

  protected retour(): void {
    this.router.navigate(['/' + routesConstantes.parametresCompte]);
  }

  protected onSubmit(): void {
    if (this.form.invalid) return;
    this.enCours.set(true);
    this.usagerService.updateEmail(this.form.getRawValue().email).subscribe({
      next: () => this.router.navigate(['/' + routesConstantes.parametresCompte]),
      error: () => this.enCours.set(false),
    });
  }
}
