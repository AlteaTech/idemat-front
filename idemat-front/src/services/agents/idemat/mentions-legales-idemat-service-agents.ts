import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {ContratControllerService} from '../../../core/api/api/contrat-controller.service';

@Injectable({providedIn: 'root'})
export class MentionsLegalesIdematServiceAgents {
  private readonly contratService = inject(ContratControllerService);

  getMentionsLegales(): Observable<string> {
    return this.contratService.getMentionsLegales('body', false, {httpHeaderAccept: 'text/plain' as '*/*'}).pipe(map(r => r ?? ''));
  }
}
