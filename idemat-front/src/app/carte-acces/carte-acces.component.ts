import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialog} from '@angular/material/dialog';
import * as QRCode from 'qrcode';

import {UsagerIdematServiceAgents} from '../../services/agents/idemat/usager-idemat-service-agents';
import {ContratIdematServiceAgents} from '../../services/agents/idemat/contrat-idemat-service-agents';
import {UsagerIdematModel} from '../../models/idemat/usager-idemat.model';
import {VehiculeIdematModel} from '../../models/idemat/vehicule-idemat.model';
import {ContratIdematModel} from '../../models/idemat/contrat-idemat.model';
import {routesConstantes} from '../../constantes/routes.constantes';
import {AjouterVehiculeDialogComponent} from '../inscription/ajouter-vehicule-dialog/ajouter-vehicule-dialog.component';
import {AjouterVehiculeDialogResult} from '../../models/idemat/ajouter-vehicule-dialog.model';
import {ConfirmationSuppressionVehiculeComponent} from './confirmation-suppression-vehicule/confirmation-suppression-vehicule.component';

@Component({
  selector: 'app-carte-acces',
  imports: [MatProgressSpinnerModule],
  templateUrl: './carte-acces.component.html',
  styleUrl: './carte-acces.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarteAccesComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly usagerService = inject(UsagerIdematServiceAgents);
  private readonly contratService = inject(ContratIdematServiceAgents);
  private readonly dialog = inject(MatDialog);

  protected usager = signal<UsagerIdematModel | null>(null);
  protected contrat = signal<ContratIdematModel | null>(null);
  protected qrCodeUrl = signal<string>('');
  protected loading = signal(true);

  ngOnInit(): void {
    this.usagerService.getUsager().subscribe(async u => {
      this.usager.set(u);
      if (u.codeBarres) {
        const url = await QRCode.toDataURL(u.codeBarres, {width: 200, margin: 1});
        this.qrCodeUrl.set(url);
      }
      this.contratService.getContratForCurrentUser().subscribe(c => {
        this.contrat.set(c);
        this.loading.set(false);
      });
    });
  }

  protected retour(): void {
    this.router.navigate(['/' + routesConstantes.home]);
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
        next: () => this.rafraichirUsager(),
        error: err => console.error('Erreur ajout véhicule', err),
      });
    });
  }

  protected onSupprimerVehicule(vehicule: VehiculeIdematModel): void {
    const ref = this.dialog.open(ConfirmationSuppressionVehiculeComponent, {
      data: {immatriculation: vehicule.immatriculation},
      width: '400px',
      maxWidth: '90vw',
    });
    ref.afterClosed().subscribe((confirme: boolean) => {
      if (!confirme) return;
      this.usagerService.deleteVehicule(vehicule.immatriculation).subscribe({
        next: () => this.rafraichirUsager(),
        error: err => console.error('Erreur suppression véhicule', err),
      });
    });
  }

  private rafraichirUsager(): void {
    this.usagerService.getUsager().subscribe(u => this.usager.set(u));
  }
}
