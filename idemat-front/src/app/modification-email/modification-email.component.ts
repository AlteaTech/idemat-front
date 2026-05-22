import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {interval, take} from 'rxjs';

import {UsagerIdematServiceAgents} from '../../services/agents/idemat/usager-idemat-service-agents';
import {AuthService} from '../../services/auth/auth.service';
import {COUNTDOWN_DECONNEXION_SECONDES} from '../../constantes/ui.constantes';
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
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected enCours = signal(false);
  protected succes = signal(false);
  protected decompte = signal(COUNTDOWN_DECONNEXION_SECONDES);

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
      next: () => {
        this.enCours.set(false);
        this.succes.set(true);
        this.startCountdown();
      },
      error: () => this.enCours.set(false),
    });
  }

  private startCountdown(): void {
    interval(1000).pipe(take(COUNTDOWN_DECONNEXION_SECONDES)).subscribe({
      next: i => {
        this.decompte.set(COUNTDOWN_DECONNEXION_SECONDES - 1 - i);
        this.cdr.markForCheck();
      },
      complete: () => this.authService.logout(),
    });
  }
}
