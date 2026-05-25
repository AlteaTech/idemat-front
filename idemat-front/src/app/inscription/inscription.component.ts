import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {MatDialog} from '@angular/material/dialog';

import {ContratControllerService} from '../../core/api/api/contrat-controller.service';
import {InscriptionControllerService} from '../../core/api/api/inscription-controller.service';
import {ContratDio} from '../../core/api/model/contrat-dio';
import {TypeInscription} from '../../models/idemat/inscription-idemat.model';
import {routesConstantes} from '../../constantes/routes.constantes';
import {InscriptionIdematFormModel} from '../../models/forms/inscription-idemat-form.model';
import {AjouterVehiculeDialogComponent, AjouterVehiculeDialogResult} from './ajouter-vehicule-dialog/ajouter-vehicule-dialog.component';

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
  private readonly inscriptionService = inject(InscriptionControllerService);
  private readonly dialog = inject(MatDialog);

  protected contrat = signal<ContratDio | null>(null);
  protected contratUrl = signal('');
  protected type = signal<TypeInscription>('Part');
  protected enCours = signal(false);
  protected erreurEmail = signal('');

  protected fileCarteIdentite = signal<File | null>(null);
  protected fileJustificatif = signal<File | null>(null);
  protected fileKbis = signal<File | null>(null);
  protected erreurCarteIdentite = signal(false);
  protected erreurJustificatif = signal(false);
  protected erreurKbis = signal(false);

  protected vehicules = signal<AjouterVehiculeDialogResult[]>([]);

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
      width: '480px',
    });
    dialogRef.afterClosed().subscribe((result: AjouterVehiculeDialogResult | undefined) => {
      if (result) this.vehicules.update(list => [...list, result]);
    });
  }

  protected onSupprimerVehicule(vehicule: AjouterVehiculeDialogResult): void {
    this.vehicules.update(list => list.filter(v => v !== vehicule));
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
    const premierVehicule = this.vehicules()[0];
    this.inscriptionService.inscrire(
      this.type(), this.contratUrl(),
      raw.nom, raw.prenom,
      raw.adresse, raw.ville,
      raw.email, raw.telephone,
      raw.cartePhysique, raw.carteDematerialisee, raw.mentionsLegales,
      raw.deuxiemeNom || undefined,
      raw.deuxiemePrenom || undefined,
      raw.complementAdresse || undefined,
      raw.societe || undefined,
      raw.siret || undefined,
      premierVehicule?.immatriculation || undefined,
      premierVehicule?.zoneJ1 || undefined,
      premierVehicule?.zoneF3 ? Number(premierVehicule.zoneF3) : undefined,
      raw.codePostal || undefined,
      isPart ? (this.fileCarteIdentite() ?? undefined) : (this.fileKbis() ?? undefined),
      isPart ? (this.fileJustificatif() ?? undefined) : undefined,
      premierVehicule?.fileCarteGrise ?? undefined,
    ).subscribe({
      next: () => this.router.navigate(['/' + routesConstantes.demandeOk]),
      error: (err) => {
        this.enCours.set(false);
        if (err.status === 409) this.erreurEmail.set('Un compte existe déjà avec cette adresse e-mail');
        else this.erreurEmail.set('Une erreur est survenue, veuillez réessayer');
      },
    });
  }
}
