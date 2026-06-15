import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {DechetteriesIdematServiceAgents} from '../../services/agents/idemat/dechetteries-idemat-service-agents';
import {DechetterieIdematModel} from '../../models/idemat/dechetterie-idemat.model';
import {routesConstantes} from '../../constantes/routes.constantes';

@Component({
  selector: 'app-dechetterie-detail',
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dechetterie-detail.component.html',
  styleUrl: './dechetterie-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DechetterieDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(DechetteriesIdematServiceAgents);

  protected dechetterie = signal<DechetterieIdematModel | null>(null);
  protected loading = signal(true);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.getById(id).subscribe(d => {
      this.dechetterie.set(d ?? null);
      this.loading.set(false);
    });
  }

  protected retour(): void {
    this.router.navigate(['/' + routesConstantes.dechetteries]);
  }
}
