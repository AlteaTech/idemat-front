import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {UsagerIdematServiceAgents} from '../../services/agents/idemat/usager-idemat-service-agents';
import {ContratIdematServiceAgents} from '../../services/agents/idemat/contrat-idemat-service-agents';
import {routesConstantes} from '../../constantes/routes.constantes';

@Component({
  selector: 'app-mot-de-passe-oublie-idemat',
  imports: [ReactiveFormsModule, MatProgressSpinnerModule],
  templateUrl: './mot-de-passe-oublie-idemat.component.html',
  styleUrl: './mot-de-passe-oublie-idemat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MotDePasseOublieIdematComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly usagerService = inject(UsagerIdematServiceAgents);
  private readonly contratService = inject(ContratIdematServiceAgents);

  protected logoUrl = signal('');
  protected enCours = signal(false);
  protected succes = signal(false);
  protected erreurEmail = signal(false);

  protected form = new FormGroup({
    email: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.email]}),
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const contrat = params.get('contrat');
      if (contrat) {
        this.contratService.getContratByUrl(contrat).subscribe(c => {
          this.logoUrl.set(c.logoUrl);
        });
      }
    });
  }

  protected retour(): void {
    this.router.navigate(['/' + routesConstantes.connexionIdemat]);
  }

  protected onSubmit(): void {
    this.erreurEmail.set(false);
    if (this.form.invalid) return;
    this.enCours.set(true);
    this.usagerService.demanderResetPassword(this.form.getRawValue().email).subscribe({
      next: () => {
        this.enCours.set(false);
        this.succes.set(true);
      },
      error: (err) => {
        this.enCours.set(false);
        this.erreurEmail.set(true);
      },
    });
  }

  protected onSInscrire(): void {
    // TODO #123-125 : naviguer vers l'écran inscription
  }
}
