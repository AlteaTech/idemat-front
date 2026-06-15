import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import * as QRCode from 'qrcode';

import {UsagerIdematServiceAgents} from '../../services/agents/idemat/usager-idemat-service-agents';
import {UsagerIdematModel} from '../../models/idemat/usager-idemat.model';
import {routesConstantes} from '../../constantes/routes.constantes';

@Component({
  selector: 'app-carte-acces',
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './carte-acces.component.html',
  styleUrl: './carte-acces.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarteAccesComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly usagerService = inject(UsagerIdematServiceAgents);

  protected usager = signal<UsagerIdematModel | null>(null);
  protected qrCodeUrl = signal<string>('');
  protected loading = signal(true);

  ngOnInit(): void {
    this.usagerService.getUsager().subscribe(async u => {
      this.usager.set(u);
      if (u.codeBarres) {
        const url = await QRCode.toDataURL(u.codeBarres, {width: 200, margin: 1});
        this.qrCodeUrl.set(url);
      }
      this.loading.set(false);
    });
  }

  protected retour(): void {
    this.router.navigate(['/' + routesConstantes.home]);
  }
}
