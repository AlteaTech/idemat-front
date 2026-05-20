import {ChangeDetectionStrategy, Component, inject, OnInit, signal, ViewChild} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
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

interface LienNav {
  icon: string;
  label: string;
  route: string;
  visible: boolean;
}

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

  protected deconnecter(): void {
    this.authService.logout();
  }

  private buildLiens(contrat: ContratIdematModel): LienNav[] {
    return [
      {icon: 'home', label: 'Accueil', route: routesConstantes.home, visible: true},
      {icon: 'qr_code_2', label: 'Ma carte d\'accès', route: routesConstantes.carteAcces, visible: contrat.allowCarteDematerialisee},
      {icon: 'delete_outline', label: 'Déchetteries', route: routesConstantes.dechetteries, visible: true},
      {icon: 'bar_chart', label: 'Mes passages & points', route: routesConstantes.consultationSolde, visible: true},
      {icon: 'add_circle_outline', label: 'Recharger mon compte', route: routesConstantes.achatPassages, visible: contrat.allowAchatPassages},
      {icon: 'gavel', label: 'Mentions légales', route: routesConstantes.mentionsLegales, visible: true},
    ].filter(l => l.visible);
  }
}
