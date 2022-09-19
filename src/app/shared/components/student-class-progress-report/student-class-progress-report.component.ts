import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { pullDownAnimation } from '@app/shared/animations/pull-down';
import { pullUpAnimation } from '@app/shared/animations/pull-up';
import { EVENTS } from '@app/shared/constants/events-constants';
import { SessionModel } from '@app/shared/models/auth/session';
import { MasteredStatsModel, StreakStatsModel, StudentDataModel, StudentDatewiseTimespentModel, StudentSummaryDataModel, SuggestionStatsModel, TeacherDetailModel } from '@app/shared/models/class-progress/class-progress';
import { ClassModel } from '@app/shared/models/class/class';
import { ClassService } from '@app/shared/providers/service/class/class.service';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { PerformanceService } from '@app/shared/providers/service/performance/performance.service';
import { ReportService } from '@app/shared/providers/service/report/report.service';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CalenderComponent } from '@shared/components/calender/calender.component';
import { CONTENT_TYPES, REPORT_PERIOD_TYPE } from '@shared/constants/helper-constants';
import { SessionService } from '@shared/providers/service/session/session.service';
import { currentWeekDates, previousWeekDates } from '@shared/utils/global';
import { collapseAnimation } from 'angular-animations';
import * as moment from 'moment';

@Component({
  selector: 'student-class-progress-report',
  templateUrl: './student-class-progress-report.component.html',
  styleUrls: ['./student-class-progress-report.component.scss'],
  animations: [collapseAnimation({ duration: 400, delay: 0 })]
})

export class StudentClassProgressReportComponent implements OnInit, OnChanges {

  // -------------------------------------------------------------------------
  // Properties

  public userSession: SessionModel;
  public showNgxAvatar: boolean;
  public competencyBucket: Array<{ name: string, content: [], contentKey: string, description: string }> = [
    {
      name: this.translateValue('NEW_COMPETENCIES'),
      contentKey: 'mastered',
      content: [],
      description: this.translateValue('NO_COMPETENCIES')
    },
    {
      name: this.translateValue('DIAGNOTIC_GAINS'),
      contentKey: 'diagnostics',
      content: [],
      description: this.translateValue('NO_DIAGNOSTIC')
    },
    {
      name: this.translateValue('REINFORCED_GAINS'),
      contentKey: 'reinforced',
      content: [],
      description: this.translateValue('NO_REINFORCED')
    },
    {
      name: this.translateValue('TARGET_GROWTH'),
      contentKey: 'growth',
      content: [],
      description: this.translateValue('NO_GROWTH')
    },
    {
      name: this.translateValue('AREA_CONCERN'),
      contentKey: 'concern',
      content: [],
      description: this.translateValue('NO_CONCERN')
    },
    {
      name: this.translateValue('INCOMPLETE_COMPETENCIES'),
      contentKey: 'inprogress',
      content: [],
      description: this.translateValue('NO_PROGRESS')
    },
  ];
  public class: ClassModel;
  public studentsSummaryReportData: StudentDataModel[];
  public teacherInfo: TeacherDetailModel;
  public summaryData: StudentSummaryDataModel = {} as StudentSummaryDataModel;
  public suggestionStats: SuggestionStatsModel = {} as SuggestionStatsModel;
  public streakStats: StreakStatsModel = {} as StreakStatsModel;
  public masteredStats: MasteredStatsModel = {} as MasteredStatsModel;
  public selectedPeriod: string;
  public reportPeriod: Array<{ text: string, type: string }>;
  public isLoaded: boolean;
  public startDate: string = moment().format('YYYY-MM-DD');
  public endDate: string = moment().format('YYYY-MM-DD');
  public avatarSize: number;
  public studentDatewiseTimespent: StudentDatewiseTimespentModel[];
  public isShowDayWiseReport: boolean;
  public showMoreItems: boolean[] = [];
  public isShowMore: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  public constructor(
    private sessionService: SessionService,
    private modalCtrl: ModalController,
    private classService: ClassService,
    private performanceService: PerformanceService,
    private translate: TranslateService,
    private reportService: ReportService,
    private parseService: ParseService
  ) {
    this.reportPeriod = [{
      text: this.translateValue('CURRENT_WEEK'),
      type: REPORT_PERIOD_TYPE.CURRENT_WEEK
    }, {
      text: this.translateValue('PREVIOUS_WEEK'),
      type: REPORT_PERIOD_TYPE.PREVIOUS_WEEK
    }, {
      text: this.translateValue('TILL_NOW'),
      type: REPORT_PERIOD_TYPE.TILL_NOW
    }, {
      text: this.translateValue('CUSTOM_RANGE'),
      type: REPORT_PERIOD_TYPE.CUSTOM_RANGE
    }];
    this.selectedPeriod = REPORT_PERIOD_TYPE.CURRENT_WEEK;
  }

