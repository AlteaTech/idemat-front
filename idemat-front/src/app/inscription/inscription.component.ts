import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';

import {ContratIdematServiceAgents} from '../../services/agents/idemat/contrat-idemat-service-agents';
import {InscriptionIdematServiceAgents} from '../../services/agents/idemat/inscription-idemat-service-agents';
import {ContratIdematModel} from '../../models/idemat/contrat-idemat.model';
import {TypeInscription} from '../../models/idemat/inscription-idemat.model';
import {routesConstantes} from '../../constantes/routes.constantes';

const CIVILITES = ['M.', 'Mme', 'Autre'];
const ZONES_J1 = ['MTL', 'MTT1', 'MTT2', 'TM', 'QM', 'CYCL', 'CL', 'VP', 'TCP', 'CTTE'];

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
  private readonly contratService = inject(ContratIdematServiceAgents);
  private readonly inscriptionService = inject(InscriptionIdematServiceAgents);

  protected contrat = signal<ContratIdematModel | null>(null);
  protected contratUrl = signal('');
  protected type = signal<TypeInscription>('Part');
  protected enCours = signal(false);
  protected erreurEmail = signal('');

  // Fichiers
  protected fileCarteGrise = signal<File | null>(null);
  protected fileCarteIdentite = signal<File | null>(null);
  protected fileJustificatif = signal<File | null>(null);
  protected erreurCarteGrise = signal(false);
  protected erreurCarteIdentite = signal(false);
  protected erreurJustificatif = signal(false);

  // Véhicules ajoutés en session
  protected immatriculations = signal<string[]>([]);

  readonly civilites = CIVILITES;
  readonly zonesJ1 = ZONES_J1;

  protected form = new FormGroup({
    // Pro
    societe: new FormControl('', {nonNullable: true}),
    siret: new FormControl('', {nonNullable: true}),
    // Particulier
    civilite: new FormControl('', {nonNullable: true}),
    // Commun
    nom: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    prenom: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    adresse: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    ville: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    email: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.email]}),
    telephone: new FormControl('', {nonNullable: true}),
    cartePhysique: new FormControl(false, {nonNullable: true}),
    carteDematerialisee: new FormControl(false, {nonNullable: true}),
    mentionsLegales: new FormControl(false, {nonNullable: true}),
    // Véhicule
    immatriculation: new FormControl('', {nonNullable: true}),
    zoneJ1: new FormControl('', {nonNullable: true}),
    zoneF3: new FormControl('', {nonNullable: true, validators: [Validators.pattern('^[0-9]+$')]}),
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const contratUrl = params.get('contrat') ?? '';
      const typePath = params.get('type');
      this.contratUrl.set(contratUrl);
      this.type.set(typePath === 'professionnel' ? 'Pro' : 'Part');
      this.updateValidators();
      if (contratUrl) {
        this.contratService.getContratByUrl(contratUrl).subscribe(c => this.contrat.set(c));
      }
    });
  }

  private updateValidators(): void {
    const isPro = this.type() === 'Pro';
    const siretCtrl = this.form.controls.siret;
    const societeCtrl = this.form.controls.societe;
    const civiliteCtrl = this.form.controls.civilite;
    if (isPro) {
      siretCtrl.addValidators(Validators.required);
      societeCtrl.addValidators(Validators.required);
      civiliteCtrl.clearValidators();
    } else {
      civiliteCtrl.addValidators(Validators.required);
      siretCtrl.clearValidators();
      societeCtrl.clearValidators();
    }
    [siretCtrl, societeCtrl, civiliteCtrl].forEach(c => c.updateValueAndValidity());
  }

  protected retour(): void {
    this.router.navigate([`/${routesConstantes.creationCompte}/${this.contratUrl()}`]);
  }

  protected onFileChange(event: Event, type: 'cg' | 'ci' | 'jd'): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (type === 'cg') { this.fileCarteGrise.set(file); this.erreurCarteGrise.set(false); }
    if (type === 'ci') { this.fileCarteIdentite.set(file); this.erreurCarteIdentite.set(false); }
    if (type === 'jd') { this.fileJustificatif.set(file); this.erreurJustificatif.set(false); }
  }

  protected onAjouterVehicule(): void {
    const {immatriculation, zoneJ1, zoneF3} = this.form.getRawValue();
    if (!immatriculation.trim()) return;
    if (this.contrat()?.demandeZoneJ1F3 && !this.fileCarteGrise()) {
      this.erreurCarteGrise.set(true);
      return;
    }
    const label = this.contrat()?.demandeZoneJ1F3 && zoneJ1 && zoneF3
      ? `${immatriculation} (${zoneJ1}-${zoneF3} kg)`
      : immatriculation;
    this.immatriculations.update(list => [...list, label]);
    this.form.controls.immatriculation.reset();
    this.form.controls.zoneJ1.reset();
    this.form.controls.zoneF3.reset();
    this.fileCarteGrise.set(null);
  }

  protected onSupprimerVehicule(immat: string): void {
    this.immatriculations.update(list => list.filter(i => i !== immat));
  }

  protected onSubmit(): void {
    const isPart = this.type() === 'Part';
    this.erreurCarteIdentite.set(false);
    this.erreurJustificatif.set(false);
    this.erreurEmail.set('');

    if (this.form.invalid) return;
    if (!this.form.getRawValue().mentionsLegales) return;

    let hasError = false;
    if (isPart && !this.fileCarteIdentite()) { this.erreurCarteIdentite.set(true); hasError = true; }
    if (isPart && !this.fileJustificatif()) { this.erreurJustificatif.set(true); hasError = true; }
    if (hasError) return;

    this.enCours.set(true);
    const raw = this.form.getRawValue();
    this.inscriptionService.inscrire({
      type: this.type(),
      contrat: this.contratUrl(),
      societe: raw.societe || undefined,
      siret: raw.siret || undefined,
      civilite: raw.civilite || undefined,
      nom: raw.nom, prenom: raw.prenom,
      adresse: raw.adresse, ville: raw.ville,
      email: raw.email, telephone: raw.telephone,
      cartePhysique: raw.cartePhysique,
      carteDematerialisee: raw.carteDematerialisee,
      mentionsLegales: raw.mentionsLegales,
      carteIdentite: this.fileCarteIdentite() ?? undefined,
      justificatifDomicile: this.fileJustificatif() ?? undefined,
    }).subscribe({
      next: () => this.router.navigate(['/' + routesConstantes.demandeOk]),
      error: (err) => {
        this.enCours.set(false);
        if (err.status === 409) this.erreurEmail.set('Un compte existe déjà avec cette adresse e-mail');
        else this.erreurEmail.set('Une erreur est survenue, veuillez réessayer');
      },
    });
  }
}
