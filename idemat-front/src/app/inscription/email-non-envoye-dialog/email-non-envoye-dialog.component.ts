import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';

@Component({
  selector: 'app-email-non-envoye-dialog',
  imports: [MatDialogModule],
  templateUrl: './email-non-envoye-dialog.component.html',
  styleUrl: './email-non-envoye-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailNonEnvoyeDialogComponent {
}
