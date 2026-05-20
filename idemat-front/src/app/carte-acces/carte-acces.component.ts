import {Component, inject, OnInit, signal} from '@angular/core';
import {Location} from '@angular/common';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import * as QRCode from 'qrcode';

import {UsagerIdematServiceAgents} from '../../services/agents/idemat/usager-idemat-service-agents';
import {UsagerIdematModel} from '../../models/idemat/usager-idemat.model';

@Component({
  selector: 'app-carte-acces',
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './carte-acces.component.html',
  styleUrl: './carte-acces.component.scss'
})
export class CarteAccesComponent implements OnInit {
  private location = inject(Location);
  private usagerService = inject(UsagerIdematServiceAgents);

  usager = signal<UsagerIdematModel | null>(null);
  qrCodeUrl = signal<string>('');
  loading = signal(true);

  ngOnInit(): void {
    this.usagerService.getUsager().subscribe(async u => {
      this.usager.set(u);
      if (u.codeBarres) {
        const url = await QRCode.toDataURL(u.codeBarres, {width: 200, margin: 1});
        this.qrCodeUrl.set(url);
      }
      this.loading.set(false);
    });
  }

  retour(): void {
    this.location.back();
  }
}
