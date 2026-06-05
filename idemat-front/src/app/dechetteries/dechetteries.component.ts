import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {DechetteriesIdematServiceAgents} from '../../services/agents/idemat/dechetteries-idemat-service-agents';
import {DechetterieIdematModel} from '../../models/idemat/dechetterie-idemat.model';
import {routesConstantes} from '../../constantes/routes.constantes';

@Component({
  selector: 'app-dechetteries',
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dechetteries.component.html',
  styleUrl: './dechetteries.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DechetteriesComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly service = inject(DechetteriesIdematServiceAgents);

  protected dechetteries = signal<DechetterieIdematModel[]>([]);
  protected loading = signal(true);

  ngOnInit(): void {
    this.service.getListe().subscribe(list => {
      this.dechetteries.set(list);
      this.loading.set(false);
    });
  }

  protected retour(): void { this.router.navigate(['/' + routesConstantes.home]); }

  protected voirDetail(id: number): void {
    this.router.navigate(['/', routesConstantes.dechetteries, id]);
  }
}
