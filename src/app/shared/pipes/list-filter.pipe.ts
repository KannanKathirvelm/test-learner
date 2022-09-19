import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'listFilter'
})
export class ListFilterPipe implements PipeTransform {

  public transform(list: Array<any>, filterText: string, filterField: string): any {
    return list ? list.filter(item => item[`${filterField}`].search(new RegExp(filterText, 'i')) > -1) : [];
  }

}
