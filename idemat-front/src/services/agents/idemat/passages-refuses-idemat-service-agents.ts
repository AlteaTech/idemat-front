import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {PassagesRefusesControllerService} from '../../../core/api/api/passages-refuses-controller.service';
import {PassageRefuseIdematModel} from '../../../models/idemat/passage-refuse-idemat.model';
import {PageIdematModel} from '../../../models/idemat/page-idemat.model';

@Injectable({providedIn: 'root'})
export class PassagesRefusesIdematServiceAgents {
  private readonly passagesRefusesService = inject(PassagesRefusesControllerService);

  getPassagesRefuses(page: number, size: number): Observable<PageIdematModel<PassageRefuseIdematModel>> {
    return this.passagesRefusesService.getPassagesRefuses(page, size, ['datePassage,DESC']).pipe(
      map(p => ({
        content: (p.content ?? []) as PassageRefuseIdematModel[],
        totalElements: p.totalElements ?? 0,
        totalPages: p.totalPages ?? 0,
        number: p.number ?? 0,
        size: p.size ?? size,
        first: p.first ?? true,
        last: p.last ?? true,
      }))
    );
  }
}
