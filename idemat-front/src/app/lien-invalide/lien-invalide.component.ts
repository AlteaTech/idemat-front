import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {Location} from '@angular/common';

@Component({
  selector: 'app-lien-invalide',
  imports: [],
  templateUrl: './lien-invalide.component.html',
  styleUrl: './lien-invalide.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LienInvalideComponent {
  private readonly location = inject(Location);

  protected retour(): void {
    this.location.back();
  }
}
