import { Injectable } from '@angular/core';
import { LocationProvider } from '@shared/providers/apis/location/location';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private locationProvider: LocationProvider) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchCurrentLocation
   * This Method is used to get the milestone location
   */
  public fetchCurrentLocation(classId, courseId, fwCode) {
    return this.locationProvider.getCurrentLocation(classId, courseId, fwCode);
  }
}
