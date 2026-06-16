import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

import {ContratControllerService} from '../../core/api/api/contrat-controller.service';
import {routesConstantes} from '../../constantes/routes.constantes';
import {TypeInscription} from '../../models/idemat/inscription-idemat.model';

@Component({
  selector: 'app-inscription-type',
  imports: [MatSlideToggleModule],
  templateUrl: './inscription-type.component.html',
  styleUrl: './inscription-type.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InscriptionTypeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly contratService = inject(ContratControllerService);

  protected contrat = signal('');
  protected logoUrl = signal('');
  protected typeSelectionne = signal<TypeInscription | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const contrat = params.get('contrat');
      if (!contrat) {
        this.router.navigate(['/' + routesConstantes.lienInvalide], {replaceUrl: true});
        return;
      }
      this.contrat.set(contrat);
      this.contratService.getByUrl(contrat).subscribe({
        next: c => {
          if (c.logoBase64 && c.logoMime) {
            this.logoUrl.set(`data:${c.logoMime};base64,${c.logoBase64}`);
          }
        },
        error: () => this.router.navigate(['/' + routesConstantes.lienInvalide], {replaceUrl: true}),
      });
    });
  }

  protected onToggle(type: TypeInscription, checked: boolean): void {
    this.typeSelectionne.set(checked ? type : null);
  }

  protected valider(): void {
    const type = this.typeSelectionne();
    if (!type) return;
    const typePath = type === 'Part' ? 'particulier' : 'professionnel';
    this.router.navigate([`/${routesConstantes.creationCompte}/${this.contrat()}/${typePath}`]);
  }

  protected retour(): void {
    this.router.navigate(['/' + this.contrat()]);
  }
}
