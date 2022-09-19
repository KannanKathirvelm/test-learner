import { Component, Input, OnInit } from '@angular/core';
import { ClassModel } from '@app/shared/models/class/class';
import { GroupedFeaturedCourseModel, NavigatorProgram } from '@app/shared/models/course/course';
import { TenantSettingsModel } from '@app/shared/models/tenant/tenant-settings';
import { CourseService } from '@app/shared/providers/service/course/course.service';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'app-program-course',
  templateUrl: './program-course.component.html',
  styleUrls: ['./program-course.component.scss'],
  animations: [
    collapseAnimation({ duration: 500, delay: 0 })
  ],
})
export class ProgramCourseComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public indepententClassList: Array<ClassModel>;
  @Input() public tenantSettings: TenantSettingsModel;
  public programCourseList: Array<GroupedFeaturedCourseModel>;
  public programContentList: Array<NavigatorProgram>;
  public selectedProgram: NavigatorProgram;
  public showProgram: boolean;
  public showProgramList: boolean;
  public showClass = true;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private courseService: CourseService
  ) { }

  // -------------------------------------------------------------------------------
  // Actions

  public ngOnInit() {
    this.fetchNavigatorPrograms();
    this.fetchSubProgramCourseList();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function onSelectedProgam
   * This method is triggered when select the program course
   */
  public onSelectedProgam(program) {
    this.selectedProgram = program;
    this.showProgramList = true;
  }

  /**
   * @function toggleClasses
   * This method is used to toggle the answers
   */
  public toggleClasses() {
   this.showClass = !this.showClass;
  }

  /**
   * @function onGoBack
   * This method is used to back to program course page
   */
  public onGoBack() {
    this.showProgram = this.indepententClassList.length > 0 ? false : true;
    this.showProgramList = false;
  }

  /**
   * @function fetchNavigatorProgram
   * This method is used to fetch the navigator program data
   */
  public fetchNavigatorPrograms() {
    this.courseService.fetchNavigatorPrograms().then((programContents) => {
      this.programContentList = programContents;
      this.showProgram = this.indepententClassList.length > 0 ? false : true;
      if (!this.indepententClassList.length) {
        this.onSelectedProgam(this.programContentList[0]);
      }
    });
  }

  /**
   * @function fetchSubProgramCourseList
   * This method is used to fetch the navigator sub program list
   */
  public fetchSubProgramCourseList() {
    this.courseService.fetchSubProgramCourseList().then((programCourseList) => {
      this.programCourseList = programCourseList;
    });
  }
}
