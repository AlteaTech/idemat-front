import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';

import {AuthService} from '../../services/auth/auth.service';
import {UsagerIdematServiceAgents} from '../../services/agents/idemat/usager-idemat-service-agents';
import {UsagerIdematModel} from '../../models/idemat/usager-idemat.model';
import {routesConstantes} from '../../constantes/routes.constantes';

@Component({
  selector: 'app-informations-personnelles',
  imports: [MatIconModule],
  templateUrl: './informations-personnelles.component.html',
  styleUrl: './informations-personnelles.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InformationsPersonnellesComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly usagerService = inject(UsagerIdematServiceAgents);

  protected readonly routesConstantes = routesConstantes;
  protected usager = signal<UsagerIdematModel | null>(null);

  ngOnInit(): void {
    this.usagerService.getUsager().subscribe(u => this.usager.set(u));
  }

  protected naviguer(route: string): void {
    this.router.navigate(['/' + route]);
  }

  protected retour(): void {
    this.router.navigate(['/' + routesConstantes.home]);
  }

  protected deconnecter(): void {
    this.authService.logout();
  }
}
