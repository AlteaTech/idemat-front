import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {CommonModule} from '@angular/common';


import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatTabsModule} from '@angular/material/tabs';
import {MocksOnglet1Component} from './mocks-onglet-1/mocks-onglet-1.component';
import {MatTooltipModule} from '@angular/material/tooltip';


export interface PocSeuilElement {
  libelle: string;
  type: string;
  nbPassages: string;
  matiere: string;
  quantite: string;
  periode: string;
  operation: string;
}

const MOCK_DATA: PocSeuilElement[] = [
  {
    libelle: 'Seuil semestre',
    type: 'Nombre de passages',
    nbPassages: '2',
    matiere: '/',
    quantite: '/',
    periode: 'Semestre',
    operation: 'Payant'
  },
  {
    libelle: 'Carton',
    type: 'Nombre de passages pour une quantité',
    nbPassages: '4',
    matiere: 'Carton',
    quantite: '/',
    periode: 'Année',
    operation: 'Bloquer'
  },
  {
    libelle: 'Passage GLC',
    type: 'Quantité sur plusieurs matières',
    nbPassages: '/',
    matiere: '/',
    quantite: '10',
    periode: 'Année',
    operation: 'Payant'
  },
  {
    libelle: 'Tout-venant',
    type: 'Quantité',
    nbPassages: '/',
    matiere: 'Terre m3',
    quantite: '2',
    periode: 'Jour',
    operation: 'Bloquer'
  },
];

@Component({
  selector: 'app-mocks',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatTabsModule,
    MocksOnglet1Component,
    MatTooltipModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mocks.component.html',
  styleUrl: './mocks.component.scss',
})
export class MocksComponent {
  isAdvancedSearchOpen = signal(false);


  pocAdvancedForm = new FormGroup({
    nom: new FormControl(''),
    societe: new FormControl(''),
    commune: new FormControl(''),
    identifiant: new FormControl(''),
    refClient: new FormControl(''),
    numCarte: new FormControl('')
  });

  displayedColumns: string[] = ['libelle', 'type', 'nbPassages', 'matiere', 'quantite', 'periode', 'operation', 'actions'];
  dataSource = MOCK_DATA;
  public nomOnglet3 = "Onglet avec nom variable";
  public contenuOnglet3 = "Contenu variable dans le ts du composant parent";

  protected onSearch() {

  }
}
