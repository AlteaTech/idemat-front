import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule, DatePipe} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {PassagesIdematServiceAgents} from '../../services/agents/idemat/passages-idemat-service-agents';
import {PassagesInfoModel} from '../../models/idemat/passages-idemat.model';
import {routesConstantes} from '../../constantes/routes.constantes';

@Component({
  selector: 'app-passages-points',
  imports: [CommonModule, DatePipe, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './passages-points.component.html',
  styleUrl: './passages-points.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PassagesPointsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly service = inject(PassagesIdematServiceAgents);

  protected info = signal<PassagesInfoModel | null>(null);
  protected loading = signal(true);

  ngOnInit(): void {
    this.service.getPassagesInfo().subscribe(data => {
      this.info.set(data);
      this.loading.set(false);
    });
  }

  protected retour(): void {
    this.router.navigate(['/' + routesConstantes.home]);
  }
}
