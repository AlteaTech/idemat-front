import {ChangeDetectionStrategy, Component, ElementRef, inject, OnInit, signal, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip} from 'chart.js';

import {DechetteriesIdematServiceAgents} from '../../services/agents/idemat/dechetteries-idemat-service-agents';
import {DechetterieIdematModel} from '../../models/idemat/dechetterie-idemat.model';
import {routesConstantes} from '../../constantes/routes.constantes';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

const CHART_COLORS = {
  barEmpty: '#e8e8e8',
  barHigh: '#ED6E57',
  barLow: '#f4b8ad',
  tickText: '#888',
} as const;

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

  protected dechetterie = signal<DechetterieIdematModel | null>(null);
  protected loading = signal(true);

  protected readonly jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const;
  protected readonly joursLabels: Record<string, string> = {
    lundi: 'Lundi', mardi: 'Mardi', mercredi: 'Mercredi',
    jeudi: 'Jeudi', vendredi: 'Vendredi', samedi: 'Samedi', dimanche: 'Dimanche'
  };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.getById(id).subscribe(d => {
      this.dechetterie.set(d ?? null);
      this.loading.set(false);
      setTimeout(() => this.initChart(), 0);
    });
  }

  protected retour(): void {
    this.router.navigate(['/' + routesConstantes.dechetteries]);
  }

  private initChart(): void {
    const d = this.dechetterie();
    if (!d || !this.chartCanvas) return;

    const valeurs = d.affluence.map(a => a.valeur);
    const max = Math.max(...valeurs);

    new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: d.affluence.map(a => a.jour),
        datasets: [{
          data: valeurs,
          backgroundColor: valeurs.map(v =>
            v === 0 ? CHART_COLORS.barEmpty : v > max / 2 ? CHART_COLORS.barHigh : CHART_COLORS.barLow
          ),
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
