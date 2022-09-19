import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TenantSettingsModel } from '@app/shared/models/tenant/tenant-settings';
import { LookupService } from '@app/shared/providers/service/lookup/lookup.service';
import { ModalController, NavParams } from '@ionic/angular';
import { ASSESSMENT, ASSESSMENT_SHOW_VALUES, ATTEMPTED_STATUS } from '@shared/constants/helper-constants';
import { CollectionsModel } from '@shared/models/collection/collection';
import { PerformanceModel, PortfolioActivityAttempt, PortfolioPerformanceSummaryModel } from '@shared/models/portfolio/portfolio';
import { CollectionProvider } from '@shared/providers/apis/collection/collection';
import { PerformanceProvider } from '@shared/providers/apis/performance/performance';
import { PortfolioProvider } from '@shared/providers/apis/portfolio/portfolio';
import { CollectionPlayerService } from '@shared/providers/service/player/collection-player.service';
import { collapseAnimation } from 'angular-animations';
import { BehaviorSubject, isObservable } from 'rxjs';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Component({
  selector: 'assessment-report',
  templateUrl: './assessment-report.component.html',
  styleUrls: ['./assessment-report.component.scss'],
  animations: [collapseAnimation({ duration: 400, delay: 0 })]
})
export class AssessmentReportComponent implements OnInit, OnDestroy {

  // -------------------------------------------------------------------------
  // Properties
  @Input() public contentId: string;
  @Input() public sessionId: string;
  @Input() public contentSource: string;
  @Input() public showCorrectAnswer: boolean;
  @Input() public isPreview: boolean;
  @Input() public collectionType: string;
  @Input() public userPerformance: PerformanceModel;
  @Input() public reportCollection: CollectionsModel;
  @Input() public reportPerformance: PortfolioPerformanceSummaryModel;
  @Input() public isClassProgressReport: boolean;
  public collection: CollectionsModel;
  public performance: PortfolioPerformanceSummaryModel;
  public isAnswerKeyHidden: boolean;
  public isAssessment: boolean;
  public attemptList: Array<PortfolioActivityAttempt>;
  public hideAttemptList: boolean;
  public currentAttemptDate: string;
  public hideAttempts: boolean;
  private sessionSubscription: AnonymousSubscription;
  public tenantSettings: TenantSettingsModel;

  constructor(
    private modalCtrl: ModalController,
    private collectionProvider: CollectionProvider,
    private performanceProvider: PerformanceProvider,
    private navParams: NavParams,
    private collectionPlayerService: CollectionPlayerService,
    private portfolioProvider: PortfolioProvider,
    private lookupService: LookupService
  ) {
    this.hideAttemptList = true;
    this.hideAttempts = false;
  }

  // -------------------------------------------------------------------------
  // EVENTS
  public ngOnInit() {
    this.isAssessment = (this.collectionType === ASSESSMENT);
    if (this.reportCollection || this.reportPerformance) {
      this.collection = { ...this.reportCollection };
      this.performance = { ...this.reportPerformance };
      this.hideAttempts = true;
      this.isAnswerKeyHidden = !this.showCorrectAnswer;
    } else {
      this.fetchReportCollection();
    }
    this.fetchTenantSettings();
  }

  /**
   * @function fetchReportCollection
   * This method is used to fetch collection
   */
  public fetchReportCollection() {
    this.collectionProvider.fetchCollectionById(this.contentId, this.collectionType).then((assessmentResponse) => {
      this.collection = assessmentResponse;
      this.isAnswerKeyHidden = this.collection.settings ? (this.collection.settings.showKey === ASSESSMENT_SHOW_VALUES.NEVER) : false;
      if (!this.isPreview) {
        if (isObservable(this.sessionId) && !this.isClassProgressReport) {
          const subject: BehaviorSubject<string> = this.navParams.get('sessionId');
          this.sessionSubscription = subject.subscribe((sessionId) => {
            this.sessionId = sessionId;
            if (this.sessionId) {
              this.loadReportContent();
            }
          });
        } else {
          if (this.isAssessment) {
            this.loadReportContent();
          } else {
            this.hideAttempts = true;
            this.performance = {
              assessment: { ...this.userPerformance }
            };
          }
        }
      }
    });
  }

  /**
   * @function onClickExternalURL
   * This method is used to render external assessment url in browser
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
      const attemptedList = attemptsResponse.usageData.filter((attempt) => attempt.status === ATTEMPTED_STATUS.COMPLETE);
      this.attemptList = attemptedList;
      this.fetchActivitySummary();
    });
  }

  /**
   * @function reportRenderBasedOnDate
   * This method is used to render report based on sessionId
   */
  public reportRenderBasedOnDate(sessionId) {
    this.hideAttemptList = true;
    this.sessionId = sessionId;
    this.fetchActivitySummary();
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
   * This method is used to fetch activity summary
   */
  public fetchActivitySummary() {
    const attemptList = this.attemptList;
    let currentAttempt = attemptList.find((attempt) => attempt.sessionId === this.sessionId);
    if (this.isClassProgressReport && attemptList.length) {
      currentAttempt = attemptList[0];
    }
    const sessionId = currentAttempt ? currentAttempt.sessionId :  this.sessionId;
    this.currentAttemptDate = currentAttempt ? currentAttempt.updatedAt : null;
    this.performanceProvider.fetchActivitySummary(this.collectionType, this.collection.id, sessionId, currentAttempt.contentSource).then((performanceResponse) => {
      this.performance = performanceResponse;
    });
  }

  public toggleAttemptList() {
    if (this.attemptList.length > 1) {
      this.hideAttemptList = !this.hideAttemptList;
    }
  }

  public ngOnDestroy() {
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
    }
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
