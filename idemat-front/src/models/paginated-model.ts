export class PaginatedModel<T> {
  totalElements: number = 0;
  totalPages: number = 0;
  datas: T[] = [];
}
