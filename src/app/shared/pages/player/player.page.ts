import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EVENTS } from '@app/shared/constants/events-constants';
import { TenantSettingsModel } from '@app/shared/models/tenant/tenant-settings';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { IonContent, NavParams } from '@ionic/angular';
import { CONTENT_TYPES, PLAYER_EVENT_SOURCE } from '@shared/constants/helper-constants';
import { routerPath } from '@shared/constants/router-constants';
import { ClassModel } from '@shared/models/class/class';
import { CollectionsModel } from '@shared/models/collection/collection';
import { ResourceLocation } from '@shared/models/location/location';
import { PlayerPerformanceModel } from '@shared/models/performance/performance';
import { PlayerContextModel } from '@shared/models/player/player';
import { PortfolioPerformanceSummaryModel } from '@shared/models/portfolio/portfolio';
import { CollectionProvider } from '@shared/providers/apis/collection/collection';
import { LocationProvider } from '@shared/providers/apis/location/location';
import { OfflineActivityProvider } from '@shared/providers/apis/offline-activity/offline-activity';
import { PerformanceProvider } from '@shared/providers/apis/performance/performance';
import { FeedbackService } from '@shared/providers/service/feedback/feedback.service';
import { LookupService } from '@shared/providers/service/lookup/lookup.service';
import { ModalService } from '@shared/providers/service/modal.service';
import { CollectionPlayerService } from '@shared/providers/service/player/collection-player.service';
import axios from 'axios';

@Component({
  selector: 'player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss']
})
export class PlayerPage implements OnInit {

  // -------------------------------------------------------------------------
  // Properties
  @ViewChild(IonContent, { static: false }) public content: IonContent;
  private collectionId: string;
  private classInfo: ClassModel;
  private collectionPerformance: PlayerPerformanceModel;
  public collection: CollectionsModel;
  public lastPlayedContentPerformance: PortfolioPerformanceSummaryModel;
  public currentResourceLocation: ResourceLocation;
  public isModalView: boolean;
  public isFinished: boolean;
  public tenantSettings: TenantSettingsModel;
  @Input() public context: PlayerContextModel;
  get isOfflineActivity() {
    return this.context.collectionType === CONTENT_TYPES.OFFLINE_ACTIVITY;
  }

