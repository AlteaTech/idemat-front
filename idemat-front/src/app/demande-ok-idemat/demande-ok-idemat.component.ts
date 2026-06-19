import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {StorageService} from '../../services/storage.service';
import {storagesConstantes} from '../../constantes/storages.constantes';
import {routesConstantes} from '../../constantes/routes.constantes';

@Component({
  selector: 'app-demande-ok-idemat',
  imports: [MatIconModule],
  templateUrl: './demande-ok-idemat.component.html',
  styleUrl: './demande-ok-idemat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemandOkIdematComponent {
  private readonly router = inject(Router);
  private readonly storageService = inject(StorageService);
  private readonly contratUrl: string = this.router.lastSuccessfulNavigation?.extras?.state?.['contratUrl']
    ?? history.state?.contratUrl
    ?? '';

  protected retourConnexion(): void {
    const slug = this.contratUrl || this.storageService.getLocalStorage(storagesConstantes.contratSlug);
    this.router.navigate(['/' + (slug ?? routesConstantes.lienInvalide)]);
  }
}
