import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-loader-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  templateUrl: './loader-dialog.component.html',
  styleUrls: ['./loader-dialog.component.scss']
})
export class LoaderDialogComponent {
}
