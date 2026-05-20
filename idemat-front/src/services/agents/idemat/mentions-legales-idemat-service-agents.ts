import {Injectable} from '@angular/core';
import {delay, Observable, of} from 'rxjs';

@Injectable({providedIn: 'root'})
export class MentionsLegalesIdematServiceAgents {

  // TODO: remplacer par appel HTTP GET /api/idemat/contrat/mentions-legales
  getMentionsLegales(): Observable<string> {
    return of(`
      <p>Pour finaliser votre préinscription, vous devez accepter le règlement intérieur
      de la déchetterie qui vous a été remis lors de votre passage en déchetterie.
      Pour ce faire, acceptez les conditions générales.</p>
      <p>Les informations recueillies font l'objet d'un traitement informatique destiné
      à la gestion de votre accès aux déchetteries. Conformément à la loi Informatique
      et Libertés, vous disposez d'un droit d'accès et de rectification aux informations
      qui vous concernent.</p>
    `).pipe(delay(300));
  }
}
