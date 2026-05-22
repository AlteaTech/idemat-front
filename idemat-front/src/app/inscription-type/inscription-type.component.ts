import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {ContratControllerService} from '../../core/api/api/contrat-controller.service';
import {routesConstantes} from '../../constantes/routes.constantes';
import {TypeInscription} from '../../models/idemat/inscription-idemat.model';

@Component({
  selector: 'app-inscription-type',
  imports: [],
  templateUrl: './inscription-type.component.html',
  styleUrl: './inscription-type.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InscriptionTypeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly contratService = inject(ContratControllerService);

  protected contrat = signal<string | null>(null);
  protected logoUrl = signal('');

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const contrat = params.get('contrat');
      this.contrat.set(contrat);
      if (contrat) {
        this.contratService.getByUrl(contrat).subscribe(c => {
          if (c.logoBase64 && c.logoMime) {
            this.logoUrl.set(`data:${c.logoMime};base64,${c.logoBase64}`);
          }
        });
      }
    });
  }

  protected choisir(type: TypeInscription): void {
    const contrat = this.contrat();
    if (!contrat) return;
    const typePath = type === 'Part' ? 'particulier' : 'professionnel';
    this.router.navigate([`/${routesConstantes.creationCompte}/${contrat}/${typePath}`]);
  }

  protected retour(): void {
    this.router.navigate(['/' + routesConstantes.connexionIdemat]);
  }
}
