import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import * as QRCode from 'qrcode';

import {UsagerIdematServiceAgents} from '../../services/agents/idemat/usager-idemat-service-agents';
import {ContratIdematServiceAgents} from '../../services/agents/idemat/contrat-idemat-service-agents';
import {UsagerIdematModel} from '../../models/idemat/usager-idemat.model';
import {routesConstantes} from '../../constantes/routes.constantes';

@Component({
  selector: 'app-home',
  imports: [MatIconModule, MatProgressSpinnerModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly usagerService = inject(UsagerIdematServiceAgents);
  private readonly contratService = inject(ContratIdematServiceAgents);

  protected usager = signal<UsagerIdematModel | null>(null);
  protected qrCodeUrl = signal<string>('');
  protected showCarteAcces = signal(false);
  protected loading = signal(true);
  protected readonly routesConstantes = routesConstantes;

  ngOnInit(): void {
    this.usagerService.getUsager().subscribe(async u => {
      this.usager.set(u);
      if (u.codeBarres) {
        const url = await QRCode.toDataURL(u.codeBarres, {width: 200, margin: 1});
        this.qrCodeUrl.set(url);
      }
      this.contratService.getContratForCurrentUser().subscribe(c => {
        this.showCarteAcces.set(c.allowCarteDematerialisee);
        this.loading.set(false);
      });
    });
  }

  protected naviguer(route: string): void {
    this.router.navigate(['/' + route]);
  }
}
