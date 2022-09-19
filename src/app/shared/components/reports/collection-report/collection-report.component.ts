import { Component, Input, OnInit } from '@angular/core';
import { TenantSettingsModel } from '@app/shared/models/tenant/tenant-settings';
import { LookupService } from '@app/shared/providers/service/lookup/lookup.service';
import { ModalController } from '@ionic/angular';
import { ATTEMPTED_STATUS, COLLECTION, PLAYER_EVENT_SOURCE } from '@shared/constants/helper-constants';
import { CollectionsModel } from '@shared/models/collection/collection';
import { PerformanceModel, PortfolioActivityAttempt, PortfolioPerformanceSummaryModel } from '@shared/models/portfolio/portfolio';
import { CollectionProvider } from '@shared/providers/apis/collection/collection';
import { PerformanceProvider } from '@shared/providers/apis/performance/performance';
import { PortfolioProvider } from '@shared/providers/apis/portfolio/portfolio';
import { CollectionPlayerService } from '@shared/providers/service/player/collection-player.service';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'collection-report',
  templateUrl: './collection-report.component.html',
  styleUrls: ['./collection-report.component.scss'],
  animations: [collapseAnimation({ duration: 400, delay: 0 })]
})
export class CollectionReportComponent implements OnInit {
  @Input() public contentId: string;
  @Input() public contentSource: string;
  @Input() public isSuggestion: boolean;
  @Input() public context: {
    classId: string,
    courseId: string,
    lessonId: string,
    unitId: string,
    pathId?: number,
    activityDate?: string,
    endDate?: string,
    sessionId: string,
    isPreview?: boolean
  };
  @Input() public collectionType: string;
  @Input() public userPerformance: PerformanceModel;
  @Input() public reportCollection: CollectionsModel;
  @Input() public reportPerformance: PortfolioPerformanceSummaryModel;
  @Input() public isClassProgressReport: boolean;
  public collection: CollectionsModel;
  public performance: PortfolioPerformanceSummaryModel;
  public isCollection: boolean;
  public hideAttemptList: boolean;
  public hideAttempts: boolean;
  public attemptList: Array<PortfolioActivityAttempt>;
  public currentAttemptDate: string;
  public tenantSettings: TenantSettingsModel;

  constructor(
    private collectionProvider: CollectionProvider,
    private modalCtrl: ModalController,
    private performanceProvider: PerformanceProvider,
    private collectionPlayerService: CollectionPlayerService,
    private portfolioProvider: PortfolioProvider,
    private lookupService: LookupService
  ) {
    this.hideAttemptList = true;
    this.hideAttempts = false;
  }

  public ngOnInit() {
    this.isCollection = (this.collectionType === COLLECTION);
    this.fetchTenantSettings();
    if (this.reportCollection || this.reportPerformance) {
      this.collection = { ...this.reportCollection };
      this.performance = { ...this.reportPerformance };
      this.hideAttempts = true;
    } else {
      this.fetchReportCollection();
    }
  }

  /**
   * @function fetchReportCollection
   * This method is used to fetch collection
   */
  public fetchReportCollection() {
    this.collectionProvider.fetchCollectionById(this.contentId, this.collectionType)
      .then((collectionResponse) => {
        this.collection = collectionResponse;
        if (!this.context.isPreview) {
          if (this.isCollection) {
            if (this.context.classId) {
              if (this.contentSource === PLAYER_EVENT_SOURCE.DAILY_CLASS) {
                this.fetchDCACollectionPerformance();
              } else if (this.contentSource === PLAYER_EVENT_SOURCE.COURSE_MAP
                || this.contentSource === PLAYER_EVENT_SOURCE.MASTER_COMPETENCY) {
                this.fetchCollectionPerformanceByContext();
              }
            } else {
              this.loadReportContent();
            }
          } else {
            this.performance = {
              collection: { ...this.userPerformance }
            };
          }
        }
      });
  }

  /**
   * @function onClickExternalURL
   * This method is used to render external collection url in browser
   */
  public onClickExternalURL() {
    this.collectionPlayerService.openResourceContent(this.collection, true);
  }

  /**
   * @function loadReportContent
   * This method is used to fetch both attempts and performance
   */
  public loadReportContent() {
    this.portfolioProvider.fetchAllAttemptsByItem(this.contentId).then((attemptsResponse) => {
      let attemptedList = attemptsResponse.usageData;
      if (!this.isClassProgressReport) {
        attemptedList = attemptsResponse.usageData.filter((attempt) => attempt.status === ATTEMPTED_STATUS.COMPLETE);
      }
      this.attemptList = attemptedList;
      this.fetchActivitySummary();
    });
  }

  /**
   * @function closeReport
   * This method is used to close modal
   */
  public closeReport() {
    this.modalCtrl.dismiss();
  }

  /**
   * @function fetchActivitySummary
   * This method is used to fetch performance
   */
  public fetchActivitySummary() {
    const attemptList = this.attemptList;
    let currentAttempt;
    if (this.isClassProgressReport || !this.context.sessionId) {
    currentAttempt = attemptList[0];
    } else {
    currentAttempt = attemptList.find((attempt) => attempt.sessionId === this.context.sessionId);
    }
    this.currentAttemptDate = currentAttempt ? currentAttempt.updatedAt : null;
    const sessionId = currentAttempt ? currentAttempt.sessionId : this.context.sessionId;
    const contentSource = currentAttempt.contentSource || this.contentSource;
    this.performanceProvider.fetchActivitySummary(this.collectionType, this.collection.id,
      sessionId, contentSource).then((performanceResponse) => {
        this.performance = performanceResponse;
      });
  }


  /**
   * @function reportRenderBasedOnDate
   * This method is used to render report based on sessionId
   */
  public reportRenderBasedOnDate(sessionId) {
    this.hideAttemptList = true;
    this.context.sessionId = sessionId;
    this.fetchActivitySummary();
  }

  /**
   * @function toggleAttemptList
   * This method is used to toggle the attempt list
   */
  public toggleAttemptList() {
    if (this.attemptList.length > 1) {
      this.hideAttemptList = !this.hideAttemptList;
    }
  }

  /**
   * @function fetchDCACollectionPerformance
   * This method is used to fetch DCA performance
   */
  public fetchDCACollectionPerformance() {
    const pathId = this.context ? this.context.pathId : null;
    const classId = this.context.classId;
    const params = {
      date: this.context.activityDate,
      classId,
      pathId,
      endDate: this.context.endDate,
      startDate: this.context.activityDate
    };
    this.performanceProvider.fetchDCACollectionPerformance(this.collectionType, this.collection.id, params)
      .then((collectionResponse) => {
        this.performance = collectionResponse;
      });
  }

  /**
   * @function fetchCollectionPerformanceByContext
   * This method is used to fetch activity summary by lesson
   */
  public fetchCollectionPerformanceByContext() {
    const pathId = this.context ? this.context.pathId : null;
    const paramsData = {
      classGooruId: this.context.classId,
      courseGooruId: this.context.courseId,
      unitGooruId: this.context.unitId,
      lessonGooruId: this.context.lessonId,
      pathId
    };
    this.performanceProvider.fetchCollectionPerformanceByContext(
      this.contentId,
      this.collectionType,
      paramsData)
      .then((collectionResponse) => {
        this.performance = collectionResponse;
      });
  }

  /**
   * @function fetchTenantSettings
   * This method is used to fetch tenant settings
   */
   private fetchTenantSettings() {
    this.lookupService.fetchTenantSettings().then((tenantSettings: TenantSettingsModel) => {
      this.tenantSettings = tenantSettings;
    });
  }
}
