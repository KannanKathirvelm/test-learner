import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MilestoneLocationModel } from '@shared/models/location/location';
import { MilestoneModel } from '@shared/models/milestone/milestone';
import { LocationService } from '@shared/providers/service/location/location.service';
import { MilestoneService } from '@shared/providers/service/milestone/milestone.service';

@Component({
  selector: 'app-diagnostic-route',
  templateUrl: './diagnostic-route.component.html',
  styleUrls: ['./diagnostic-route.component.scss'],
})
export class DiagnosticRouteComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public courseId: string;
  @Input() public classId: string;
  @Input() public fwCode: string;
  @Input() public subjectCode: string;
  @Input() public isRouteCheckFailed: boolean;
  @Input() public title: string;
  @Input() public milestones: Array<MilestoneModel>;
  public isLoaded: boolean;
  public currentLocation: MilestoneLocationModel;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private milestoneService: MilestoneService,
    private locationService: LocationService,
    private modalCtrl: ModalController
  ) { }

  // -------------------------------------------------------------------------
  // Life Cycle Methods

  public ngOnInit() {
    if (!this.isRouteCheckFailed) {
      this.fetchMilestones();
    }
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchMilestones
   * This method is used to fetch milestones
   */
  public fetchMilestones() {
    this.isLoaded = false;
    this.fetchCurrentLocation();
    this.milestoneService.fetchMilestone().then((milestonesRes) => {
      this.milestones = milestonesRes;
      this.isLoaded = true;
    });
  }

  /**
   * @function fetchCurrentLocation
   * This method is used to get current location list
   */
  public async fetchCurrentLocation() {
    if (this.fwCode) {
      this.currentLocation = await this.locationService.fetchCurrentLocation(this.classId, this.courseId, this.fwCode);
    }
  }

  /**
   * @function closeModal
   * This method is used to close modal
   */
  public closeModal() {
    this.modalCtrl.dismiss();
  }
}
