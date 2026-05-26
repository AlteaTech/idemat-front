import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {AchatPassagesIdematServiceAgents} from '../../services/agents/idemat/achat-passages-idemat-service-agents';
import {UsagerIdematServiceAgents} from '../../services/agents/idemat/usager-idemat-service-agents';
import {AchatPassagesOptionsModel} from '../../models/idemat/achat-passages-idemat.model';
import {UsagerIdematModel} from '../../models/idemat/usager-idemat.model';
import {routesConstantes} from '../../constantes/routes.constantes';

@Component({
  selector: 'app-achat-passages',
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './achat-passages.component.html',
  styleUrl: './achat-passages.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AchatPassagesComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly service = inject(AchatPassagesIdematServiceAgents);
  private readonly usagerService = inject(UsagerIdematServiceAgents);

  protected options = signal<AchatPassagesOptionsModel | null>(null);
  protected usager = signal<UsagerIdematModel | null>(null);
  protected loading = signal(true);
  protected enCours = signal(false);

  ngOnInit(): void {
    this.usagerService.getUsager().subscribe(u => this.usager.set(u));
    this.service.getOptions().subscribe(opt => {
      this.options.set(opt);
      this.loading.set(false);
    });
  }

  protected valider(): void {
    this.enCours.set(true);
    // TODO: rediriger vers l'URL PayFip retournée par le service
    this.service.initierPaiement().subscribe(url => {
      this.enCours.set(false);
      // window.location.href = url; // décommenter quand PayFip sera branché
    });
  }

  protected retour(): void {
    this.router.navigate(['/' + routesConstantes.home]);
  }
}
