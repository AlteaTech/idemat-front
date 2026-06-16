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
import {passwordsMatchValidator} from '../../validateurs/passwords-match.validator';
import {NouveauMotDePasseFormModel} from '../../models/forms/nouveau-mot-de-passe-form.model';

@Component({
  selector: 'app-nouveau-mot-de-passe',
  imports: [ReactiveFormsModule, MatProgressSpinnerModule],
  templateUrl: './nouveau-mot-de-passe.component.html',
  styleUrl: './nouveau-mot-de-passe.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NouveauMotDePasseComponent implements OnInit {
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
  protected erreur = signal('');

  private token = '';
  private contratSlug = '';

  protected form = new FormGroup<NouveauMotDePasseFormModel>({
    nouveauMotDePasse: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.minLength(8)]}),
    confirmation: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
  }, {validators: passwordsMatchValidator});

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const contrat = params.get('contrat');
      if (!contrat) {
        this.router.navigate(['/' + routesConstantes.lienInvalide], {replaceUrl: true});
        return;
      }
      this.contratSlug = contrat;
      this.contratService.getContratByUrl(contrat).subscribe({
        next: c => {
          this.logoUrl.set(c.logoUrl);
          this.nomContrat.set(c.nomEnseigne);
        },
        error: () => this.router.navigate(['/' + routesConstantes.lienInvalide], {replaceUrl: true}),
      });
    });
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  protected onSubmit(): void {
    if (this.form.invalid || !this.token) return;
    this.enCours.set(true);
    this.erreur.set('');
    const {nouveauMotDePasse} = this.form.getRawValue();
    this.usagerService.confirmerResetPassword(this.token, nouveauMotDePasse).subscribe({
      next: () => {
        this.enCours.set(false);
        this.succes.set(true);
      },
      error: (err) => {
        this.enCours.set(false);
        this.erreur.set(err?.error?.message ?? 'Une erreur est survenue, veuillez réessayer.');
      },
    });
  }

  protected retourConnexion(): void {
    this.router.navigate(['/' + this.contratSlug]);
  }
}
