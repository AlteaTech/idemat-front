import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule, DatePipe} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {PassagesIdematServiceAgents} from '../../services/agents/idemat/passages-idemat-service-agents';
import {UsagerIdematServiceAgents} from '../../services/agents/idemat/usager-idemat-service-agents';
import {PassagesInfoModel} from '../../models/idemat/passages-idemat.model';
import {DepotIdematModel} from '../../models/idemat/depot-idemat.model';
import {UsagerIdematModel} from '../../models/idemat/usager-idemat.model';
import {routesConstantes} from '../../constantes/routes.constantes';
import {HISTORIQUE_DEPOTS_APERCU, HISTORIQUE_DEPOTS_PAGE_SIZE} from '../../constantes/depots.constantes';

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
  protected statsJour = signal<number | null>(null);
  protected statsMois = signal<number | null>(null);
  protected statsAnnee = signal<number | null>(null);
  protected usager = signal<UsagerIdematModel | null>(null);
  protected passages = signal<DepotIdematModel[]>([]);
  protected loading = signal(true);
  protected apercuMode = signal(true);
  protected currentPage = signal(0);
  protected totalPages = signal(0);
  protected ouvertsIds = signal<Set<number>>(new Set());

  ngOnInit(): void {
    this.usagerService.getUsager().subscribe(u => this.usager.set(u));
    this.service.getPassagesInfo().subscribe(data => this.info.set(data));
    this.service.getStatsJour().subscribe(v => this.statsJour.set(v));
    this.service.getStatsMois().subscribe(v => this.statsMois.set(v));
    this.service.getStatsAnnee().subscribe(v => this.statsAnnee.set(v));
    this.chargerApercu();
  }

  private chargerApercu(): void {
    this.service.getDepots(0, HISTORIQUE_DEPOTS_APERCU).subscribe(page => {
      this.passages.set(page.content);
      this.totalPages.set(page.totalPages);
      this.loading.set(false);
    });
  }

  protected reduire(): void {
    this.apercuMode.set(true);
    this.currentPage.set(0);
    this.chargerApercu();
  }

  protected afficherTout(): void {
    this.apercuMode.set(false);
    this.loading.set(true);
    this.currentPage.set(0);
    this.service.getDepots(0, HISTORIQUE_DEPOTS_PAGE_SIZE).subscribe(page => {
      this.passages.set(page.content);
      this.totalPages.set(page.totalPages);
      this.loading.set(false);
    });
  }

  protected changerPage(page: number): void {
    this.loading.set(true);
    this.currentPage.set(page);
    this.service.getDepots(page, HISTORIQUE_DEPOTS_PAGE_SIZE).subscribe(result => {
      this.passages.set(result.content);
      this.loading.set(false);
    });
  }

  protected toggleDetails(id: number): void {
    const set = new Set(this.ouvertsIds());
    if (set.has(id)) { set.delete(id); } else { set.add(id); }
    this.ouvertsIds.set(set);
  }

  protected isOuvert(id: number): boolean {
    return this.ouvertsIds().has(id);
  }

  protected formatHeure(heure: string): string {
    return heure.substring(0, 5).replace(':', 'h');
  }

  protected retour(): void {
    this.router.navigate(['/' + routesConstantes.home]);
  }
}
