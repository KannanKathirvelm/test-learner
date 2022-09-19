import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SORTING_TYPES } from '@app/shared/constants/helper-constants';
import { GroupedFeaturedCourseModel, NavigatorProgram } from '@app/shared/models/course/course';
import { TenantSettingsModel } from '@app/shared/models/tenant/tenant-settings';
import { CourseService } from '@app/shared/providers/service/course/course.service';
import { sortByNumber } from '@app/shared/utils/global';

@Component({
  selector: 'app-program-course-list',
  templateUrl: './program-course-list.component.html',
  styleUrls: ['./program-course-list.component.scss'],
})
export class ProgramCourseListComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties
  @Input() public programCourseList: Array<GroupedFeaturedCourseModel>;
  @Input() public selectedProgram: NavigatorProgram;
  @Input() public tenantSettings: TenantSettingsModel;
  @Output() public clickGoBack = new EventEmitter();
  public navigatorSubProgramList: Array<NavigatorProgram>;

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private courseService: CourseService
  ) { }

  // ------------------------------------------------------------------
  // Actions
  public ngOnInit(): void {
      const subPrograms = this.courseService.navigatorSubProgram ? this.courseService.navigatorSubProgram : [];
      const selectedSubProgram = subPrograms.filter((item) => item.navigatorProgramId === this.selectedProgram.id);
      this.navigatorSubProgramList = sortByNumber(selectedSubProgram, 'sequence', SORTING_TYPES.ascending);
  }

  // -------------------------------------------------------
  // Actions

  /**
   * @function onGoBack
   * This method is used to dismiss the model
   */
  public onGoBack() {
    this.clickGoBack.emit(true);
  }
}
