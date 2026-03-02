import {ChangeDetectionStrategy, Component, inject,} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {AuthService} from '../services/auth/auth.service';
import {routesConstantes} from '../constantes/routes.constantes';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    RouterOutlet]
})
export class AppComponent {

  authService = inject(AuthService);
  protected readonly routesConstantes = routesConstantes;
}
