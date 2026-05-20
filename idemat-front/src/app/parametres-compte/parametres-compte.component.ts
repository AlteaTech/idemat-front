import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {UsagerIdematServiceAgents} from '../../services/agents/idemat/usager-idemat-service-agents';
import {UsagerIdematModel} from '../../models/idemat/usager-idemat.model';
import {routesConstantes} from '../../constantes/routes.constantes';

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

  protected usager = signal<UsagerIdematModel | null>(null);
  protected loading = signal(true);
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
    // TODO: afficher une confirmation avant suppression
  }
}
