import {Injectable} from '@angular/core';
import {delay, Observable, of} from 'rxjs';
import {DechetterieIdematModel} from '../../../models/idemat/dechetterie-idemat.model';

const MOCK_DECHETTERIES: DechetterieIdematModel[] = [
  {
    id: 1,
    nom: 'DSI DSACC',
    adresse: '5 avenue de la République',
    codePostal: '69001',
    ville: 'Lyon',
    horaires: {
      lundi:    {ouvert: true,  matin: '8h00-12h00',  apresMidi: '14h00-18h00'},
      mardi:    {ouvert: true,  matin: '8h00-12h00',  apresMidi: '14h00-18h00'},
      mercredi: {ouvert: true,  matin: '8h00-12h00',  apresMidi: '14h00-18h00'},
      jeudi:    {ouvert: true,  matin: '8h00-12h00',  apresMidi: '14h00-18h00'},
      vendredi: {ouvert: true,  matin: '8h00-12h00',  apresMidi: '14h00-17h00'},
      samedi:   {ouvert: true,  matin: '8h00-13h00',  apresMidi: ''},
      dimanche: {ouvert: false, matin: 'Fermé',        apresMidi: ''},
    },
    affluence: [
      {jour: 'LUN', valeur: 40},
      {jour: 'MAR', valeur: 60},
      {jour: 'MER', valeur: 55},
      {jour: 'JEU', valeur: 70},
      {jour: 'VEN', valeur: 85},
      {jour: 'SAM', valeur: 95},
      {jour: 'DIM', valeur: 0},
    ]
  },
  {
    id: 2,
    nom: 'DSI POLE DIGITAL',
    adresse: '20 rue Madelein Vionnet',
    codePostal: '93000',
    ville: 'Aubervilliers',
    horaires: {
      lundi:    {ouvert: true,  matin: '0h00-12h00',  apresMidi: '12h00-23h59'},
      mardi:    {ouvert: true,  matin: '0h00-12h00',  apresMidi: '12h00-23h59'},
      mercredi: {ouvert: true,  matin: '0h00-12h00',  apresMidi: '12h00-23h59'},
      jeudi:    {ouvert: true,  matin: '0h00-12h00',  apresMidi: '12h00-23h59'},
      vendredi: {ouvert: true,  matin: '0h00-12h00',  apresMidi: '12h00-23h59'},
      samedi:   {ouvert: true,  matin: '0h00-12h00',  apresMidi: '12h00-23h59'},
      dimanche: {ouvert: true,  matin: '0h00-12h00',  apresMidi: '12h00-23h59'},
    },
    affluence: [
      {jour: 'LUN', valeur: 30},
      {jour: 'MAR', valeur: 45},
      {jour: 'MER', valeur: 40},
      {jour: 'JEU', valeur: 50},
      {jour: 'VEN', valeur: 75},
      {jour: 'SAM', valeur: 90},
      {jour: 'DIM', valeur: 65},
    ]
  },
  {
    id: 3,
    nom: 'DSI TMA ALTEA',
    adresse: '12 allée des Techniciens',
    codePostal: '31000',
    ville: 'Toulouse',
    horaires: {
      lundi:    {ouvert: true,  matin: '9h00-12h00',  apresMidi: '14h00-17h30'},
      mardi:    {ouvert: true,  matin: '9h00-12h00',  apresMidi: '14h00-17h30'},
      mercredi: {ouvert: false, matin: 'Fermé',        apresMidi: ''},
      jeudi:    {ouvert: true,  matin: '9h00-12h00',  apresMidi: '14h00-17h30'},
      vendredi: {ouvert: true,  matin: '9h00-12h00',  apresMidi: '14h00-16h30'},
      samedi:   {ouvert: true,  matin: '9h00-13h00',  apresMidi: ''},
      dimanche: {ouvert: false, matin: 'Fermé',        apresMidi: ''},
    },
    affluence: [
      {jour: 'LUN', valeur: 50},
      {jour: 'MAR', valeur: 65},
      {jour: 'MER', valeur: 0},
      {jour: 'JEU', valeur: 55},
      {jour: 'VEN', valeur: 70},
      {jour: 'SAM', valeur: 80},
      {jour: 'DIM', valeur: 0},
    ]
  }
];

@Injectable({providedIn: 'root'})
export class DechetteriesIdematServiceAgents {

  // TODO: remplacer par appel HTTP GET /api/idemat/dechetteries
  getListe(): Observable<DechetterieIdematModel[]> {
    return of(MOCK_DECHETTERIES).pipe(delay(300));
  }

  // TODO: remplacer par appel HTTP GET /api/idemat/dechetteries/{id}
  getById(id: number): Observable<DechetterieIdematModel | undefined> {
    return of(MOCK_DECHETTERIES.find(d => d.id === id)).pipe(delay(300));
  }
}