  // -------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    this.userSession = this.sessionService.userSession;
    this.avatarSize = 64;
    this.handleAvatarImage();
    this.class = this.classService.class;
    this.fetchCurrentWeekData();
    this.loadData();
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.handleAvatarImage();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function translateValue
   * This method used to translate value
   */
  public translateValue(value) {
    return this.translate.instant(value);
  }

  /**
   * @function handleAvatarImage
   * This Method is used to handle avatar image.
   */
  public handleAvatarImage() {
    this.showNgxAvatar = this.userSession && !this.userSession.thumbnail;
  }

  /**
   * @function imageErrorHandler
   * This Method is used to set ngx avatar if image error
   */
  public imageErrorHandler() {
    this.showNgxAvatar = !this.showNgxAvatar;
  }

  /**
   * @function closeReport
   * This method is used to close modal
   */
  public closeReport() {
    this.modalCtrl.dismiss();
  }

  /**
   * @function loadData
   * This method is used to load data
   */
  public loadData() {
    const classId = this.class.id;
    const startDate = this.startDate;
    const endDate = this.endDate;
    const subjectCode = this.class.preference.subject;
    const dataParam = {
      startDate,
      endDate,
      subjectCode,
      userId: this.userSession.user_id,
      classId
    };
    this.performanceService.getStudentProgressReport(dataParam).then((classProgressData) => {
      this.parseStudentsWeeklySummaryReportData(classProgressData.summaryData, classProgressData.classMembersTimespent);
      const { suggestionStats, streakStats, masteredStats, timespentDatewiseData } = classProgressData;
      this.suggestionStats = suggestionStats[0];
      this.streakStats = streakStats[0];
      this.masteredStats = masteredStats[0];
      this.parseReportData(classProgressData.studentReport);
      this.studentDatewiseTimespent = timespentDatewiseData.sort((a, b) => {
        return new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime();
      });
    });
  }
  /**
   * @function parseReportData
   * This method used to report data
   */
  private parseReportData(report) {
    const competencyBucket = this.competencyBucket;
    competencyBucket.forEach(item => {
      item.content = report[item.contentKey].sort((a, b) => {
        return new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime();
      });
    });
  }

  /**
   * @function parseStudentsWeeklySummaryReportData
   * This method used to parse students weekly summary report
   */
  public parseStudentsWeeklySummaryReportData(summaryReportData, classMembersTimespent) {
    const parsedStudentsSummaryReportData = [];
    this.teacherInfo = summaryReportData.teacher;
    const studentsSummaryReportData = summaryReportData.studentsSummaryData;
    studentsSummaryReportData.map(studentSummaryReportData => {
      const studentInfo = studentSummaryReportData.student;
      const studentTimespentData = classMembersTimespent.find(item => item.id === studentInfo.id);
      const parsedStudentSummaryData = {
        student: studentInfo,
        weeklyReportData: {}
      };
      const summaryData = studentSummaryReportData.summaryData;
      const weeklySummaryData = summaryData || null;
      if (weeklySummaryData) {
        let completedCompetencies = weeklySummaryData.completedCompetencies;
        const inprogressCompetencies = weeklySummaryData.inprogressCompetencies;
        const inferredCompetencies = weeklySummaryData.inferredCompetencies;
        const reInforcedCompetencies = weeklySummaryData.reInforcedCompetencies;
        const interactionContents = weeklySummaryData.interactionData;
        const masteredCompetencies = weeklySummaryData.masteredCompetencies;
        const suggestionContents = weeklySummaryData.suggestionData;
        const diagnosticStatus = weeklySummaryData.diagnosticAssessmentStatus;
        const completedCompetenciesCount = weeklySummaryData.completedCompetencies;
        const completedCompetenciesSource = completedCompetencies.filter(
          function(item) {
            return item.contentSource.indexOf('diagnostic') !== -1;
          }
        );
        completedCompetencies = completedCompetencies.filter(
          item => item.contentSource.indexOf('diagnostic') === -1
        );
        // parse low level data
        const assessmentInteration = interactionContents.assessmentData;
        const assessmentSuggestion = suggestionContents.assessmentData;
        const collectionSuggestion = suggestionContents.collectionData;
        const weeklyReportData = {
          masteredCompetencies: masteredCompetencies.concat(
            completedCompetencies
          ),
          masteredCompetenciesCount:
          (masteredCompetencies.length + completedCompetenciesCount.length),
          diagnosticGainedStatus: completedCompetenciesSource.length,
          masteryChallengeCount: masteredCompetencies.length,
          inferredCompetencies,
          inferredCompetenciesCount: inferredCompetencies.length,
          reInforcedCompetencies,
          reInforcedCompetenciesCount: reInforcedCompetencies.length,
          inprogressCompetencies,
          inprogressCompetenciesCount: inprogressCompetencies.length,
          totalTimespent: studentTimespentData
            ? studentTimespentData.totalCollectionTimespent +
            studentTimespentData.totalAssessmentTimespent
            : null,
          collectionTimespent: studentTimespentData
            ? studentTimespentData.totalCollectionTimespent
            : null,
          assessmentTimespent: studentTimespentData
            ? studentTimespentData.totalAssessmentTimespent
            : null,
          isNotStarted: assessmentInteration.isNotStarted,
          diagnosticStatus,
          badgeEarned: masteredCompetencies.length,
          averageScore: assessmentInteration.averageScore,
          suggestionTaken:
            assessmentSuggestion.count +
            collectionSuggestion.count
        };
        parsedStudentSummaryData.weeklyReportData = weeklyReportData;
      }
      parsedStudentsSummaryReportData.push(parsedStudentSummaryData);
    });
    this.studentsSummaryReportData = parsedStudentsSummaryReportData;
    this.summaryData = parsedStudentsSummaryReportData[0].weeklyReportData;
  }

