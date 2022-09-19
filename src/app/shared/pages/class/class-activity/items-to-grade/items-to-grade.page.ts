import { Component } from '@angular/core';
import { EVENTS } from '@app/shared/constants/events-constants';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { ModalController } from '@ionic/angular';
import { OaGradingReportComponent } from '@shared/components/offline-activity/oa-grading-report/oa-grading-report.component';
import { GradeItemsModel } from '@shared/models/grade-items/grade-items';
import { ClassActivityService } from '@shared/providers/service/class-activity/class-activity.service';
import { ClassService } from '@shared/providers/service/class/class.service';
import { LoadingService } from '@shared/providers/service/loader.service';
import { SessionService } from '@shared/providers/service/session/session.service';

@Component({
  selector: 'items-to-grade',
  templateUrl: './items-to-grade.page.html',
  styleUrls: ['./items-to-grade.page.scss'],
})
export class ItemsToGradePage {

  // -------------------------------------------------------------------------
  // Properties
  public gradeItemsList: Array<GradeItemsModel>;
  public noItemsToGrade: boolean;
  public userId: string;

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    public modalController: ModalController,
    private sessionService: SessionService,
    private loader: LoadingService,
    private classService: ClassService,
    private classActivityService: ClassActivityService,
    private parseService: ParseService
  ) {
    this.userId = this.sessionService.userSession.user_id;
  }

  // -------------------------------------------------------------------------
  // Events

  public ionViewDidEnter() {
    this.fetchGradeList(false);
    this.parseService.trackEvent(EVENTS.CLICK_STUDENT_LJ_MILESTONE_ITEM_REPORT);
  }

  /**
   * @function onRefresh
   * This method is used to refresh the page
   */
  public async onRefresh(event) {
    await this.fetchGradeList(true);
    event.target.complete();
  }


  /**
   * @function fetchGradeList
   * This method is used to fetch the grade list
   */
  private fetchGradeList(isReload) {
    if (!isReload) {
      this.loader.displayLoader();
    }
    return this.classActivityService.fetchGradeList(this.classService.class.id, this.userId)
      .then((gradeList) => {
        if (gradeList.length) {
          this.gradeItemsList = gradeList;
          this.noItemsToGrade = false;
        } else {
          this.noItemsToGrade = true;
        }
      }).finally(() => {
        if (!isReload) {
          this.loader.dismissLoader();
        }
        return;
      });
  }

  /**
   * @function openItemsToGradePullUp
   * This method is used to open the grade report
   */
  public async openItemsToGradePullUp(grade, gradeIndex) {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: OaGradingReportComponent,
      componentProps: {
        grade,
        classId: this.classService.class.id,
        userId: this.userId
      }
    });
    modal.onDidDismiss().then((dismissContent) => {
      if (dismissContent.data.isGraded) {
        this.gradeItemsList.splice(gradeIndex, 1);
        this.noItemsToGrade = !this.gradeItemsList.length;
      }
    });
    await modal.present();
  }
}
