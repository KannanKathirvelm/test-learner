import { Pipe, PipeTransform } from '@angular/core';
import { LAST_ACTIVITY, RESUME_CURRENT_ACTIVITY } from '@shared/constants/helper-constants';

@Pipe({ name: 'transformCurrentLocation' })
export class TransformCurrentLocationPipe implements PipeTransform {
  public transform(currentLocation) {
    if (currentLocation) {
      return currentLocation.status === 'complete' ? LAST_ACTIVITY : RESUME_CURRENT_ACTIVITY;
    }
  }
}
