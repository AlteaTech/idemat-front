import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {map} from 'rxjs/operators';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {toSignal} from '@angular/core/rxjs-interop';

import {UsagerIdematServiceAgents} from '../../services/agents/idemat/usager-idemat-service-agents';
import {ContratIdematServiceAgents} from '../../services/agents/idemat/contrat-idemat-service-agents';
import {routesConstantes} from '../../constantes/routes.constantes';
import {MotDePasseOublieIdematFormModel} from '../../models/forms/mot-de-passe-oublie-idemat-form.model';

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
  private readonly breakpointObserver = inject(BreakpointObserver);

  protected readonly isDesktop = toSignal(
    this.breakpointObserver.observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .pipe(map(r => r.matches)),
    {initialValue: true}
  );

  protected logoUrl = signal('');
  protected nomContrat = signal('');
  protected enCours = signal(false);
  protected succes = signal(false);
  protected erreurEmail = signal(false);

  private contratSlug = '';

  protected form = new FormGroup<MotDePasseOublieIdematFormModel>({
    email: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.email]}),
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.contratSlug = params.get('contrat') ?? '';
      if (this.contratSlug) {
        this.contratService.getContratByUrl(this.contratSlug).subscribe(c => {
          this.logoUrl.set(c.logoUrl);
          this.nomContrat.set(c.nomEnseigne);
        });
      }
    });
  }

  protected retour(): void {
    this.router.navigate([`/${routesConstantes.connexionIdemat}/${this.contratSlug}`]);
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
    const contrat = this.route.snapshot.paramMap.get('contrat') ?? 'default';
    this.router.navigate([`/${routesConstantes.creationCompte}/${contrat}`]);
  }
}
