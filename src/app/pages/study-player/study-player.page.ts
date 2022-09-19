import { Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TenantSettingsModel } from '@app/shared/models/tenant/tenant-settings';
import { DiagnosticRouteComponent } from '@components/diagnostic-route/diagnostic-route.component';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Events, IonContent, ModalController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { pullDownAnimation } from '@shared/animations/pull-down';
import { pullUpAnimation } from '@shared/animations/pull-up';
import { ProficiencyDirectionComponent } from '@shared/components/class/proficiency-direction/proficiency-direction.component';
import { EVENTS } from '@shared/constants/events-constants';
import { ATTEMPTED_STATUS, CONTENT_STATUS, CONTENT_TYPES, DIAGNOSTIC_STATE, PATH_TYPES, PLAYER_EVENT_SOURCE, QUESTION_TYPES, SIGNATURE_CONTENTS } from '@shared/constants/helper-constants';
import { routerPathIdReplace } from '@shared/constants/router-constants';
import { ClassModel } from '@shared/models/class/class';
import { CollectionContextModel, CollectionsModel, ContentModel } from '@shared/models/collection/collection';
import { LessonModel } from '@shared/models/lesson/lesson';
import { ResourceLocation } from '@shared/models/location/location';
import { DiagnosticContentModel, NextCollectionModel, NextContextModel, ResourcesModel } from '@shared/models/navigate/navigate';
import { StudyPlayerContextModel } from '@shared/models/player/player';
import { PortfolioPerformanceSummaryModel } from '@shared/models/portfolio/portfolio';
import { CollectionProvider } from '@shared/providers/apis/collection/collection';
import { CompetencyProvider } from '@shared/providers/apis/competency/competency';
import { LocationProvider } from '@shared/providers/apis/location/location';
import { NavigateProvider } from '@shared/providers/apis/navigate/navigate';
import { PerformanceProvider } from '@shared/providers/apis/performance/performance';
import { SearchProvider } from '@shared/providers/apis/search/search';
import { ClassService } from '@shared/providers/service/class/class.service';
import { CompetencyService } from '@shared/providers/service/competency/competency.service';
import { FeedbackService } from '@shared/providers/service/feedback/feedback.service';
import { LoadingService } from '@shared/providers/service/loader.service';
import { LookupService } from '@shared/providers/service/lookup/lookup.service';
import { MilestoneService } from '@shared/providers/service/milestone/milestone.service';
import { ParseService } from '@shared/providers/service/parse/parse.service';
import { CollectionPlayerService } from '@shared/providers/service/player/collection-player.service';
import { SessionService } from '@shared/providers/service/session/session.service';
import { getLessonByMilestoneId } from '@shared/stores/reducers/milestone.reducer';
import { calculatePercentage, cloneObject } from '@shared/utils/global';
import axios from 'axios';
import * as moment from 'moment';
import { interval } from 'rxjs';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Component({
  selector: 'study-player',
  templateUrl: './study-player.page.html',
  styleUrls: ['./study-player.page.scss'],
})
export class StudyPlayerPage implements  OnInit, OnDestroy {

  // -------------------------------------------------------------------------
  // Properties
  public collection: CollectionsModel;
  public context: StudyPlayerContextModel;
  public nextCollection: CollectionsModel;
  public nextContext: NextContextModel;
  public isSignatureAssessment: boolean;
  public showMasteryCard: boolean;
  public masteredCompetencies: Array<string>;
  public classDetails: ClassModel;
  public currentResourceLocation: ResourceLocation;
  public lastPlayedContentPerformance: PortfolioPerformanceSummaryModel;
  public competencyCompletionPercentage: number;
  public isSignatureCollection: boolean;
  public isOfflineActivity: boolean;
  public toMilestone: boolean;
  public relatedContents: Array<ContentModel>;
  public showConfetti: boolean;
  public startTime: number;
  public milestonesRoutes: any;
  public strugglesContext: Array<ResourcesModel>;
  public milestoneLessonSubScription: AnonymousSubscription;
  public isDiagnosticActive: boolean;
  public isDiagnosticEnd: boolean;
  public diagnosticDetails: DiagnosticContentModel;
  public checkRouterTimerSubscription: AnonymousSubscription;
  public isCheckRouteFailed: boolean;
  public isCheckRouterPathTimerStarts: boolean;
  public checkRouterLoopingCount: number;

