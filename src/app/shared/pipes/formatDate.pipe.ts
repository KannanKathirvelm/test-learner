import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'formatDate' })
export class FormatDate implements PipeTransform {
  public transform(date, format) {
    return moment(date).format(format);
  }
}
