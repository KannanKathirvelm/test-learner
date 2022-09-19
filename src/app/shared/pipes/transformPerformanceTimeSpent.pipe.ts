import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'transformPerformanceTimeSpent' })
export class TransformPerformanceTimeSpent implements PipeTransform {
  public transform(timeInMillis) {
    let result = '';
    let secs;
    if (timeInMillis) {
      secs = timeInMillis / 1000;
      const hours = secs / 3600;
      secs = secs % 3600;
      const mins = secs / 60;
      secs = secs % 60;
      if (hours >= 1) {
        result = `${Math.floor(hours)}h `;
        if (mins >= 1) {
          result += `${Math.floor(mins)}m`;
        }
      } else {
        if (mins >= 1) {
          result = `${Math.floor(mins)}m `;
        }
        if (secs >= 1) {
          result += `${Math.floor(secs)}s`;
        }
      }
    } else {
      result = '---';
    }
    return result;
  }
}
