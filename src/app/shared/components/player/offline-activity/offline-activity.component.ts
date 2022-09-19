import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ROLES } from '@shared/constants/helper-constants';
import { GradeItemDeatilsModel, SubmissionsModel } from '@shared/models/offline-activity/offline-activity';
import { OATaskSubmissionPayload, PlayerContextModel } from '@shared/models/player/player';
import { RubricModel } from '@shared/models/rubric/rubric';
import { OfflineActivityProvider } from '@shared/providers/apis/offline-activity/offline-activity';
import { PlayerProvider } from '@shared/providers/apis/player/player';
import { ModalService } from '@shared/providers/service/modal.service';
import { SessionService } from '@shared/providers/service/session/session.service';
import { UtilsService } from '@shared/providers/service/utils/utils.service';
import { formatTime as formatMilliseconds, getTimeInMillisec } from '@shared/utils/global';
import { collapseAnimation } from 'angular-animations';
import * as moment from 'moment';

@Component({
  selector: 'offline-activity',
  templateUrl: './offline-activity.component.html',
  styleUrls: ['./offline-activity.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 })],
})
export class OfflineActivityComponent implements OnInit {
  public offlineForm: FormGroup;
  public etlTime: string;

  // -------------------------------------------------------------------------
  // Dependencies
  constructor(
    private session: SessionService,
    protected formBuilder: FormBuilder,
    private oaApiProvider: OfflineActivityProvider,
    private alertController: AlertController,
    private playerApiProvider: PlayerProvider,
    private translate: TranslateService,
    private modalService: ModalService,
    private utilsService: UtilsService
  ) {
    this.offlineForm = this.formBuilder.group({
      hours: ['', Validators.min(0)],
      minute: ['', Validators.max(60)]
    });
  }

  /**
   * @property {string} userId
   * Property for currently signed in user ID
   */
  get userId(): string {
    return this.session.userSession.user_id;
  }

  /**
   * @property {RubricModel} studentRubric
   * @getter property for offline activity's student rubric
   */
  get studentRubric(): RubricModel {
    return this.offlineActivity.studentRubric;
  }

  /**
   * @property {number} timespentInMilliSec
   * @getter property for timespent in millisec
   */
  get timespentInMilliSec() {
    return getTimeInMillisec(this.timeSpent.hour, this.timeSpent.minute);
  }

  get completedTasks() {
    const completedTasks = this.offlineActivity.tasks.filter((task) => task.submissions ? true : false);
    return completedTasks;
  }

  get completedPercentage() {
    return this.offlineActivity.tasks.length ? ((this.completedTasks.length / this.offlineActivity.tasks.length) * 100) : 0;
  }

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {GradeItemDeatilsModel} offlineActivity
   * Property for offline activity object data
   */
  @Input() public offlineActivity: GradeItemDeatilsModel;

  /**
   * @property {PlayerContextModel} playerContext
   * Property for current player context object
   */
  @Input() public playerContext: PlayerContextModel;

  /**
   * @property {string} offlineActivityId
   * Property for offline activity id
   */
  @Input() public offlineActivityId: string;

  /**
   * @property {boolean} isStudyPlayer
   * Property to check whether it's a study player or not
   */
  @Input() public isStudyPlayer: boolean;

  /**
   * @property {SubmissionsModel} oaSubmissions
   * Property for  oflfine activity submissions
   */
  public oaSubmissions: SubmissionsModel;

  /**
   * @property {boolean} isOaCompleted
   * Property to check whether the OA is completed or not
   */
  public isOaCompleted = false;

  /**
   * @property {boolean} isShowMoreInfo
   * Property to show/hide more infor about the OA
   */
  public isShowMoreInfo = false;

  /**
   * @property {string} timeZone
   * Property for current timezone
   */
  private timeZone: string = moment.tz.guess() || '';

  /**
   * @property {<hour?: number; minute?: number>} timeSpent
   * Property offline activity timeSpent
   */
  public timeSpent: { hour?: number; minute?: number } = { hour: 0, minute: 0 };

  /**
   * @property {boolean} isToggleTimespent
   * Property to show/hide timespent container
   */
  public isToggleTimespent = true;

  /**
   * @property {boolean} isTeacherGraded
   * Property to check whether the activity is graded by teacher or not
   */
  public isTeacherGraded = false;
  public isEnableCompletionButton: boolean;
  public isSubmitted: boolean;
  public showSuccessAlert: boolean;
  public successMessage1: string;
  public successMessage2: string;

  // -------------------------------------------------------------------------
  // Events
  public ngOnInit() {
    this.showSuccessAlert = false;
    this.successMessage1 = this.translate.instant('CONGRATUALTIONS');
    this.successMessage2 = this.translate.instant('YOU_ARE_ALL_CAUGHT_UP');
    this.loadData();
    this.doCheckIsCompleted();
    this.isSubmitted = false;
    if (this.offlineActivity && this.offlineActivity.authorEtlSecs > 0) {
      this.etlTime = this.utilsService.convertSecondsToHm(this.offlineActivity.authorEtlSecs);
    }
  }

  // -------------------------------------------------------------------------
  // Actions

  /**
   * @function presentAlertConfirm
   * Action triggered when clicking mark oa completed button
   */
  public async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: this.translate.instant('CONFIRM'),
      message: this.translate.instant('OA_COMPLETE_CONFIRMATION'),
      buttons: [
        {
          text: this.translate.instant('NO'),
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: this.translate.instant('YES'),
          cssClass: 'primary',
          handler: () => {
            this.markOACompleted();
          }
        }
      ]
    });

    await alert.present();
  }

  public toggleConfirmation() {
    this.isSubmitted = !this.isSubmitted;
  }

  /**
   * @function onSaveTimespent
   * Action triggered when click save timespent button
   */
  public onSaveTimespent() {
    if (this.offlineForm.valid) {
      this.isToggleTimespent = !this.isToggleTimespent;
      this.playerApiProvider.submitOfflineActivityTask(this.getTaskSubmissionPayload());
    }
  }

  /**
   * @function onSaveTimespent
   * Action enable save button
   */
  public get timeSpentSaveIsDisabled() {
    let showTimespentButton;
    if (this.timeSpent.hour > 0 || this.timeSpent.minute > 0) {
      showTimespentButton = false;
    } else {
      showTimespentButton = true;
    }
    return showTimespentButton;
  }

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @function loadData
   * Method to load all the dependency data while initializing component
   */
  private loadData() {
    Promise.all(
      [this.fetchOfflineActivity(), this.fetchOaSubmissions()]
    ).then((resolvedPromises) => {
      this.offlineActivity = resolvedPromises[0];
      this.oaSubmissions = resolvedPromises[1];
      if (this.oaSubmissions && this.oaSubmissions.tasks.length) {
        this.oaSubmissions.tasks.map((taskSubmission) => {
          const task = this.offlineActivity.tasks.find(taskItem => taskItem.id === taskSubmission.taskId);
          task.submissions = taskSubmission.submissions;
        });
      }
      const studentRubricGrades = this.oaSubmissions.oaRubrics ? this.oaSubmissions.oaRubrics.studentGrades : null;
      if (studentRubricGrades) {
        this.timeSpent = this.getHourMinute(formatMilliseconds(studentRubricGrades.timeSpent));
      }
      this.isTeacherGraded = this.oaSubmissions.oaRubrics ? !!this.oaSubmissions.oaRubrics.teacherGrades : false;
    });
  }

  /**
   * @function pendingItemStatus
   * Method to validate
   */
  public checkValidation(value) {
    const task = this.offlineActivity.tasks[value.index];
    task.isSubmitted = value.isValid;
    const submittedTask = this.offlineActivity.tasks.filter((taskItem) => taskItem.isSubmitted);
    this.isEnableCompletionButton = this.offlineActivity.tasks.length === submittedTask.length;
  }

  /**
   * @function getHourMinute
   * @param {string} timeString
   * @return {Object}
   * Method to get hour and minute from given timespent string
   */
  private getHourMinute(timeString: string = '') {
    let hour = 0;
    let minute = 0;
    if (timeString) {
      const splittedTime = timeString.split(' ');
      const firstHalfString = splittedTime[0];
      const secodHalfString = splittedTime[1];
      if (firstHalfString.includes('h')) {
        hour = Number(firstHalfString.slice(0, -1));
      } else if (firstHalfString.includes('m')) {
        minute = Number(firstHalfString.slice(0, -1));
      }
      if (secodHalfString.includes('m')) {
        minute = Number(secodHalfString.slice(0, -1));
      }
    }
    return {
      hour, minute
    };
  }

  /**
   * @function fetchOaSubmissions
   * @return {Promise<SubmissionsModel>}
   * Method to fetch Offline Activity submissions
   */
  private fetchOaSubmissions(): Promise<SubmissionsModel> {
    return new Promise((resolve, reject) => {
      let dataParam = null;
      if (this.isStudyPlayer) {
        dataParam = {
          courseId: this.playerContext.courseId,
          unitId: this.playerContext.unitId,
          lessonId: this.playerContext.lessonId
        };
      }
      const activityId = this.playerContext.caContentId || this.offlineActivityId;
      this.oaApiProvider.fetchOaSubmissions(this.playerContext.classId, activityId, dataParam).then((oaSubmissions) => {
        resolve(oaSubmissions);
      }, reject);
    });
  }

  /**
   * @function fetchOfflineActivity
   * @return {Promise<GradeItemDeatilsModel>}
   * Method to fetch offline activity
   */
  private fetchOfflineActivity(): Promise<GradeItemDeatilsModel> {
    return new Promise((resolve, reject) => {
      if (this.offlineActivity) {
        resolve(this.offlineActivity);
      } else {
        this.oaApiProvider.fetchOaGradeActivity(this.offlineActivityId).then((offlineActivity: GradeItemDeatilsModel) => {
          resolve(offlineActivity);
        }, reject);
      }
    });
  }

  /**
   * @function markOACompleted
   * Method to mark OA status as completed
   */
  public markOACompleted() {
    const oaData: any = {
      class_id: this.playerContext.classId,
      oa_id: this.offlineActivity.id,
      content_source: this.playerContext.source,
      student_id: this.session.userSession.user_id,
      marked_by: ROLES.STUDENT,
      path_id: 0,
      path_type: null,
      time_zone: this.timeZone,
      student_rubric_id: this.studentRubric ? this.studentRubric.id : null
    };

    if (this.isStudyPlayer) {
      oaData.course_id = this.playerContext.courseId;
      oaData.unit_id = this.playerContext.unitId;
      oaData.lesson_id = this.playerContext.lessonId;
    } else {
      oaData.oa_dca_id = Number(this.playerContext.caContentId);
    }
    this.oaApiProvider.markCompleted(oaData).then(() => {
      this.isOaCompleted = true;
      this.toggleConfirmation();
    });
  }

  /**
   * @function getCompletedStudents
   * Method to get list of students who have marked the activity as completed
   */
  private doCheckIsCompleted() {
    const classId = this.playerContext.classId;
    const oaId = this.offlineActivityId || this.offlineActivity.id;
    const activityId = this.playerContext.caContentId || null;
    let requestParam = null;
    if (this.isStudyPlayer) {
      requestParam = {
        courseId: this.playerContext.courseId,
        unitId: this.playerContext.unitId,
        lessonId: this.playerContext.lessonId
      };
    }

    return this.oaApiProvider.getCompletedStudents(classId, oaId, activityId, requestParam).then((students: string[]) => {
      this.isOaCompleted = students.includes(this.session.userSession.user_id);
    });
  }

  /**
   * @function getTaskSubmissionPayload
   * @return {OATaskSubmissionPayload}
   * Method to construct task submission payload
   */
  private getTaskSubmissionPayload(): OATaskSubmissionPayload {
    const submissionPayload: OATaskSubmissionPayload = {
      student_id: this.session.userSession.user_id,
      class_id: this.playerContext.classId,
      oa_id: this.offlineActivityId,
      content_source: this.playerContext.source,
      submissions: [],
      time_spent: this.timespentInMilliSec
    };
    if (this.isStudyPlayer) {
      submissionPayload.course_id = this.playerContext.courseId;
      submissionPayload.unit_id = this.playerContext.unitId;
      submissionPayload.lesson_id = this.playerContext.lessonId;
    } else {
      submissionPayload.oa_dca_id = Number(this.playerContext.caContentId);
    }
    return submissionPayload;
  }

  /**
   * @function showAlert
   * Method to display alert
   */
  public showAlert() {
    this.showSuccessAlert = true;
  }

  /**
   * @function dismissAlert
   * Method to close alert
   */
  public dismissAlert(value) {
    if (value) {
      this.modalService.dismiss();
      this.showSuccessAlert = false;
    }
  }
}
