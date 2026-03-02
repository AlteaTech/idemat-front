import {Injectable} from '@angular/core';
import {MatPaginatorIntl} from '@angular/material/paginator';
import {Subject} from 'rxjs';

@Injectable()
export class MatPaginatorIntlFr extends MatPaginatorIntl {
  override changes = new Subject<void>();


  override itemsPerPageLabel = 'Nombre par page :';


  override nextPageLabel = 'Page suivante';
  override previousPageLabel = 'Page précédente';
  override firstPageLabel = 'Première page';
  override lastPageLabel = 'Dernière page';

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0) {
      return `0 sur ${length}`;
    }
    const amount = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < amount ? Math.min(startIndex + pageSize, amount) : startIndex + pageSize;
    return `${startIndex + 1} – ${endIndex} sur ${amount}`;
  };
}
