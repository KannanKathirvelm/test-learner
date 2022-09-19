import { Pipe, PipeTransform } from '@angular/core';
import { GRADING_SCALE } from '@shared/constants/helper-constants';

@Pipe({ name: 'gradeRange' })
export class GradeRangePipe implements PipeTransform {
  public transform(score) {
    let scaleSize = GRADING_SCALE.length - 1;
    let range = 'not-started'; // Default color

    if (this.isNumeric(score)) {
      for (; scaleSize >= 0; scaleSize--) {
        if (score >= GRADING_SCALE[scaleSize].LOWER_LIMIT) {
          range = GRADING_SCALE[scaleSize].RANGE;
          break;
        }
      }
    }
    return range;
  }


  /**
   * Determines if a parameter is type numeric
   */
  public isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

}
