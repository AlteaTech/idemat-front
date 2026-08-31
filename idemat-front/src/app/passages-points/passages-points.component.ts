import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule, DatePipe} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {catchError, of} from 'rxjs';

import {PassagesIdematServiceAgents} from '../../services/agents/idemat/passages-idemat-service-agents';
import {PassagesRefusesIdematServiceAgents} from '../../services/agents/idemat/passages-refuses-idemat-service-agents';
import {UsagerIdematServiceAgents} from '../../services/agents/idemat/usager-idemat-service-agents';
import {AchatPassagesIdematServiceAgents} from '../../services/agents/idemat/achat-passages-idemat-service-agents';
import {PassagesInfoModel, PassagesStatsIdematModel} from '../../models/idemat/passages-idemat.model';
import {DepotIdematModel} from '../../models/idemat/depot-idemat.model';
import {PassageRefuseIdematModel} from '../../models/idemat/passage-refuse-idemat.model';
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
  private readonly passagesRefusesService = inject(PassagesRefusesIdematServiceAgents);
  private readonly usagerService = inject(UsagerIdematServiceAgents);
  private readonly achatPassagesService = inject(AchatPassagesIdematServiceAgents);

  protected info = signal<PassagesInfoModel | null>(null);
  protected stats = signal<PassagesStatsIdematModel | null>(null);
  protected usager = signal<UsagerIdematModel | null>(null);
  protected passages = signal<DepotIdematModel[]>([]);
  protected loading = signal(true);
  protected apercuMode = signal(true);
  protected currentPage = signal(0);
  protected totalPages = signal(0);
  protected ouvertsIds = signal<Set<number>>(new Set());

  // RG13 : bloc "Historique des passages refusés"
  protected passagesRefuses = signal<PassageRefuseIdematModel[]>([]);
  protected apercuModeRefuses = signal(true);
  protected currentPageRefuses = signal(0);
  protected totalPagesRefuses = signal(0);
  protected ouvertsIdsRefuses = signal<Set<number>>(new Set());

  ngOnInit(): void {
    this.usagerService.getUsager().subscribe(u => this.usager.set(u));

    // Réconciliation ciblée avant de lire le solde, pour garantir sa fraîcheur au moment de
    // l'affichage (le job Quartz global ne suffit pas seul, sa cadence introduit un décalage).
    // Best-effort : un échec ne doit pas empêcher l'affichage de l'écran.
    this.achatPassagesService.reconcilierMesAchatsEnAttente()
      .pipe(catchError(() => of(void 0)))
      .subscribe(() => {
        this.service.getPassagesInfo().subscribe(data => this.info.set(data));
        this.service.getStats().subscribe(s => this.stats.set(s));
      });

    this.chargerApercu();
    this.chargerApercuRefuses();
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

  private chargerApercuRefuses(): void {
    this.passagesRefusesService.getPassagesRefuses(0, HISTORIQUE_DEPOTS_APERCU).subscribe(page => {
      this.passagesRefuses.set(page.content);
      this.totalPagesRefuses.set(page.totalPages);
    });
  }

  protected reduireRefuses(): void {
    this.apercuModeRefuses.set(true);
    this.currentPageRefuses.set(0);
    this.chargerApercuRefuses();
  }

  protected afficherToutRefuses(): void {
    this.apercuModeRefuses.set(false);
    this.currentPageRefuses.set(0);
    this.passagesRefusesService.getPassagesRefuses(0, HISTORIQUE_DEPOTS_PAGE_SIZE).subscribe(page => {
      this.passagesRefuses.set(page.content);
      this.totalPagesRefuses.set(page.totalPages);
    });
  }

  protected changerPageRefuses(page: number): void {
    this.currentPageRefuses.set(page);
    this.passagesRefusesService.getPassagesRefuses(page, HISTORIQUE_DEPOTS_PAGE_SIZE).subscribe(result => {
      this.passagesRefuses.set(result.content);
    });
  }

  protected toggleDetailsRefuse(id: number): void {
    const set = new Set(this.ouvertsIdsRefuses());
    if (set.has(id)) { set.delete(id); } else { set.add(id); }
    this.ouvertsIdsRefuses.set(set);
  }

  protected isOuvertRefuse(id: number): boolean {
    return this.ouvertsIdsRefuses().has(id);
  }

  protected formatHeure(heure: string): string {
    return heure.substring(0, 5).replace(':', 'h');
  }

  // RG3 #386 : N = forfait autorisé (seuil) + forfait acheté - passages consommés
  protected get passagesRestantsSurAnnee(): number {
    const info = this.info();
    if (!info) return 0;
    return info.forfaitGratuitAnnuel + info.forfaitAcheteAnnuel - info.passagesConsommesAnnee;
  }

  protected retour(): void {
    this.router.navigate(['/' + routesConstantes.home]);
  }
}