  @ViewChild(IonContent, { static: false }) public content: IonContent;
  public tenantSettings: TenantSettingsModel;

  public get showCorrectAnswer() {
    return this.classDetails && this.classDetails.setting && this.classDetails.setting['show.correct.answer'] && this.showConfetti;
  }

  /** Stop hardware back button */
  @HostListener('document:ionBackButton', ['$event'])
  public overrideHardwareBackAction(event) {
    this.navigateToMilestone();
  }

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private events: Events,
    private competencyService: CompetencyService,
    private milestoneService: MilestoneService,
    private router: Router,
    private lookupService: LookupService,
    private route: ActivatedRoute,
    private store: Store,
    private parseService: ParseService,
    private collectionProvider: CollectionProvider,
    private classService: ClassService,
    private collectionPlayerService: CollectionPlayerService,
    private navigateProvider: NavigateProvider,
    private sessionService: SessionService,
    private performanceProvider: PerformanceProvider,
    private feedbackService: FeedbackService,
    private competencyProvider: CompetencyProvider,
    private locationProvider: LocationProvider,
    private searchService: SearchProvider,
    private statusBar: StatusBar,
    private modalCtrl: ModalController,
    private loader: LoadingService
  ) {
    this.statusBar.styleLightContent();
    this.competencyCompletionPercentage = 0;
    this.route.queryParams.subscribe((params) => {
      const context = {
        classId: params.classId,
        source: params.source,
        collectionType: params.collectionType,
        courseId: params.courseId,
        unitId: params.unitId,
        lessonId: params.lessonId,
        collectionId: params.collectionId,
        pathId: params.pathId !== null ? Number(params.pathId) : 0,
        milestoneId: params.milestoneId,
        pathType: params.pathType || null,
        scoreInPercentage: params.scoreInPercentage,
        state: params.state,
        isPublicClass: params.isPublicClass === 'true',
        ctxPathId: params.ctxPathId !== null ? Number(params.ctxPathId) : 0,
        ctxPathType: params.ctxPathType || null
      };
      if (params.isDomainDiagnostic === 'true') {
        Object.assign(context, {
          diagnostic: {
            session_id: params.sessionId,
            starting_domain: params.startingDomain,
            starting_grade: Number(params.startingGrade)
          }
        });
      }
      this.toMilestone = params.toMilestone;
      this.context = context;
    });
  }

  // -------------------------------------------------------------------------
  // Events
  public ngOnInit() {
    this.fetchTenantSettings();
  }

  public ionViewWillEnter() {
    this.checkRouterLoopingCount = 0;
    this.strugglesContext = null;
    this.initialLoadData();
  }

  public ngOnDestroy() {
    this.lookupService.unSubscribeEvent();
    if (this.milestoneLessonSubScription) {
      this.milestoneLessonSubScription.unsubscribe();
    }
    if (this.checkRouterTimerSubscription) {
      this.checkRouterTimerSubscription.unsubscribe();
    }
  }

  /**
   * @function initialLoadData
   * This method is used to load initial data
   */
  public async initialLoadData() {
    axios.all([
      this.fetchLastLocation(this.context.collectionId, this.context),
      this.fetchCollection(),
      this.fetchFeedbackCategories()
    ]).then(axios.spread((location: ResourceLocation, nextContent: NextCollectionModel) => {
      this.collection = nextContent.content;
      this.nextContext = nextContent.context;
      this.isDiagnosticActive = nextContent.context.current_item_subtype === PLAYER_EVENT_SOURCE.DIAGNOSTIC;
      this.isDiagnosticEnd = nextContent.context.state === DIAGNOSTIC_STATE.DIAGNOSTIC_END;
      this.collection.collectionType = nextContent.context.current_item_type;
      this.currentResourceLocation = location;
      const lastPlayedSessionId = this.getLastPlayedSessionId(location);
      if (lastPlayedSessionId) {
        this.getLastPlayedSessionPerformance(lastPlayedSessionId);
      }
      this.collectionPlayerService.onCollectionPlay(this.collection, this.context, lastPlayedSessionId);
      this.fetchRelatedContents(this.nextContext.current_item_id);
    }));
    this.classDetails = await this.fetchClassById();
    const subjectCode = this.classDetails.preference ? this.classDetails.preference.subject : null;
    this.milestonesRoutes = await this.milestoneService.fetchMilestoneRoutes(this.context.classId, false, subjectCode);
    this.findCompetencyCompletionStats();
  }

  /**
   * @function fetchClassById
   * This method is used fetch class by id
   */
  private async fetchClassById() {
    return this.classService.fetchClassById(this.context.classId);
  }

  /**
   * @function getLastPlayedSessionPerformance
   * This method is used get the last played session performance
   */
  private getLastPlayedSessionPerformance(lastPlayedSessionId) {
    this.performanceProvider.fetchActivitySummary(this.collection.format, this.context.collectionId,
      lastPlayedSessionId, this.context.source).then((activityPerformance) => {
        this.lastPlayedContentPerformance = activityPerformance;
      });
  }

  /**
   * @function getLastPlayedSessionId
   * This method is used get the last played session id
   */
  private getLastPlayedSessionId(location) {
    return location && location.collectionStatus !== ATTEMPTED_STATUS.COMPLETE ? location.sessionId : null;
  }

  /**
   * @function findCompetencyCompletionStats
   * This method is used to fetch competency completion
   */
  public findCompetencyCompletionStats() {
    const subjectCode = this.classDetails.preference ? this.classDetails.preference.subject : null;
    if (subjectCode) {
      const params = [{ classId: this.context.classId, subjectCode }];
      this.competencyProvider.fetchCompetencyCompletionStats(params).then((stats) => {
        if (stats && stats.length) {
          const performance = stats[0];
          if (performance.completedCompetencies === performance.totalCompetencies) {
            this.competencyCompletionPercentage = performance.completionPercentage;
          } else {
            this.competencyService.computeCompetencyCount(performance.completedCompetencies).then((competencyCount) => {
              const completedCompetencies = (performance.completedCompetencies - competencyCount);
              const numberOfCompetencies = (performance.totalCompetencies - competencyCount);
              this.competencyCompletionPercentage = calculatePercentage(completedCompetencies, numberOfCompetencies);
            });
          }
        }
      });
    }
  }

  /**
   * @function fetchRelatedContents
   * This method is used to fetch realted contents
   */
  private fetchRelatedContents(collectionId) {
    if (this.collection.collectionType === CONTENT_TYPES.COLLECTION || this.collection.collectionType === CONTENT_TYPES.EXTERNAL_COLLECTION) {
      this.searchService.fetchRelatedContents(collectionId).then((relatedContents) => {
        this.relatedContents = relatedContents;
      });
    }
  }

  /**
   * @function fetchLastLocation
   * This method is used to fetch the last location in the collection
   */
  public fetchLastLocation(collectionId, context) {
    if (!collectionId) {
      return null;
    }
    return this.locationProvider.getCurrentResourceLocation(collectionId, context);
  }

  /**
   * @function onBack
   * This method will trigger when user clicks on back
   */
  public onBack() {
    this.navigateToMilestone();
  }

  /**
   * @function gotoMilestone
   * This method is used to redirect to milestone page
   */
  public navigateToMilestone() {
    this.hideConfetti();
    const classPageURL = routerPathIdReplace('home', this.context.classId);
    if (this.context.isPublicClass) {
      this.router.navigate([classPageURL], { queryParams: { isPublic: true } });
    } else {
      this.router.navigate([classPageURL]);
    }
  }

  /**
   * @function fetchCollection
   * This method is used to fetch the collection based on context
   */
  public fetchCollection() {
    const context = this.navigateProvider.getCurrentCollectionContext(this.context);
    return this.navigateProvider.fetchNextCollection(context).then((nextContent) => {
      this.checkIsSignatureCollection(nextContent.context);
      this.checkIsOfflineActivity(nextContent.context);
      return nextContent;
    });
  }

  /**
   * @function fetchFeedbackCategories
   * This method is used to fetch feedback categories
   */
  public fetchFeedbackCategories() {
    return this.feedbackService.fetchFeedbackCategory();
  }

  /**
   * @function onFinishCollection
   * This method will trigger when collection on finish
   */
  public onFinishCollection(lastPlayedContent?: CollectionContextModel) {
    if (this.isDiagnosticActive) {
      this.finishDiagnosticContent(lastPlayedContent);
    } else {
      this.finishCollectionContent(lastPlayedContent);
    }
  }

  /**
   * @function finishDiagnosticContent
   * This method is used to finish diagnostic content
   */
  public finishDiagnosticContent(lastPlayedContent) {
    this.fetchNextCollection(this.nextContext).then(() => {
      if (this.isDiagnosticEnd) {
        this.loader.displayLoader();
        this.checkRouterPath();
      } else {
        this.onPlayNext();
      }
    });
  }

  /**
   * @function checkRouterPath
   * This method is used to check router path
   */
  public checkRouterPath() {
    const params = {
      sessionId: this.diagnosticDetails.session_id
    };
    this.navigateProvider.generateStudentRoute(params).then((result) => {
      if (result.status === CONTENT_STATUS.COMPLETE) {
        this.isCheckRouteFailed = false;
        this.loader.dismissLoader();
        this.clearSubscription();
      } else if (result.status === CONTENT_STATUS.FAILED) {
        this.isCheckRouteFailed = true;
        this.clearSubscription();
      } else {
        if (!this.isCheckRouterPathTimerStarts) {
          this.subscribeToCheckRouterPath();
        }
      }
    });
  }

  /**
   * @function clearSubscription
   * This method is used to clear subscription
   */
  public clearSubscription() {
    this.showDiagnosticRouteStatus();
    if (this.checkRouterTimerSubscription) {
      this.checkRouterTimerSubscription.unsubscribe();
    }
  }

  /**
   * @function subscribeToCheckRouterPath
   * This method is used to call api for every 3mins
   * (3 * 60 * 1000) => mins into ms conversion
   */
  private subscribeToCheckRouterPath() {
    this.isCheckRouterPathTimerStarts = true;
    const intervalTime = 5 * 1000;
    this.checkRouterTimerSubscription = interval(intervalTime).subscribe(() => {
      this.checkRouterLoopingCount = this.checkRouterLoopingCount + 1;
      if (this.checkRouterLoopingCount >= 3) {
        this.isCheckRouteFailed = true;
        this.loader.dismissLoader();
        this.clearSubscription();
      } else {
        this.checkRouterPath();
      }
    });
  }

  /**
   * @function finishCollectionContent
   * This method is used to finish collection(normal) content
   */
  public async finishCollectionContent(lastPlayedContent) {
    const context = this.nextContext;
    const performance = lastPlayedContent ? lastPlayedContent.performance : null;
    if (this.collection.collectionType === CONTENT_TYPES.ASSESSMENT) {
      const answersPayLoad = lastPlayedContent ? lastPlayedContent.answersPayLoad : null;
      this.strugglesContext = this.collectionPlayerService.getResourceStrugglesContext(this.collection, answersPayLoad);
    }
    context.resources = this.strugglesContext ? this.strugglesContext : [];
    if (performance && performance.assessment) {
      const score = performance.assessment.score;
      context.score_percent = Math.round(score);
    } else {
      context.score_percent = null;
    }
    if (context.score_percent) {
      this.showMasteryCard = await this.isAssessmentMastered(context.score_percent);
      this.showConfetti = await this.isStudentAchievedMinScore(context.score_percent);
      if (!this.isSignatureAssessment) {
        this.competencyCompletionPercentage = 0;
        this.findCompetencyCompletionStats();
      }
    } else {
      this.showMasteryCard = false;
    }
    this.fetchLastLocation(context.collection_id, context).then((location) => {
      this.currentResourceLocation = location;
      const lastPlayedSessionId = this.getLastPlayedSessionId(location);
      if (lastPlayedSessionId) {
        this.getLastPlayedSessionPerformance(lastPlayedSessionId);
      }
      this.fetchNextCollection(context);
      this.events.publish(this.collectionPlayerService.PLAYED_COLLECTION);
      if (this.collection.collectionType === CONTENT_TYPES.COLLECTION) {
        const relatedContentElement = this.content['el'].querySelector('#related-content-container');
        if (relatedContentElement) {
          this.scrollToSummaryReport(relatedContentElement);
        } else {
          const collectionReportElement = this.content['el'].querySelector('#report-container');
          this.scrollToSummaryReport(collectionReportElement);
        }
      } else {
        const reportElement = this.content['el'].querySelector('#report-container');
        this.scrollToSummaryReport(reportElement);
      }
    });
  }

  /**
   * @function scrollToSummaryReport
   * This method is used to scroll to the summary report
   */
  private scrollToSummaryReport(reportElement) {
    if (reportElement) {
      const reportElementPosition = reportElement['offsetTop'];
      this.scrollToContentView(reportElementPosition);
    }
  }

  /**
   * @function onPlayNext
   * This method will trigger when user clicks play on next collection
   */
  public onPlayNext() {
    this.content.scrollToTop(100);
    this.collection = this.nextCollection;
    this.nextCollection = null;
    this.checkIsSignatureCollection(this.nextContext);
    this.checkIsSignatureAssessment(this.nextContext);
    this.checkIsOfflineActivity(this.nextContext);
    this.fetchRelatedContents(this.nextContext.current_item_id);
    this.collectionPlayerService.onCollectionPlay(this.collection, this.context);
  }

  /**
   * @function checkIsSignatureAssessment
   * This method used to find signature collection or not
   */
  public checkIsSignatureAssessment(context) {
    this.isSignatureAssessment = context.current_item_subtype === SIGNATURE_CONTENTS.SIGNATURE_ASSESMENT;
  }

  /**
   * @function onClickProgressBar
   * This method triggers when user click the progress bar
   */
  public onClickProgressBar() {
    if (this.milestonesRoutes && this.milestonesRoutes.milestone_route_path_coordinates) {
      this.navigateToJourney();
    } else {
      this.navigateToMilestone();
    }
  }

  /**
   * @function navigateToJourney
   * This method is used to navigate to journey
   */
  public navigateToJourney() {
    const journeyURL = routerPathIdReplace('journey', this.context.classId);
    this.router.navigate([journeyURL]);
  }

  /**
   * @function fetchNextCollection
   * This method fetch next collection based on next context
   */
  public fetchNextCollection(context) {
    return this.navigateProvider.fetchNextCollection(context).then((nextContent) => {
      const nextCollection = nextContent.content;
      this.isDiagnosticActive = nextContent.context.current_item_subtype === PLAYER_EVENT_SOURCE.DIAGNOSTIC;
      this.isDiagnosticEnd = nextContent.context.state === DIAGNOSTIC_STATE.DIAGNOSTIC_END;
      if (nextCollection) {
        const collectionType = nextContent.context.current_item_type;
        nextCollection.collectionType = collectionType;
        this.context.collectionType = collectionType;
        this.nextCollection = nextCollection;
        if (this.collection.lessonId !== nextCollection.lessonId) {
          const milestoneId = nextContent.context.milestone_id;
          this.getLessonByMilestoneId(milestoneId).then((lesson: LessonModel) => {
            this.nextCollection.isNextLesson = true;
            this.nextCollection.lesson = lesson;
          });
        }
      } else {
        const suggestedContent = nextContent.suggestions.length ? nextContent.suggestions[0] : null;
        if (suggestedContent) {
          this.collectionProvider.fetchCollectionById(suggestedContent.id, suggestedContent.format)
            .then((suggestionCollection) => {
              const collectionType = suggestedContent.format;
              this.nextCollection = suggestionCollection;
              this.nextCollection.collectionType = collectionType;
              this.context.collectionType = collectionType;
              this.nextCollection.suggestionType = suggestedContent.suggestedContentSubType;
              this.nextCollection.isSuggested = true;
            });
        }
      }
      this.context.collectionId = nextContent.context.collection_id;
      this.context.pathId = nextContent.context.path_id;
      this.context.pathType = nextContent.context.path_type;
      this.context.ctxPathId = nextContent.context.ctx_path_id;
      this.context.ctxPathType = nextContent.context.ctx_path_type;
      this.context.lessonId = nextContent.context.lesson_id;
      this.context.unitId = nextContent.context.unit_id;
      this.context.courseId = nextContent.context.course_id;
      this.nextContext = nextContent.context;
      this.diagnosticDetails = nextContent.context.diagnostic;
      return;
    });
  }

  /**
   * @function getLessonByMilestoneId
   * This method is used to get the lessons
   */
  private getLessonByMilestoneId(milestoneId) {
    return new Promise((resolve, reject) => {
      this.milestoneLessonSubScription = this.store.select(getLessonByMilestoneId(milestoneId))
        .subscribe((milestoneData) => {
          const isRoute0 = this.context.ctxPathType === PATH_TYPES.ROUTE;
          if (milestoneData) {
            let lesson = milestoneData.find((milestone) => {
              return milestone.lessonId === this.nextCollection.lessonId;
            });
            if (isRoute0) {
              lesson = milestoneData.find((lessonItem) => {
                return lessonItem.unitId === this.nextCollection.unitId && lessonItem.lessonId === this.nextCollection.lessonId;
              });
            }
            resolve(cloneObject(lesson));
          } else {
            resolve(null);
          }
        });
    });
  }

  /**
   * @function acceptSuggestion
   * This method is used to accept the suggestion
   */
  public acceptSuggestion() {
    this.onAcceptReRoute();
  }

  /**
   * @function declineSuggestion
   * This method is used to decline the suggestion
   */
  public declineSuggestion() {
    const params = this.getIgnoreRerouteContext();
    this.trackRerouteSuggestionEvent(EVENTS.IGNORE_REROUTE_SUGGESTION, params);
    this.onDeclineReRoute();
  }

  /**
   * @function getIgnoreRerouteContext
   * This method is used to get the context for ignore reroute suggestion event
   */
  private getIgnoreRerouteContext() {
    return {
      classId: this.context.classId,
      collectionId: this.context.collectionId,
      collectionTitle: this.collection.title,
      courseId: this.context.courseId,
      unitId: this.context.unitId,
      lessonId: this.context.lessonId,
      collectionType: this.context.collectionType,
      source: this.context.source,
      score: this.context.scoreInPercentage,
      milestoneId: this.context.milestoneId,
      taxonomy: this.collection.taxonomy ? JSON.stringify(this.collection.taxonomy) : null,
    };
  }

  /**
   * @function getAccpectRerouteContext
   * This method is used to get the context for accept reroute suggestion event
   */
  private getAccpectRerouteContext() {
    const pathId = this.nextContext.path_id;
    return {
      classId: this.context.classId,
      collectionId: this.context.collectionId,
      collectionTitle: this.collection.title,
      courseId: this.context.courseId,
      unitId: this.context.unitId,
      lessonId: this.context.lessonId,
      collectionType: this.context.collectionType,
      source: this.context.source,
      score: this.context.scoreInPercentage,
      milestoneId: this.context.milestoneId,
      pathId,
      pathType: PATH_TYPES.SYSTEM,
      taxonomy: this.collection.taxonomy ? JSON.stringify(this.collection.taxonomy) : null,
    };
  }

  /**
   * @function onAcceptReRoute
   * This method will trigger when user accepts the suggestion
   */
  public onAcceptReRoute() {
    const userId = this.sessionService.userSession.user_id;
    const context = {
      ctx_class_id: this.context.classId,
      ctx_collection_id: this.context.collectionId,
      ctx_course_id: this.context.courseId,
      ctx_lesson_id: this.context.lessonId,
      ctx_unit_id: this.context.unitId,
      ctx_user_id: userId,
      ctx_path_id: this.context.ctxPathId,
      ctx_path_type: this.context.ctxPathType,
      suggested_content_id: this.nextCollection.id,
      suggested_content_subtype: this.nextCollection.suggestionType,
      suggested_content_type: this.nextCollection.collectionType
    };
    this.navigateProvider.fetchSystemSuggestionPathId(context)
      .then((pathId) => {
        const isRoute0 = this.context.ctxPathType === PATH_TYPES.ROUTE;
        this.nextContext.state = 'start';
        this.nextContext.path_id = pathId;
        this.nextContext.path_type = this.context.pathType === PATH_TYPES.TEACHER ? PATH_TYPES.TEACHER : PATH_TYPES.SYSTEM;
        this.nextContext.ctx_path_id = isRoute0 ? this.context.ctxPathId : 0;
        this.nextContext.ctx_path_type = isRoute0 ? this.context.ctxPathType : null;
        this.nextContext.current_item_subtype = this.nextCollection.suggestionType;
        this.nextContext.current_item_type = this.nextCollection.suggestionType === SIGNATURE_CONTENTS.SIGNATURE_COLLECTION ? CONTENT_TYPES.COLLECTION : CONTENT_TYPES.ASSESSMENT;
        this.nextCollection.isSuggested = false;
        const params = this.getAccpectRerouteContext();
        this.trackRerouteSuggestionEvent(EVENTS.ACCEPT_REROUTE_SUGGESTION, params);
        this.fetchNextCollection(this.nextContext).then(() => {
          this.onPlayNext();
        });
      });
  }

  /**
   * @function trackRerouteSuggestion
   * This method used to track the reroute suggestion event
   */
  public trackRerouteSuggestionEvent(eventName, context) {
    this.parseService.trackEvent(eventName, context);
  }

  /**
   * @function checkIsSignatureCollection
   * This method used to find signature collection or not
   */
  public checkIsSignatureCollection(context) {
    this.isSignatureCollection = context.current_item_subtype === SIGNATURE_CONTENTS.SIGNATURE_COLLECTION;
  }

  /**
   * @function checkIsOfflineActivity
   * This method used to find out offline activity or not
   */
  public checkIsOfflineActivity(context) {
    this.isOfflineActivity = context.current_item_type === CONTENT_TYPES.OFFLINE_ACTIVITY;
  }

  /**
   * @function isAssessmentMastered
   * This method used to find assessment is mastered or not
   */
  public isAssessmentMastered(score) {
    const isPremiumCourse = this.classDetails.isPremiumClass;
    return this.isStudentAchievedMinScore(score).then((isAchieved) => {
      const isAssessmentHasFRQ = this.isAssessmentHasFRQ();
      const isTeaherSuggestion = this.nextContext.path_type === PATH_TYPES.TEACHER;
      return (this.nextContext.current_item_type === CONTENT_TYPES.ASSESSMENT &&
        this.collection.taxonomy &&
        this.collection.gutCodes &&
        isPremiumCourse &&
        !isAssessmentHasFRQ &&
        !isTeaherSuggestion &&
        isAchieved
      );
    });
  }

  /**
   * @function isStudentAchievedMinScore
   * This method used to find out is student achieved min score
   */
  public isStudentAchievedMinScore(score) {
    return this.getTenantMinScore().then((minScore: number) => {
      return score >= minScore;
    });
  }

  /**
   * @function getTenantMinScore
   * This method used to fetch mastery completion score
   */
  private getTenantMinScore() {
    return this.lookupService.getMasteryCompletionScore(this.classDetails, this.collection);
  }

  /**
   * @function isAssessmentHasFRQ
   * This method used to find assessment has free response question or not
   */
  public isAssessmentHasFRQ() {
    const hasFRQ = this.collection.content.find((question) => {
      const questionType = QUESTION_TYPES[question.contentSubformat];
      return questionType === QUESTION_TYPES.open_ended_question;
    });
    return hasFRQ ? true : false;
  }

  /**
   * @function onShowMasteredCompetency
   * This method trigger when user clicks on to show chart
   */
  public async onShowMasteredCompetency() {
    const masteredCompetencies = this.collection.gutCodes;
    this.startTime = moment().valueOf();
    const props = {
      classInfo: this.classDetails,
      showDirections: false,
      masteredCompetencies,
      context: this.context
    };
    const modal = await this.modalCtrl.create({
      component: ProficiencyDirectionComponent,
      enterAnimation: pullUpAnimation,
      leaveAnimation: pullDownAnimation,
      componentProps: props,
    });
    await modal.present();
    return new Promise((resolve, reject) => {
      modal.onDidDismiss().then(() => {
        this.trackCompetencyGainEvent();
      });
    });
    this.animateNextLessonContainer();
  }

  /**
   * @function trackCompetencyGainEvent
   * This method used to track competency gain event
   */
  public trackCompetencyGainEvent() {
    const context = this.getCompetencyGainedContext();
    this.parseService.trackEvent(EVENTS.VIEW_COMPETENCY_GAIN_CHART, context);
  }

  /**
   * @function getCompetencyGainedContext
   * This method is used to get the context for competency gained chart event
   */
  private getCompetencyGainedContext() {
    const endTime = moment().valueOf();
    return {
      classId: this.classDetails.id,
      classTitle: this.classDetails.title,
      collectionId: this.context.collectionId,
      courseId: this.context.courseId,
      courseName: this.classDetails.course_title,
      unitId: this.context.unitId,
      lessonId: this.context.lessonId,
      collectionType: this.context.collectionType,
      score: this.context.scoreInPercentage,
      contentSource: this.context.source,
      startTime: this.startTime,
      endTime
    };
  }

  /**
   * @function onCancelToShowMasteredCompetency
   * This method will trigger when user cancel to show mastered competency
   */
  public onCancelToShowMasteredCompetency() {
    this.showMasteryCard = false;
    this.animateNextLessonContainer();
  }

  /**
   * @function animateNextLessonContainer
   * This method is used to animate to next lesson container
   */
  private animateNextLessonContainer() {
    const nextLessonElement = this.content['el'].querySelector('#next-lesson');
    if (nextLessonElement) {
      const nextLessonElementPosition = nextLessonElement['offsetTop'];
      this.content.scrollToPoint(0, nextLessonElementPosition, 1000);
    }
  }

  /**
   * @function onDeclineReRoute
   * This method will trigger when user rejects the suggestion
   */
  public onDeclineReRoute() {
    this.onFinishCollection();
  }

  /**
   * @function onOpenRelatedContent
   * This method is trigger when user clicks on related content
   */
  public onOpenRelatedContent(scrollPosition) {
    this.scrollToContentView(scrollPosition);
  }

  /**
   * @function scrollToNextContent
   * This method is used to scroll into next element
   */
  public scrollToContentView(scrollPosition) {
    this.content.scrollToPoint(0, scrollPosition, 1000);
  }

  /**
   * @function hideConfetti
   * This method is used to hide confetti
   */
  public hideConfetti() {
    this.showConfetti = false;
  }

  /**
   * @function showDiagnosticRouteStatus
   * This method is used to show diagnostic route status
   */
  public async showDiagnosticRouteStatus() {
    const classPerference = this.classDetails.preference;
    const fwCode = classPerference && classPerference.framework
      ? classPerference.framework
      : null;
    const subjectCode = this.classDetails.preference ? this.classDetails.preference.subject : null;
    const modal = await this.modalCtrl.create({
      component: DiagnosticRouteComponent,
      enterAnimation: pullUpAnimation,
      leaveAnimation: pullDownAnimation,
      cssClass: 'diagnostic-route-modal',
      componentProps: {
        title: this.collection.title,
        courseId: this.context.courseId,
        classId: this.context.classId,
        isRouteCheckFailed: this.isCheckRouteFailed,
        fwCode,
        subjectCode
      },
    });
    await modal.present();
    return new Promise((resolve, reject) => {
      modal.onDidDismiss().then(() => {
        this.navigateToMilestone();
      });
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