  /**
   * @function fetchCurrentWeekData
   * Method to fetch students report data of current week
   */
  public fetchCurrentWeekData() {
    const currentWeek = currentWeekDates();
    this.startDate = currentWeek[0];
    this.endDate = currentWeek[currentWeek.length - 1];
    this.loadData();
  }

  /**
   * @function fetchPreviousWeekData
   * Method to fetch students report data of previous week
   */
  public fetchPreviousWeekData() {
    const previousWeek = previousWeekDates();
    this.startDate = previousWeek[0];
    this.endDate = previousWeek[previousWeek.length - 1];
    this.loadData();
  }

  /**
   * @function fetchTillNowData
   * Method to fetch students report data of till now
   */
  public fetchTillNowData() {
    this.startDate = moment(this.class.created_at).format('YYYY-MM-DD');
    this.endDate = moment().format('YYYY-MM-DD');
    this.loadData();
  }


  /**
   * @function showReport
   * This method is used to show report based on type
   */
  public showReport(content) {
    const isDateWiseReport = this.isShowDayWiseReport;
    const context = {
      collectionType: isDateWiseReport ? content.format : CONTENT_TYPES.ASSESSMENT,
      collectionId: isDateWiseReport ? content.id : content.assessmentId,
      isClassProgressReport: true
    };
    if (isDateWiseReport) {
      context['performance'] = content.performance;
    }
    this.reportService.showReport(context);
    this.parseService.trackEvent(EVENTS.CLICK_INDIVIDUAL_STUDENTS_ASSESSMENT);
  }

  /**
   * @function toggleReport
   * This method is used to toggle report
   */
  public toggleReport() {
    this.isShowDayWiseReport = !this.isShowDayWiseReport;
    const parseEvent = this.isShowDayWiseReport ? EVENTS.CLICK_INDIVIDUAL_REPORTS_OVERVIEW : EVENTS.CLICK_INDIVIDUAL_REPORTS_DATE;
    this.parseService.trackEvent(parseEvent);
  }

  /**
   * @function changeReportPeriod
   * Method to change report by type
   */
  public changeReportPeriod(event) {
    const reportType = event.detail.value;
    this.parseService.trackEvent(EVENTS.CLICK_PO_CLASS_PROGRESS_DATE);
    this.selectedPeriod = reportType;
    switch (reportType) {
      case REPORT_PERIOD_TYPE.CURRENT_WEEK:
        this.fetchCurrentWeekData();
        this.parseService.trackEvent(EVENTS.CLICK_PO_CLASS_PROGRESS_DATE_WEEKLY);
        break;
      case REPORT_PERIOD_TYPE.PREVIOUS_WEEK:
        this.fetchPreviousWeekData();
        this.parseService.trackEvent(EVENTS.CLICK_PO_CLASS_PROGRESS_DATE_WEEKLY);
        break;
      case REPORT_PERIOD_TYPE.TILL_NOW:
        this.fetchTillNowData();
        this.parseService.trackEvent(EVENTS.CLICK_PO_CLASS_PROGRESS_DATE_ALLTIME);
        break;
      default:
        this.openCalender();
        this.parseService.trackEvent(EVENTS.CLICK_PO_CLASS_PROGRESS_DATE_DATERANGE);
    }
  }

  /**
   * @function openCalender
   * Method used to open the calender
   */
  public openCalender() {
    const dateParams = {
      minDate: moment(this.class.created_at),
      maxDate: moment()
    };
    this.modalCtrl.create({
      component: CalenderComponent,
      cssClass: 'class-progress-report',
      enterAnimation: pullUpAnimation,
      leaveAnimation: pullDownAnimation,
      componentProps: dateParams
    }).then((modal) => {
      modal.onDidDismiss().then(response => {
         const context = response.data;
         if (context) {
           this.startDate = moment(context.startDate).format('YYYY-MM-DD');
           this.endDate = moment(context.endDate).format('YYYY-MM-DD');
           this.loadData();
          }
      });
      modal.present();
    });
  }

  /**
   * @function showMoreContent
   * This method is used to show more content
   */
  public showMoreContent(content) {
    content.isShowMore = !content.isShowMore;
  }
}
