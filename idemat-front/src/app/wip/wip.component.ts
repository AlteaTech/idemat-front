import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {ContratIdematServiceAgents} from '../../services/agents/idemat/contrat-idemat-service-agents';
import {ContratIdematModel} from '../../models/idemat/contrat-idemat.model';

// TEMPORAIRE — squelette de livraison sprint 10, à retirer au sprint 11 quand IDemat est prêt (remettre HomeComponent sur routesConstantes.home dans app.routes.ts)
@Component({
  selector: 'app-wip',
  imports: [MatIconModule, MatProgressSpinnerModule],
  templateUrl: './wip.component.html',
  styleUrl: './wip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WipComponent implements OnInit {
  private readonly contratService = inject(ContratIdematServiceAgents);

  protected contrat = signal<ContratIdematModel | null>(null);
  protected loading = signal(true);

  ngOnInit(): void {
    this.contratService.getContratForCurrentUser().subscribe(c => {
      this.contrat.set(c);
      this.loading.set(false);
    });
  }
}
