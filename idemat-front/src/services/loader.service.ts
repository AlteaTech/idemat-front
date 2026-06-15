import {Injectable, signal} from '@angular/core';

@Injectable({providedIn: 'root'})
export class LoaderService {
  private nbRequetesEnCours = 0;
  readonly loading = signal(false);

  openLoaderDialog(): void {
    this.nbRequetesEnCours++;
    this.loading.set(true);
  }

  closeLoaderDialog(): void {
    this.nbRequetesEnCours = Math.max(0, this.nbRequetesEnCours - 1);
    if (this.nbRequetesEnCours === 0) this.loading.set(false);
  }
}
