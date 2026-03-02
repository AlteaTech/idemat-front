import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule} from '@angular/common';


import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-mocks-onglet-1',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    ReactiveFormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mocks-onglet-1.component.html',
  styleUrl: './mocks-onglet-1.component.scss',
})
export class MocksOnglet1Component {

}
