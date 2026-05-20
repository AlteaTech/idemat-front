import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {MentionsLegalesIdematServiceAgents} from '../../services/agents/idemat/mentions-legales-idemat-service-agents';
import {routesConstantes} from '../../constantes/routes.constantes';

@Component({
  selector: 'app-mentions-legales',
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './mentions-legales.component.html',
  styleUrl: './mentions-legales.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MentionsLegalesComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly service = inject(MentionsLegalesIdematServiceAgents);

  protected contenu = signal<string>('');
  protected loading = signal(true);

  ngOnInit(): void {
    this.service.getMentionsLegales().subscribe(html => {
      this.contenu.set(html);
      this.loading.set(false);
    });
  }

  protected retour(): void {
    this.router.navigate(['/' + routesConstantes.home]);
  }
}
