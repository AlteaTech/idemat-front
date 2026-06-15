import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule, DatePipe} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {PassagesIdematServiceAgents} from '../../services/agents/idemat/passages-idemat-service-agents';
import {UsagerIdematServiceAgents} from '../../services/agents/idemat/usager-idemat-service-agents';
import {PassagesInfoModel} from '../../models/idemat/passages-idemat.model';
import {UsagerIdematModel} from '../../models/idemat/usager-idemat.model';
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
  private readonly usagerService = inject(UsagerIdematServiceAgents);

  protected info = signal<PassagesInfoModel | null>(null);
  protected usager = signal<UsagerIdematModel | null>(null);
  protected loading = signal(true);

  ngOnInit(): void {
    this.usagerService.getUsager().subscribe(u => this.usager.set(u));
    this.service.getPassagesInfo().subscribe(data => {
      this.info.set(data);
      this.loading.set(false);
    });
  }

  protected retour(): void {
    this.router.navigate(['/' + routesConstantes.home]);
  }
}
