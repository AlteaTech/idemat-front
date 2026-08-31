import {ChangeDetectionStrategy, Component, inject, OnInit, signal, ViewChild} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {CommonModule, Location} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule, MatSidenav} from '@angular/material/sidenav';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

import {UsagerIdematServiceAgents} from '../../services/agents/idemat/usager-idemat-service-agents';
import {ContratIdematServiceAgents} from '../../services/agents/idemat/contrat-idemat-service-agents';
import {AuthService} from '../../services/auth/auth.service';
import {UsagerIdematModel} from '../../models/idemat/usager-idemat.model';
import {ContratIdematModel} from '../../models/idemat/contrat-idemat.model';
import {routesConstantes} from '../../constantes/routes.constantes';
import {LienNav} from '../../models/lien-nav.model';

@Component({
  selector: 'app-idemat-shell',
  imports: [CommonModule, RouterModule, MatIconModule, MatSidenavModule, MatProgressSpinnerModule],
  templateUrl: './idemat-shell.component.html',
  styleUrl: './idemat-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdematShellComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly authService = inject(AuthService);
  private readonly usagerService = inject(UsagerIdematServiceAgents);
  private readonly contratService = inject(ContratIdematServiceAgents);
  private readonly breakpointObserver = inject(BreakpointObserver);

  protected readonly routesConstantes = routesConstantes;
  protected usager = signal<UsagerIdematModel | null>(null);
  protected contrat = signal<ContratIdematModel | null>(null);
  protected liensNav = signal<LienNav[]>([]);
  protected loading = signal(true);
  protected isDesktop = signal(false);

  ngOnInit(): void {
    this.breakpointObserver.observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .subscribe(result => this.isDesktop.set(result.matches));

    this.usagerService.getUsager().subscribe(u => {
      this.usager.set(u);
      this.contratService.getContratForCurrentUser().subscribe(c => {
        this.contrat.set(c);
        this.liensNav.set(this.buildLiens(c));
        this.loading.set(false);
      });
    });
  }

  protected isActive(route: string): boolean {
    return this.router.url === '/' + route || this.router.url.startsWith('/' + route + '/');
  }

  protected naviguer(route: string): void {
    this.router.navigate(['/' + route]);
    if (!this.isDesktop()) {
      this.sidenav.close();
    }
  }

  protected onLienClick(lien: LienNav): void {
    if (lien.external) {
      this.ouvrirGuideTri();
      if (!this.isDesktop()) {
        this.sidenav.close();
      }
      return;
    }
    this.naviguer(lien.route);
  }

  private ouvrirGuideTri(): void {
    // onglet ouvert de façon synchrone dans le geste utilisateur (clic) — un window.open()
    // appelé après la réponse HTTP async serait bloqué silencieusement par le navigateur
    const nouvelOnglet = window.open('', '_blank');
    this.contratService.getGuideTri().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        if (nouvelOnglet) {
          nouvelOnglet.location.href = url;
        }
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      },
      error: (err) => {
        console.error('Erreur ouverture guide de tri', err);
        nouvelOnglet?.close();
      }
    });
  }

  protected goBack(): void {
    this.location.back();
  }

  protected deconnecter(): void {
    this.authService.logout();
  }

  private buildLiens(contrat: ContratIdematModel): LienNav[] {
    return [
      {icon: 'home', label: 'Accueil', route: routesConstantes.home, visible: true},
      {icon: 'menu_book', label: 'Guide de tri', route: 'guide-tri', visible: contrat.hasGuideTri, external: true},
      {icon: 'qr_code_2', label: 'Mes accès', route: routesConstantes.carteAcces, visible: contrat.allowCarteDematerialisee},
      {icon: 'delete_outline', label: 'Déchetteries', route: routesConstantes.dechetteries, visible: true},
      {icon: 'bar_chart', label: 'Mes passages', route: routesConstantes.consultationSolde, visible: true},
      {icon: 'add_circle_outline', label: 'Recharger mon compte', route: routesConstantes.achatPassages, visible: contrat.allowAchatPassages},
      {icon: 'person', label: 'Mon compte', route: routesConstantes.parametresCompte, visible: true, mobileOnly: true},
      {icon: 'gavel', label: 'Mentions légales', route: routesConstantes.mentionsLegales, visible: true},
    ].filter(l => l.visible);
  }
}
