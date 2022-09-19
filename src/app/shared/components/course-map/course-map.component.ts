import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { UnitSummaryModel } from '@shared/models/course-map/course-map';
import { CourseContentVisibility } from '@shared/models/course/course';
import { MilestoneLocationModel } from '@shared/models/location/location';
import { TenantSettingsModel } from '@shared/models/tenant/tenant-settings';
import { LocationProvider } from '@shared/providers/apis/location/location';
import { ClassService } from '@shared/providers/service/class/class.service';
import { CourseMapService } from '@shared/providers/service/course-map/course-map.service';
import { LessonService } from '@shared/providers/service/lesson/lesson.service';
import { LookupService } from '@shared/providers/service/lookup/lookup.service';

@Component({
  selector: 'course-map',
  templateUrl: './course-map.component.html',
  styleUrls: ['./course-map.component.scss'],
})
export class CourseMapComponent implements OnInit, OnDestroy, OnChanges {

  // -------------------------------------------------------------------------
  // Properties
  @Input() public showCourseMapReport: boolean;
  @Input() public contentVisibility: CourseContentVisibility;
  @Input() public unitList: Array<UnitSummaryModel>;
  @Input() public isLoaded: boolean;
  public tenantSettings: TenantSettingsModel;
  public skeletonViewCount: number;
  public classId: string;
  public courseId: string;
  public courseTitle: string;
  public fwCode: string;
  public currentLocation: MilestoneLocationModel;
  @ViewChild(IonContent, { static: false }) public content: IonContent;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private classService: ClassService,
    private courseMapService: CourseMapService,
    private locationProvider: LocationProvider,
    private lessonService: LessonService,
    private lookupService: LookupService
  ) { }

  // -------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    this.skeletonViewCount = 3;
    const classDetails = this.classService.class;
    const classPerference = classDetails.preference;
    this.courseId = classDetails.course_id;
    this.classId = classDetails.id;
    this.courseTitle = classDetails.title;
    this.fwCode = classPerference && classPerference.framework
      ? classPerference.framework
      : null;
    this.fetchCurrentLocation();
    this.fetchTenantSettings();
  }

  public ngOnDestroy() {
    this.lessonService.unSubscribeEvent();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.showCourseMapReport && !changes.showCourseMapReport.firstChange) {
      this.showReportInPullUp();
    }
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchTenantSettings
   * This method is used to fetch tenantSettings
   */
  public fetchTenantSettings() {
    this.lookupService.fetchTenantSettings().then((tenantSettings: TenantSettingsModel) => {
      this.tenantSettings = tenantSettings;
    });
  }

  /**
   * @function showReportInPullUp
   * This method is used to show report in pull up
   */
  public showReportInPullUp() {
    const params = {
      classId: this.classId,
      courseId: this.courseId,
      courseTitle: this.courseTitle,
      unitList: this.unitList
    };
    this.courseMapService.openCourseMapReport(params, 'course-map-report');
  }

  /**
   * @function fetchCurrentLocation
   * This method is used to get current location list
   */
  public fetchCurrentLocation() {
    this.locationProvider
      .getCurrentLocation(this.classId, this.courseId)
      .then((location) => {
        this.currentLocation = location;
      });
  }

  /**
   * @function scrollToContent
   * This method is used to scroll to the view
   */
  public scrollToView(offsetTop) {
    this.content.scrollToPoint(0, offsetTop, 1000);
  }
}
