import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {map} from 'rxjs/operators';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {MatDialog} from '@angular/material/dialog';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {toSignal} from '@angular/core/rxjs-interop';

import {ContratControllerService} from '../../core/api/api/contrat-controller.service';
import {InscriptionIdematServiceAgents, VehiculeInscriptionParam} from '../../services/agents/idemat/inscription-idemat-service-agents';
import {ContratDio} from '../../core/api/model/contrat-dio';
import {TypeInscription} from '../../models/idemat/inscription-idemat.model';
import {routesConstantes} from '../../constantes/routes.constantes';
import {InscriptionIdematFormModel} from '../../models/forms/inscription-idemat-form.model';
import {AjouterVehiculeDialogComponent} from './ajouter-vehicule-dialog/ajouter-vehicule-dialog.component';
import {AjouterVehiculeDialogResult} from '../../models/idemat/ajouter-vehicule-dialog.model';

@Component({
  selector: 'app-inscription',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
            MatSlideToggleModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './inscription.component.html',
  styleUrl: './inscription.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InscriptionComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly contratService = inject(ContratControllerService);
  private readonly inscriptionService = inject(InscriptionIdematServiceAgents);
  private readonly dialog = inject(MatDialog);
  private readonly breakpointObserver = inject(BreakpointObserver);

  protected readonly isDesktop = toSignal(
    this.breakpointObserver.observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .pipe(map(r => r.matches)),
    {initialValue: true}
  );

  protected contrat = signal<ContratDio | null>(null);
  protected contratUrl = signal('');
  protected type = signal<TypeInscription>('Part');
  protected enCours = signal(false);
  protected erreurEmail = signal('');
  protected currentStep = signal(0);

  protected fileCarteIdentite = signal<File | null>(null);
  protected fileJustificatif = signal<File | null>(null);
  protected fileKbis = signal<File | null>(null);
  protected erreurCarteIdentite = signal(false);
  protected erreurJustificatif = signal(false);
  protected erreurKbis = signal(false);

  protected vehicules = signal<AjouterVehiculeDialogResult[]>([]);

  protected readonly logoUrl = computed(() => {
    const c = this.contrat();
    if (c?.logoBase64 && c?.logoMime) return `data:${c.logoMime};base64,${c.logoBase64}`;
    return null;
  });

  protected readonly steps = computed((): string[] => {
    const c = this.contrat();
    if (!c) return [];
    const s: string[] = ['infos'];
    if (c.allowCartePhysique || c.allowCarteDematerialisee) s.push('carte');
    if (c.allowImmatriculations) s.push('vehicules');
    s.push('documents');
    s.push('cg');
    return s;
  });

  protected form = new FormGroup<InscriptionIdematFormModel>({
    societe: new FormControl('', {nonNullable: true}),
    siret: new FormControl('', {nonNullable: true}),
    nom: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    prenom: new FormControl('', {nonNullable: true}),
    deuxiemeNom: new FormControl('', {nonNullable: true}),
    deuxiemePrenom: new FormControl('', {nonNullable: true}),
    adresse: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    complementAdresse: new FormControl('', {nonNullable: true}),
    codePostal: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    ville: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    email: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.email]}),
    telephone: new FormControl('', {nonNullable: true}),
    cartePhysique: new FormControl(false, {nonNullable: true}),
    carteDematerialisee: new FormControl(true, {nonNullable: true}),
    mentionsLegales: new FormControl(false, {nonNullable: true, validators: [Validators.requiredTrue]}),
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const contratUrl = params.get('contrat') ?? '';
      const typePath = params.get('type');
      this.contratUrl.set(contratUrl);
      this.type.set(typePath === 'professionnel' ? 'Pro' : 'Part');
      this.updateValidators();
      if (contratUrl) {
        this.contratService.getByUrl(contratUrl).subscribe(c => {
          this.contrat.set(c);
          if (c.communes.length > 0) this.form.controls.codePostal.disable();
        });
      }
    });
  }

  private updateValidators(): void {
    const isPro = this.type() === 'Pro';
    const siretCtrl = this.form.controls.siret;
    const societeCtrl = this.form.controls.societe;
    const prenomCtrl = this.form.controls.prenom;
    if (isPro) {
      siretCtrl.addValidators(Validators.required);
      societeCtrl.addValidators(Validators.required);
      prenomCtrl.addValidators(Validators.required);
    } else {
      siretCtrl.clearValidators();
      societeCtrl.clearValidators();
      prenomCtrl.clearValidators();
    }
    [siretCtrl, societeCtrl, prenomCtrl].forEach(c => c.updateValueAndValidity());
  }

  protected onVilleChange(nom: string): void {
    const commune = this.contrat()?.communes.find(c => c.nom === nom);
    if (commune) this.form.controls.codePostal.setValue(commune.codePostal);
  }

  protected retour(): void {
    this.router.navigate([`/${routesConstantes.creationCompte}/${this.contratUrl()}`]);
  }

  protected onFileChange(event: Event, type: 'ci' | 'jd' | 'kbis'): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (type === 'ci') { this.fileCarteIdentite.set(file); this.erreurCarteIdentite.set(false); }
    if (type === 'jd') { this.fileJustificatif.set(file); this.erreurJustificatif.set(false); }
    if (type === 'kbis') { this.fileKbis.set(file); this.erreurKbis.set(false); }
  }

  protected onAjouterVehicule(): void {
    const dialogRef = this.dialog.open(AjouterVehiculeDialogComponent, {
      data: {contrat: this.contrat()!, isPro: this.type() === 'Pro'},
      width: '95vw',
      maxWidth: '480px',
    });
    dialogRef.afterClosed().subscribe((result: AjouterVehiculeDialogResult | undefined) => {
      if (result) this.vehicules.update(list => [...list, result]);
    });
  }

  protected onSupprimerVehicule(vehicule: AjouterVehiculeDialogResult): void {
    this.vehicules.update(list => list.filter(v => v !== vehicule));
  }

  protected suivant(): void {
    const step = this.steps()[this.currentStep()];
    if (step === 'infos') {
      const c = this.form.controls;
      const toCheck = [c.nom, c.adresse, c.ville, c.email];
      if (this.type() === 'Pro') toCheck.push(c.societe, c.siret, c.prenom);
      toCheck.forEach(ctrl => ctrl.markAsTouched());
      if (toCheck.some(ctrl => ctrl.invalid)) return;
    }
    if (step === 'documents') {
      const isPart = this.type() === 'Part';
      const isPro = this.type() === 'Pro';
      let hasError = false;
      if (isPart && !this.fileCarteIdentite()) { this.erreurCarteIdentite.set(true); hasError = true; }
      if (isPart && !this.fileJustificatif()) { this.erreurJustificatif.set(true); hasError = true; }
      if (isPro && !this.fileKbis()) { this.erreurKbis.set(true); hasError = true; }
      if (hasError) return;
    }
    this.currentStep.update(s => s + 1);
  }

  protected precedent(): void {
    if (this.currentStep() === 0) {
      this.retour();
    } else {
      this.currentStep.update(s => s - 1);
    }
  }

  protected onSubmit(): void {
    const isPart = this.type() === 'Part';
    const isPro = this.type() === 'Pro';
    this.erreurCarteIdentite.set(false);
    this.erreurJustificatif.set(false);
    this.erreurKbis.set(false);
    this.erreurEmail.set('');

    if (this.form.invalid) return;

    let hasError = false;
    if (isPart && !this.fileCarteIdentite()) { this.erreurCarteIdentite.set(true); hasError = true; }
    if (isPart && !this.fileJustificatif()) { this.erreurJustificatif.set(true); hasError = true; }
    if (isPro && !this.fileKbis()) { this.erreurKbis.set(true); hasError = true; }
    if (hasError) return;

    this.enCours.set(true);
    const raw = this.form.getRawValue();
    this.inscriptionService.inscrire({
      type: this.type(),
      contratUrl: this.contratUrl(),
      nom: raw.nom,
      prenom: raw.prenom,
      adresse: raw.adresse,
      ville: raw.ville,
      email: raw.email,
      telephone: raw.telephone,
      cartePhysique: raw.cartePhysique,
      carteDematerialisee: raw.carteDematerialisee,
      mentionsLegales: raw.mentionsLegales,
      deuxiemeNom: raw.deuxiemeNom || undefined,
      deuxiemePrenom: raw.deuxiemePrenom || undefined,
      complementAdresse: raw.complementAdresse || undefined,
      societe: raw.societe || undefined,
      siret: raw.siret || undefined,
      vehicules: this.vehicules().length ? this.vehicules().map((v): VehiculeInscriptionParam => ({
        immatriculation: v.immatriculation,
        zoneJ1: v.zoneJ1 || undefined,
        zoneF3: v.zoneF3 || undefined,
      })) : undefined,
      codePostal: raw.codePostal || undefined,
      carteIdentite: isPart ? (this.fileCarteIdentite() ?? undefined) : undefined,
      justificatifDomicile: isPart ? (this.fileJustificatif() ?? undefined) : undefined,
      kbis: isPro ? (this.fileKbis() ?? undefined) : undefined,
    }).subscribe({
      next: () => this.router.navigate(['/' + routesConstantes.demandeOk]),
      error: (err) => {
        this.enCours.set(false);
        let isEmailError = false;
        if (err.status === 409) {
          this.erreurEmail.set('Un compte existe déjà avec cette adresse e-mail');
          isEmailError = true;
        } else if (err.status === 400 && err.error?.message) {
          this.erreurEmail.set(err.error.message);
          isEmailError = true;
        } else {
          this.erreurEmail.set('Une erreur est survenue, veuillez réessayer');
        }
        if (isEmailError && !this.isDesktop()) {
          this.currentStep.set(this.steps().indexOf('infos'));
        }
      },
    });
  }
}
