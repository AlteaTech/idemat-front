import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {UsagerIdematServiceAgents} from '../../services/agents/idemat/usager-idemat-service-agents';
import {ContratIdematServiceAgents} from '../../services/agents/idemat/contrat-idemat-service-agents';
import {UsagerIdematModel} from '../../models/idemat/usager-idemat.model';
import {ContratIdematModel} from '../../models/idemat/contrat-idemat.model';
import {routesConstantes} from '../../constantes/routes.constantes';

interface TuileMenu {
  icon: string;
  label: string;
  subtitle: string;
  route: string;
  visible: boolean;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly usagerService = inject(UsagerIdematServiceAgents);
  private readonly contratService = inject(ContratIdematServiceAgents);

  protected usager = signal<UsagerIdematModel | null>(null);
  protected tuiles = signal<TuileMenu[]>([]);
  protected showCarteAcces = signal(false);
  protected loading = signal(true);
  protected readonly routesConstantes = routesConstantes;

  ngOnInit(): void {
    this.usagerService.getUsager().subscribe(u => {
      this.usager.set(u);
      this.contratService.getContratForCurrentUser().subscribe(c => {
        this.tuiles.set(this.buildTuiles(c));
        this.showCarteAcces.set(c.allowCarteDematerialisee);
        this.loading.set(false);
      });
    });
  }

  protected naviguer(route: string): void {
    this.router.navigate(['/' + route]);
  }

  private buildTuiles(contrat: ContratIdematModel): TuileMenu[] {
    return [
      {icon: 'location_on', label: 'Déchetteries', subtitle: 'Sélectionnez votre déchetterie', route: routesConstantes.dechetteries, visible: true},
      {icon: 'person_outline', label: 'Mon compte', subtitle: 'Modifiez vos informations', route: routesConstantes.informationsPersonnelles, visible: true},
      {icon: 'bar_chart', label: 'Mes passages & points', subtitle: 'Consultez vos informations', route: routesConstantes.consultationSolde, visible: true},
      {icon: 'add_circle_outline', label: 'Recharger mon compte', subtitle: 'Rechargez votre compte', route: routesConstantes.achatPassages, visible: contrat.allowAchatPassages},
    ].filter(t => t.visible);
  }
}
