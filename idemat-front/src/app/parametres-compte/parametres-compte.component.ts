import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialog} from '@angular/material/dialog';

import {UsagerIdematServiceAgents} from '../../services/agents/idemat/usager-idemat-service-agents';
import {AuthService} from '../../services/auth/auth.service';
import {UsagerIdematModel} from '../../models/idemat/usager-idemat.model';
import {routesConstantes} from '../../constantes/routes.constantes';
import {ConfirmationSuppressionCompteComponent} from '../confirmation-suppression-compte/confirmation-suppression-compte.component';

@Component({
  selector: 'app-parametres-compte',
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './parametres-compte.component.html',
  styleUrl: './parametres-compte.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParametresCompteComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly usagerService = inject(UsagerIdematServiceAgents);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  protected usager = signal<UsagerIdematModel | null>(null);
  protected loading = signal(true);
  protected enCours = signal(false);
  protected readonly routesConstantes = routesConstantes;

  ngOnInit(): void {
    this.usagerService.getUsager().subscribe(u => {
      this.usager.set(u);
      this.loading.set(false);
    });
  }

  protected naviguer(route: string): void {
    this.router.navigate(['/' + route]);
  }

  protected retour(): void {
    this.router.navigate(['/' + routesConstantes.informationsPersonnelles]);
  }

  protected supprimerCompte(): void {
    const ref = this.dialog.open(ConfirmationSuppressionCompteComponent, {
      width: '400px',
      maxWidth: '90vw',
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.enCours.set(true);
      this.usagerService.deleteAccount().subscribe({
        next: () => this.authService.logout(),
        error: () => this.enCours.set(false),
      });
    });
  }
}
