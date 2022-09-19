import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort'
})

export class SortPipe implements PipeTransform {
  public transform(list: any, field: string): any[] {
    if (!Array.isArray(list)) {
      return;
    }
    return list.sort((item1, item2) =>
      item1[field].toLowerCase() > item2[field].toLowerCase() ? 1 : -1
    );
  }
}
