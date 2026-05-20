import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';

import {AuthService} from '../../services/auth/auth.service';
import {routesConstantes} from '../../constantes/routes.constantes';

@Component({
  selector: 'app-informations-personnelles',
  imports: [MatIconModule],
  templateUrl: './informations-personnelles.component.html',
  styleUrl: './informations-personnelles.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InformationsPersonnellesComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly routesConstantes = routesConstantes;

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