  /** Stop hardware back button */
  @HostListener('document:ionBackButton', ['$event'])
  public overrideHardwareBackAction(event) {
    this.onBack();
  }

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private router: Router,
    private collectionProvider: CollectionProvider,
    private collectionPlayerService: CollectionPlayerService,
    private locationProvider: LocationProvider,
    private offlineActivityProvider: OfflineActivityProvider,
    private feedbackService: FeedbackService,
    private performanceProvider: PerformanceProvider,
    private modalService: ModalService,
    private lookupService: LookupService,
    private parseService: ParseService
  ) {
    const navParams = new NavParams();
    this.classInfo = navParams.get('classInfo');
    this.isModalView = true;
  }

  // -------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    if (this.context) {
      this.loadData();
    }
    this.fetchTenantSettings();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadData
   * This method is used to load the context data
   */
  public loadData() {
    this.collectionId = this.context.collectionId;
    this.initialLoadData();
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

  /**
   * @function onBack
   * This method is used to handle the back event
   */
  public onBack(isFinished?) {
    if (this.isModalView) {
      this.modalService.dismiss(this.collectionPerformance);
      if (this.context.isDiagnosticAssessment) {
        this.navigateToNavigatorPage(isFinished);
      }
    } else {
      this.navigateToStudentHome();
    }
    this.parseService.trackEvent(EVENTS.CLOSE_PLAYER_CONTAINER);
  }

  public navigateToNavigatorPage(isFinished) {
    const classId = this.classInfo.id;
    const isPublic = this.classInfo.isPublic;
    const isProgramCourse = this.context.isProgramCourse || false;
    const userSelectedUpperBound = this.context.userSelectedUpperBound || null;
    if (isPublic) {
      this.router.navigate(['/navigator'], { queryParams: { classId, isPublic: true, forceReload: true, isFinished, isProgramCourse, userSelectedUpperBound } });
    } else {
      this.router.navigate(['/navigator'], { queryParams: { classId, forceReload: true, isFinished } });
    }
  }

  /**
   * @function navigateToStudentHome
   * This method is used to navigate to student home
   */
  public navigateToStudentHome() {
    this.router.navigate([routerPath('studentHome')]);
  }

  /**
   * @function initialLoadData
   * This method is used to load initial data
   */
  public initialLoadData() {
    return axios.all([
      this.fetchLastLocation(this.collectionId, this.context),
      this.getPlayerContent(),
      this.fetchFeedbackCategories()
    ]).then(axios.spread(async (location: ResourceLocation, collectionData: CollectionsModel) => {
      this.context.lessonId = this.context.lessonId || collectionData.lessonId;
      this.context.unitId = this.context.unitId || collectionData.unitId;
      this.context.courseId = this.context.courseId || collectionData.courseId;
      this.collection = collectionData;
      this.currentResourceLocation = location;
      const lastPlayedSessionId = this.getLastPlayedSessionId(location);
      if (lastPlayedSessionId) {
        this.getLastPlayedSessionPerformance(lastPlayedSessionId);
      }
      if (this.collection.isCollection || this.collection.isAssessment) {
        this.collectionPlayerService.onCollectionPlay(this.collection, this.context, lastPlayedSessionId);
      }
    }));
  }

  /**
   * @function getLastPlayedSessionPerformance
   * This method is used get the last played session performance
   */
  private getLastPlayedSessionPerformance(lastPlayedSessionId) {
    this.performanceProvider.fetchActivitySummary(this.collection.format, this.collection.id,
      lastPlayedSessionId, this.context.source).then((activityPerformance) => {
        this.lastPlayedContentPerformance = activityPerformance;
      });
  }

  /**
   * @function getLastPlayedSessionId
   * This method is used get the last played session id
   */
  private getLastPlayedSessionId(location) {
    return location && location.collectionStatus !== 'complete' ? location.sessionId : null;
  }


  /**
   * @function fetchLastLocation
   * This method is used to fetch the last location in the collection
   */
  public fetchLastLocation(collectionId, context) {
    if (context.caContentId) {
      return this.locationProvider.getCurrentResourceLocation(collectionId, context);
    }
    return null;
  }

  /**
   * @function onFinishCollection
   * This method will trigger when finish the collection
   */
  public onFinishCollection(value) {
    this.isFinished = true;
    if (this.context.source === PLAYER_EVENT_SOURCE.DIAGNOSTIC) {
      this.onBack(true);
    } else {
      this.collectionPerformance = {
        performance: value.performance,
        sessionId: value.sessionId,
        context: this.context
      };
      setTimeout(() => {
        const reportElement = this.content['el'].querySelector('#report-container');
        if (reportElement) {
          const reportElementPosition = reportElement['offsetTop'];
          this.scrollToContentView(reportElementPosition);
        }
      }, 500);
    }
  }

  /**
   * @function scrollToContentView
   * This method is used to scroll into element
   */
  public scrollToContentView(scrollPosition) {
    this.content.scrollToPoint(0, scrollPosition, 1000);
  }

  /**
   * @function fetchFeedbackCategories
   * This method is used to fetch feedback categories
   */
  public fetchFeedbackCategories() {
    return this.feedbackService.fetchFeedbackCategory();
  }

  public getPlayerContent() {
    if (this.isOfflineActivity) {
      return this.fetchOfflineActivity();
    } else {
      return this.fetchCollection();
    }
  }

  /**
   * @function fetchCollection
   * This method is used to fetch the collection
   */
  public fetchCollection() {
    return this.collectionProvider.fetchCollectionById(this.collectionId,
      this.context.collectionType).then((collection) => {
        return collection;
      });
  }

  public fetchOfflineActivity() {
    return this.offlineActivityProvider.fetchOaGradeActivity(this.collectionId);
  }

  /**
   * @function playerScrollEnd
   * This method is used to scroll to the bottom
   */
  public playerScrollEnd() {
    this.content.scrollToBottom(600);
  }
}
