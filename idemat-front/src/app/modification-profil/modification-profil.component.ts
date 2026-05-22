import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {forkJoin} from 'rxjs';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {UsagerIdematServiceAgents} from '../../services/agents/idemat/usager-idemat-service-agents';
import {ContratIdematServiceAgents} from '../../services/agents/idemat/contrat-idemat-service-agents';
import {UsagerIdematModel} from '../../models/idemat/usager-idemat.model';
import {ContratIdematModel} from '../../models/idemat/contrat-idemat.model';
import {routesConstantes} from '../../constantes/routes.constantes';
import {ZONES_J1} from '../../constantes/inscription.constantes';
import {ModificationProfilFormModel} from '../../models/forms/modification-profil-form.model';
import {VehiculeFormModel} from '../../models/forms/vehicule-form.model';

@Component({
  selector: 'app-modification-profil',
  imports: [ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule],
  templateUrl: './modification-profil.component.html',
  styleUrl: './modification-profil.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModificationProfilComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly usagerService = inject(UsagerIdematServiceAgents);
  private readonly contratService = inject(ContratIdematServiceAgents);

  protected usager = signal<UsagerIdematModel | null>(null);
  protected contrat = signal<ContratIdematModel | null>(null);
  protected enCours = signal(false);
  protected ajoutEnCours = signal(false);
  protected erreurCG = signal(false);
  protected selectedFile = signal<File | null>(null);

  readonly zonesJ1 = ZONES_J1;

  protected form = new FormGroup<ModificationProfilFormModel>({
    nom: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    prenom: new FormControl('', {nonNullable: true}),
    adresse: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    telephone: new FormControl('', {nonNullable: true}),
    codePostal: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    ville: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
  });

  protected vehiculeForm = new FormGroup<VehiculeFormModel>({
    immatriculation: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    zoneJ1: new FormControl('', {nonNullable: true}),
    zoneF3: new FormControl('', {nonNullable: true, validators: [Validators.pattern('^[0-9]+$')]}),
  });

  ngOnInit(): void {
    forkJoin({
      usager: this.usagerService.getUsager(),
      contrat: this.contratService.getContratForCurrentUser(),
    }).subscribe(({usager, contrat}) => {
      this.usager.set(usager);
      this.contrat.set(contrat);
      this.form.patchValue({
        nom: usager.nom ?? '',
        prenom: usager.prenom ?? '',
        adresse: usager.adresse ?? '',
        telephone: usager.telephone ?? '',
        codePostal: usager.codePostal ?? '',
        ville: usager.ville ?? '',
      });
      if (contrat.communes.length > 0) this.form.controls.codePostal.disable();
      if (contrat.demandeZoneJ1F3) {
        this.vehiculeForm.controls.zoneJ1.addValidators(Validators.required);
        this.vehiculeForm.controls.zoneF3.addValidators(Validators.required);
        this.vehiculeForm.controls.zoneJ1.updateValueAndValidity();
        this.vehiculeForm.controls.zoneF3.updateValueAndValidity();
      }
    });
  }

  protected onVilleChange(nom: string): void {
    const commune = this.contrat()?.communes.find(c => c.nom === nom);
    if (commune) this.form.controls.codePostal.setValue(commune.codePostal);
  }

  protected retour(): void {
    this.router.navigate(['/' + routesConstantes.informationsPersonnelles]);
  }

  protected onSubmit(): void {
    if (this.form.invalid) return;
    this.enCours.set(true);
    this.usagerService.updateProfil(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/' + routesConstantes.informationsPersonnelles]),
      error: () => this.enCours.set(false),
    });
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
    this.erreurCG.set(false);
  }

  protected onAjouterVehicule(): void {
    if (this.vehiculeForm.invalid) return;
    if (!this.selectedFile()) {
      this.erreurCG.set(true);
      return;
    }
    this.ajoutEnCours.set(true);
    const {immatriculation, zoneJ1, zoneF3} = this.vehiculeForm.getRawValue();
    const demandeZoneJ1F3 = this.contrat()?.demandeZoneJ1F3;
    this.usagerService.addVehicule(
      immatriculation,
      this.selectedFile()!,
      demandeZoneJ1F3 ? zoneJ1 : undefined,
      demandeZoneJ1F3 && zoneF3 ? Number(zoneF3) : undefined,
    ).subscribe({
      next: () => {
        const immatLabel = demandeZoneJ1F3 && zoneJ1 && zoneF3
          ? `${immatriculation} (${zoneJ1}-${zoneF3} kg)`
          : immatriculation;
        const current = this.usager()!;
        this.usager.set({...current, immatriculations: [...(current.immatriculations ?? []), immatLabel]});
        this.vehiculeForm.reset();
        this.selectedFile.set(null);
        this.ajoutEnCours.set(false);
      },
      error: () => this.ajoutEnCours.set(false),
    });
  }

  protected onSupprimerVehicule(immat: string): void {
    this.usagerService.deleteVehicule(immat).subscribe({
      next: () => {
        const current = this.usager()!;
        this.usager.set({
          ...current,
          immatriculations: (current.immatriculations ?? []).filter(i => i !== immat),
        });
      },
    });
  }
}
