import { Component, Input } from '@angular/core';
import { PLAYER_EVENT_SOURCE } from '@app/shared/constants/helper-constants';
import { LessonModel } from '@app/shared/models/lesson/lesson';
import { ReportService } from '@app/shared/providers/service/report/report.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-course-map-lesson-report',
  templateUrl: './course-map-lesson-report.component.html',
  styleUrls: ['./course-map-lesson-report.component.scss'],
})
export class CourseMapLessonReportComponent {
  // -------------------------------------------------------------------------
  // Properties
  @Input() public lessonInfo: LessonModel;
  @Input() public classId: string;
  @Input() public courseId: string;
  @Input() public unitId: string;
  @Input() public lessonId: string;

  constructor(
    private modalCtrl: ModalController,
    private reportService: ReportService
  ) {}
  // -------------------------------------------------------------------------
  // Actions

  /**
   * @function closeReport
   * Method to close the milestone performance report
   */
  public closeReport() {
    this.modalCtrl.dismiss();
  }

  /**
   * @function showCourseMapLessonReport
   * This method is used to show course map lesson report
   */
  public showCourseMapLessonReport(event, collection) {
      event.stopPropagation();
      const context = {
      collectionType: collection.format,
      collectionId: collection.id,
      contentSource: PLAYER_EVENT_SOURCE.COURSE_MAP,
      classId: this.classId,
      courseId: this.courseId,
      unitId: this.unitId,
      lessonId: this.lessonId,
      performance: collection.performance,
    };
      this.reportService.showReport(context);
  }
}
