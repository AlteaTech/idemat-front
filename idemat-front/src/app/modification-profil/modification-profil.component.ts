import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {forkJoin} from 'rxjs';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialog} from '@angular/material/dialog';

import {UsagerIdematServiceAgents} from '../../services/agents/idemat/usager-idemat-service-agents';
import {ContratIdematServiceAgents} from '../../services/agents/idemat/contrat-idemat-service-agents';
import {UsagerIdematModel} from '../../models/idemat/usager-idemat.model';
import {VehiculeIdematModel} from '../../models/idemat/vehicule-idemat.model';
import {ContratIdematModel} from '../../models/idemat/contrat-idemat.model';
import {routesConstantes} from '../../constantes/routes.constantes';
import {ModificationProfilFormModel} from '../../models/forms/modification-profil-form.model';
import {AjouterVehiculeDialogComponent} from '../inscription/ajouter-vehicule-dialog/ajouter-vehicule-dialog.component';
import {AjouterVehiculeDialogResult} from '../../models/idemat/ajouter-vehicule-dialog.model';

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
  private readonly dialog = inject(MatDialog);

  protected usager = signal<UsagerIdematModel | null>(null);
  protected contrat = signal<ContratIdematModel | null>(null);
  protected enCours = signal(false);

  protected form = new FormGroup<ModificationProfilFormModel>({
    nom: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    prenom: new FormControl('', {nonNullable: true}),
    adresse: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    telephone: new FormControl('', {nonNullable: true}),
    codePostal: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    ville: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
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
      this.form.disable();
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

  protected onOuvrirDialogVehicule(): void {
    const ref = this.dialog.open(AjouterVehiculeDialogComponent, {
      data: {contrat: this.contrat()!, isPro: this.usager()!.isPro},
      width: '95vw',
      maxWidth: '480px',
    });
    ref.afterClosed().subscribe((result: AjouterVehiculeDialogResult | undefined) => {
      if (!result) return;
      this.usagerService.addVehicule(
        result.immatriculation,
        result.fileCarteGrise ?? undefined,
        result.zoneJ1 || undefined,
        result.zoneF3 ? Number(result.zoneF3) : undefined,
      ).subscribe({
        next: () => {
          const current = this.usager()!;
          const nouveau: VehiculeIdematModel = {
            immatriculation: result.immatriculation,
            zoneJ1: result.zoneJ1 || undefined,
            zoneF3: result.zoneF3 ? Number(result.zoneF3) : undefined,
          };
          this.usager.set({...current, vehicules: [...(current.vehicules ?? []), nouveau]});
        },
      });
    });
  }

  protected onSupprimerVehicule(vehicule: VehiculeIdematModel): void {
    this.usagerService.deleteVehicule(vehicule.immatriculation).subscribe({
      next: () => {
        const current = this.usager()!;
        this.usager.set({
          ...current,
          vehicules: (current.vehicules ?? []).filter(v => v.immatriculation !== vehicule.immatriculation),
        });
      },
    });
  }
}
