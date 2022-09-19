import { Component, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FeaturedCourseListModel } from '@app/shared/models/course/course';
import { TaxonomyGrades } from '@app/shared/models/taxonomy/taxonomy';
import { TenantSettingsModel } from '@app/shared/models/tenant/tenant-settings';
import { ClassProvider } from '@app/shared/providers/apis/class/class';
import { CourseService } from '@app/shared/providers/service/course/course.service';
import { ProfileService } from '@app/shared/providers/service/profile/profile.service';
import { TaxonomyService } from '@app/shared/providers/service/taxonomy/taxonomy.service';

@Component({
  selector: 'app-sub-program',
  templateUrl: './sub-program.component.html',
  styleUrls: ['./sub-program.component.scss'],
})
export class SubProgramComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public navigatorSubProgram;
  @Input() public tenantSettings: TenantSettingsModel;
  public showMore: boolean;
  public course: FeaturedCourseListModel;
  @Output() public goBack = new EventEmitter();

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private router: Router,
    private courseService: CourseService,
    private classProvider: ClassProvider,
    private profileService: ProfileService,
    private taxonomyService: TaxonomyService,
    private ngZone: NgZone
  ) { }

  // -------------------------------------------------------------------------
  // Action
  public ngOnInit(): void {
    this.courseService.navigatorProgramCourseList.subscribe((courseList) => {
      this.ngZone.run(async () => {
        if (courseList) {
          this.course = courseList.find((item) => item.navigatorSubProgramId === this.navigatorSubProgram.id);
        }
      });
    });
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function getStartCourse
   * This method is used to get the course and start to study
   */
  public async getStartCourse() {
    if (this.course) {
      const courseDetail = {
        courseId: this.course.id,
      };
      const userProfile = this.profileService.currentUserProfileDetail;
      const subjectCode = this.course.subjectBucket;
      const frameworkId = this.course.settings.framework;
      const tenantPrefFwIds = this.tenantSettings.twFwPref || {};
      const tenantPrefFwId = tenantPrefFwIds[subjectCode];
      const prefFrameworkId = tenantPrefFwId ? tenantPrefFwId['default_fw_id'] : frameworkId;
      const gradeLevelDiff = this.getGradeLowerBoundByTenantSettings(frameworkId, subjectCode);
      const filters = {
        subject: subjectCode,
        fw_code: prefFrameworkId
      };
      let courseLowerBound;
      const taxonomyGrades: Array<TaxonomyGrades> = await this.taxonomyService.fetchGradesBySubject(filters);
      const studentSelectedGradeLevel = taxonomyGrades.find((taxonomyGrade) => taxonomyGrade.grade.toLowerCase() === userProfile.info.grade_level.toLowerCase());
      // get course lower bound using the grade level diff from tenant settings
      if (gradeLevelDiff) {
        const gradeLowerBoundSeq = studentSelectedGradeLevel.sequenceId - gradeLevelDiff;
        if (gradeLowerBoundSeq >= 1) {
          courseLowerBound = taxonomyGrades.find((item) => Number(item.sequenceId) === gradeLowerBoundSeq);
        }
      }
      const isPremiumCourse = this.isPremiumCourse(this.course);
      if (isPremiumCourse && courseLowerBound) {
        Object.assign(courseDetail, {
          gradeLowerBound: courseLowerBound.id
        });
        this.classProvider.joinPublicClass(courseDetail).then((response) => {
          const classId = response.headers.location;
          this.router.navigate(['/navigator'], { queryParams: { classId, subjectCode, isPublic: true, isProgramCourse: true, userSelectedUpperBound: studentSelectedGradeLevel.id } });
          this.goBack.emit();
        });
      }
    }
  }

  /**
   * @function isPremiumCourse
   * This method is used to check given course is premium course or not
   */
  public isPremiumCourse(course) {
    const settings = course.settings;
    return settings.grade_current && settings.grade_upper_bound;
  }

  /**
   * @function getGradeLowerBoundByTenantSettings
   * This method to get the grade lower bound by using tenant settings
   */
  private getGradeLowerBoundByTenantSettings(frameworkId, subjectCode) {
    // get the class grade diff from tenant settings
    const defaultGradeDiff = this.tenantSettings.defaultSkylineGradeDiffForDiagnostic ? this.tenantSettings.defaultSkylineGradeDiffForDiagnostic : null;
    const gradeDiff = this.tenantSettings.defaultSkylineGradeDiff && this.tenantSettings.defaultSkylineGradeDiff[`${frameworkId}.${subjectCode}`] ?
      this.tenantSettings.defaultSkylineGradeDiff[`${frameworkId}.${subjectCode}`] : defaultGradeDiff;
      if (!gradeDiff) {
      // tslint:disable-next-line
      console.error(`tenant default grade diff is empty for given class`);
    }
    return gradeDiff;
  }
}
