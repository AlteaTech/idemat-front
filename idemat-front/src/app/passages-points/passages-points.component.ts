import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule, DatePipe} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {catchError, of} from 'rxjs';

import {PassagesIdematServiceAgents} from '../../services/agents/idemat/passages-idemat-service-agents';
import {ContratIdematServiceAgents} from '../../services/agents/idemat/contrat-idemat-service-agents';
import {UsagerIdematServiceAgents} from '../../services/agents/idemat/usager-idemat-service-agents';
import {AchatPassagesIdematServiceAgents} from '../../services/agents/idemat/achat-passages-idemat-service-agents';
import {PassagesInfoModel, PassagesStatsIdematModel} from '../../models/idemat/passages-idemat.model';
import {HistoriquePassageIdematModel} from '../../models/idemat/historique-passage-idemat.model';
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
  private readonly achatPassagesService = inject(AchatPassagesIdematServiceAgents);
  private readonly contratService = inject(ContratIdematServiceAgents);

  protected info = signal<PassagesInfoModel | null>(null);
  protected stats = signal<PassagesStatsIdematModel | null>(null);
  protected usager = signal<UsagerIdematModel | null>(null);
  protected passages = signal<HistoriquePassageIdematModel[]>([]);
  protected decompteUnites = signal(false);
  protected loading = signal(true);
  protected apercuMode = signal(true);
  protected currentPage = signal(0);
  protected totalPages = signal(0);
  protected ouvertsIds = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.usagerService.getUsager().subscribe(u => this.usager.set(u));
    this.contratService.getContratForCurrentUser().subscribe(c => this.decompteUnites.set(c.hasDecompteUnites));

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
  }

  private chargerApercu(): void {
    this.service.getHistorique(0, HISTORIQUE_DEPOTS_APERCU).subscribe(page => {
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
    this.service.getHistorique(0, HISTORIQUE_DEPOTS_PAGE_SIZE).subscribe(page => {
      this.passages.set(page.content);
      this.totalPages.set(page.totalPages);
      this.loading.set(false);
    });
  }

  protected changerPage(page: number): void {
    this.loading.set(true);
    this.currentPage.set(page);
    this.service.getHistorique(page, HISTORIQUE_DEPOTS_PAGE_SIZE).subscribe(result => {
      this.passages.set(result.content);
      this.loading.set(false);
    });
  }

  // `passages` et `passages_refuses` ont des séquences d'id indépendantes (même cause que le fix
  // back #463) — un id numérique seul peut désigner à la fois une ligne acceptée et une ligne
  // refusée. On identifie donc chaque ligne par id + estRefuse, jamais par id seul.
  protected cle(p: HistoriquePassageIdematModel): string {
    return `${p.id}-${p.estRefuse}`;
  }

  protected toggleDetails(cle: string): void {
    const set = new Set(this.ouvertsIds());
    if (set.has(cle)) { set.delete(cle); } else { set.add(cle); }
    this.ouvertsIds.set(set);
  }

  protected isOuvert(cle: string): boolean {
    return this.ouvertsIds().has(cle);
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

  // #517 : "N passage(s)" ou, si le contrat décompte par unités, "N unité(s) de passage" (singulier pour 0 et 1)
  protected nb(n: number): string {
    const s = n > 1 ? 's' : '';
    return this.decompteUnites() ? `${n} unité${s} de passage` : `${n} passage${s}`;
  }

  // Accord de l'adjectif/participe : féminin avec "unité", masculin avec "passage"
  protected accord(base: string, n: number): string {
    return base + (this.decompteUnites() ? 'e' : '') + (n > 1 ? 's' : '');
  }

  protected supplementaire(n: number): string {
    return n > 1 ? 'supplémentaires' : 'supplémentaire';
  }

  protected retour(): void {
    this.router.navigate(['/' + routesConstantes.home]);
  }
}
