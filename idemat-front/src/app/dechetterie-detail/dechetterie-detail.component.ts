import {afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject, Injector, OnInit, signal, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip} from 'chart.js';

import {DechetteriesIdematServiceAgents} from '../../services/agents/idemat/dechetteries-idemat-service-agents';
import {DechetterieIdematModel} from '../../models/idemat/dechetterie-idemat.model';
import {routesConstantes} from '../../constantes/routes.constantes';
import {CHART_COLORS} from '../../constantes/couleurs.constantes';
import {CHART_JOURS_LABELS, CHART_PLACEHOLDER_VALEUR} from '../../constantes/chart.constantes';
import {JOURS_SEMAINE, JOURS_LABELS} from '../../constantes/dechetterie.constantes';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

@Component({
  selector: 'app-dechetterie-detail',
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dechetterie-detail.component.html',
  styleUrl: './dechetterie-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DechetterieDetailComponent implements OnInit {
  @ViewChild('chartCanvas') private chartCanvas!: ElementRef<HTMLCanvasElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(DechetteriesIdematServiceAgents);
  private readonly injector = inject(Injector);

  protected dechetterie = signal<DechetterieIdematModel | null>(null);
  protected loading = signal(true);

  protected readonly jours = JOURS_SEMAINE;
  protected readonly joursLabels = JOURS_LABELS;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.getById(id).subscribe(d => {
      this.dechetterie.set(d ?? null);
      this.loading.set(false);
      afterNextRender(() => this.initChart(), {injector: this.injector});
    });
  }

  protected retour(): void {
    this.router.navigate(['/' + routesConstantes.dechetteries]);
  }

  private initChart(): void {
    const d = this.dechetterie();
    if (!d || !this.chartCanvas) return;

    const hasData = d.affluence.length > 0;

    const labels = hasData ? d.affluence.map(a => a.jour) : [...CHART_JOURS_LABELS];
    const valeurs = hasData ? d.affluence.map(a => a.valeur) : Array(CHART_JOURS_LABELS.length).fill(CHART_PLACEHOLDER_VALEUR);
    const max = hasData ? Math.max(...valeurs) : 100;
    const bgColors = hasData
      ? valeurs.map(v => v === 0 ? CHART_COLORS.barEmpty : v > max / 2 ? CHART_COLORS.barHigh : CHART_COLORS.barLow)
      : Array(7).fill(CHART_COLORS.barPlaceholder);

    new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: valeurs,
          backgroundColor: bgColors,
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: 0.45,
          categoryPercentage: 0.8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {legend: {display: false}, tooltip: {enabled: false}},
        scales: {
          x: {
            grid: {display: false},
            border: {display: false},
            ticks: {font: {size: 11, weight: 'bold'}, color: CHART_COLORS.tickText}
          },
          y: {display: false, min: 0, max: 100}
        }
      }
    });
  }
}
