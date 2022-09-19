import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { TenantSettingsModel } from '@app/shared/models/tenant/tenant-settings';
import { ClassService } from '@app/shared/providers/service/class/class.service';
import { environment } from '@environment/environment';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { COLLECTION_TYPES } from '@shared/components/player/collections.import';
import { QUESTION_TYPES } from '@shared/components/player/questions/questions.import';
import { UpcomingQuestionComponent } from '@shared/components/player/questions/serp/upcoming-question/upcoming-question.component';
import { RESOURCE_TYPES } from '@shared/components/player/resources/resources.import';
import { EVENTS } from '@shared/constants/events-constants';
import {
  ASSESSMENT,
  ATTEMPTED_STATUS,
  COLLECTION,
  COLLECTION_SUB_FORMAT_TYPES,
  FEEDBACK_CONTENT_TYPES,
  PLAYER_EVENT_SOURCE,
  SUPPORTED_SERP_QUESTION_TYPES
} from '@shared/constants/helper-constants';
import {
  AnswerModel,
  CollectionContextModel,
  CollectionsModel,
  ContentModel,
  SelectedAnswersModel
} from '@shared/models/collection/collection';
import { CategoryModel } from '@shared/models/feedback/feedback';
import { LearningToolsModel } from '@shared/models/learning-tools/learning-tools';
import { ResourceLocation } from '@shared/models/location/location';
import { PlayerContextModel } from '@shared/models/player/player';
import {
  PortfolioPerformanceSummaryModel,
  SubContentModel,
} from '@shared/models/portfolio/portfolio';
import { PerformanceProvider } from '@shared/providers/apis/performance/performance';
import { FeedbackService } from '@shared/providers/service/feedback/feedback.service';
import { LearningToolsService } from '@shared/providers/service/learning-tools/learning-tools.service';
import { LoadingService } from '@shared/providers/service/loader.service';
import { ParseService } from '@shared/providers/service/parse/parse.service';
import { CollectionPlayerService } from '@shared/providers/service/player/collection-player.service';
import { PlayerService } from '@shared/providers/service/player/player.service';
import { ReportService } from '@shared/providers/service/report/report.service';
import { SessionService } from '@shared/providers/service/session/session.service';
import { UtilsService } from '@shared/providers/service/utils/utils.service';
import { cloneObject, generateUUID, getQueryParamsByString } from '@shared/utils/global';
import {
  bounceInUpAnimation,
  collapseAnimation,
} from 'angular-animations';
import CryptoJS from 'crypto-js';

@Component({
  selector: 'collection-content',
  templateUrl: './collection-content.component.html',
  styleUrls: ['./collection-content.component.scss'],
  animations: [
    collapseAnimation({ duration: 300, delay: 0 }),
    bounceInUpAnimation({ duration: 1000, delay: 0 }),
  ],
})
export class CollectionContentComponent implements OnInit, OnChanges {
  // -------------------------------------------------------------------------
  // Properties
  @ViewChild('content_view', { read: ViewContainerRef, static: true })
  private contentViewRef: ViewContainerRef;
  @ViewChild('finishBtn', { read: ElementRef, static: false })
  private finishBtn: ElementRef;
  @ViewChild('lessonBoundary', { read: ElementRef, static: false })
  private lessonBoundaryElement: ElementRef;
  @ViewChild('nextCollectionContainer', { read: ElementRef, static: false })
  private nextCollectionElement: ElementRef;
  @Input() public collection: CollectionsModel;
  @Input() public nextCollection: CollectionsModel;
  @Input() public context: PlayerContextModel;
  @Input() public currentResourceLocation: ResourceLocation;
  @Input() public showMasteryCard: boolean;
  @Input() public isSignatureAssessment: boolean;
  @Input() public isSignatureCollection: boolean;
  @Input() public relatedContents: Array<ContentModel>;
  @Input() public classId: string;
  @Input() public lastPlayedContentPerformance: PortfolioPerformanceSummaryModel;
  @Input() public showConfetti: boolean;
  @Input() public showCorrectAnswer: boolean;
  @Input() public isDiagnosticActive: boolean;
  @Output() public finishCollection: EventEmitter<CollectionContextModel> = new EventEmitter();
  @Output() public playNext = new EventEmitter();
  @Output() public showMasteredCompetency = new EventEmitter();
  @Output() public cancelToShowMasteredCompetency = new EventEmitter();
  @Output() public declineSuggestion = new EventEmitter();
  @Output() public acceptSuggestion = new EventEmitter();
  @Output() public scrollToContentView = new EventEmitter();
  @Output() public openRelatedContent = new EventEmitter();
  @Output() public hideConfettiEvent = new EventEmitter();
  @Input() public tenantSettings: TenantSettingsModel;
  public showSummaryReport: boolean;
  public startPlay: boolean;
  public activityPerformance: PortfolioPerformanceSummaryModel;
  public isBidirectionalPlay: boolean;
  public isLastResourcePlayed: boolean;
  public componentRefList: Array<ComponentRef<any>>;
  public answeredQuestions: Array<string>;
  public feedbackCategory: Array<CategoryModel>;
  public currentContext: PlayerContextModel;
  public showRerouteSuggestion: boolean;
  private currentResourceIndex: number;
  public sessionId: string;
  public isToggleLessonBoundary: boolean;
  public isSubmit: boolean;
  public showAdditionalInfo: boolean;
  public answersPayLoad: Array<SelectedAnswersModel>;
  public isShowEvidence: boolean;
  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private performanceProvider: PerformanceProvider,
    private componentFactoryResolver: ComponentFactoryResolver,
    private collectionPlayerService: CollectionPlayerService,
    private feedbackService: FeedbackService,
    private loaderService: LoadingService,
    private reportService: ReportService,
    private parseService: ParseService,
    private sessionService: SessionService,
    private utilsService: UtilsService,
    private learningToolsService: LearningToolsService,
    private inAppBrowser: InAppBrowser,
    private spinnerDialog: SpinnerDialog,
    private zone: NgZone,
    private classService: ClassService,
    private playerService: PlayerService,
  ) {
    this.componentRefList = [];
    this.answeredQuestions = [];
    this.showSummaryReport = false;
    this.startPlay = false;
    this.currentResourceIndex = 0;
    this.showRerouteSuggestion = false;
    this.isToggleLessonBoundary = false;
    this.showAdditionalInfo = true;
  }

  // -------------------------------------------------------------------------
  // Events
  public ngOnInit() {
    this.onInitialize();
    const contentType = FEEDBACK_CONTENT_TYPES[this.collection.collectionType];
    const feedbackCategories = this.feedbackService.feedbackCategories;
    this.feedbackCategory = feedbackCategories[contentType];
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.collection && !changes.collection.firstChange) {
      this.showSummaryReport = false;
      this.startPlay = true;
      this.isSubmit = false;
      this.clearComponentRef();
      this.onInitialize();
    }
    if (
      changes.lastPlayedContentPerformance &&
      changes.lastPlayedContentPerformance.currentValue
    ) {
      this.setLastPlayedPerformance();
      this.isSubmit = false;
    }
    if (changes.nextCollection && changes.nextCollection.currentValue) {
      if (this.nextCollection.isSuggested) {
        this.showRerouteSuggestion = true;
      } else {
        this.showRerouteSuggestion = false;
      }
    }
  }

  /**
   * @function toggleInfo
   * This method is used to toggle info
   */
  public toggleInfo() {
    this.showAdditionalInfo = !this.showAdditionalInfo;
  }

  /**
   * @function trackRelatedContentPlayEvent
   * This method is used to track the resource content play event
   */
  public trackRelatedContentPlayEvent(resource) {
    const context = this.getPlayRelatedContext(resource);
    this.parseService.trackEvent(EVENTS.PLAY_RELATED_CONTENT, context);
  }

  /**
   * @function getPlayRelatedContext
   * This method is used to get the context for play related event
   */
  private getPlayRelatedContext(resource) {
    return {
      classId: this.classId,
      collectionId: this.collection.id,
      courseId: this.collection.courseId,
      unitId: this.collection.unitId,
      lessonId: this.collection.lessonId,
      collectionType: this.collection.collectionType,
      collectionTitle: this.collection.title,
      contentSource: this.currentContext.source,
      taxonomy: this.collection.taxonomy ? JSON.stringify(this.collection.taxonomy) : null,
      resourceId: resource ? resource.id : null,
      resouceType: resource ? resource.contentSubformat : null,
      resouceTitle: resource ? resource.title : null
    };
  }

  /**
   * @function onDeclineSuggestion
   * This method is used to decline the suggestion
   */
  public onDeclineSuggestion() {
    this.declineSuggestion.emit();
    this.hideConfetti();
    this.showRerouteSuggestion = false;
  }

  /**
   * @function onAcceptSuggestion
   * This method is used to accept the suggestion
   */
  public onAcceptSuggestion() {
    this.acceptSuggestion.emit();
    this.hideConfetti();
    this.showRerouteSuggestion = false;
  }

  /**
   * @function onInitialize
   * This method is used to render contents based on type
   */
  public onInitialize() {
    this.currentContext = { ...this.context };
    this.componentRefList = [];
    this.answersPayLoad = [];
    this.currentResourceIndex = this.getCurrentResourceLocationIndex();
    if (
      this.collection.collectionType === COLLECTION ||
      this.collection.collectionType === ASSESSMENT
    ) {
      this.renderCollectionContent();
    } else {
      this.renderExternalContent();
    }
  }

  /**
   * @function renderExternalContent
   * This method is used to render the external collections
   */
  public async renderExternalContent() {
    const componentType = COLLECTION_TYPES[this.collection.collectionType];
    const factory = this.componentFactoryResolver.resolveComponentFactory(
      componentType
    );
    const componentRef = this.contentViewRef.createComponent(factory);
    const learningToolId = this.collection.learningToolId;
    const instance = componentRef.instance as {
      collection: CollectionsModel;
      context: PlayerContextModel;
      onConfirmAnswer: EventEmitter<string>;
      disableConfirmBtn: boolean;
      isLuContent: boolean;
      learningTools: LearningToolsModel;
      eventId: string;
      onLUContentStart: EventEmitter<string>;
    };
    instance.context = this.currentContext;
    instance.collection = this.collection;
    instance.onConfirmAnswer.subscribe((sessionId) => {
      instance.disableConfirmBtn = true;
      this.fetchPerformanceSummary(sessionId);
    });
    instance.isLuContent = !!learningToolId;
    instance.learningTools = await this.getLearningToolInformation(learningToolId);
    instance.eventId = generateUUID();
    this.openLUContent(instance);
    this.componentRefList.push(componentRef);
  }

  /**
   * @function openLUContent
   * This method is open lu content in inappbrowser
   */
  public openLUContent(instance) {
    if (instance.isLuContent) {
      instance.onLUContentStart.subscribe((event) => {
        this.onStartExternalResourcePlayForLu(this.collection, instance.eventId);
        const target = '_blank';
        const options = this.collectionPlayerService.getInAppBrowserOptions();
        const url = this.collection.url;
        const browser = this.inAppBrowser.create(
          url,
          target,
          options
        );
        this.utilsService.lockOrientationInLandscape();
        browser.on('loadstart').subscribe(() => {
          this.spinnerDialog.show();
        });
        browser.on('loadstop').subscribe((loadEvent) => {
          this.spinnerDialog.hide();
          if (loadEvent.url != null) {
            const formURL = new URL(loadEvent.url);
            if (formURL.origin === environment.API_END_POINT) {
              const getQueryParams = getQueryParamsByString(loadEvent.url);
              const queryParams = getQueryParams.queryParams;
              this.collectionPlayerService.stopExternalResourcePlayEvent(queryParams);
              this.utilsService.lockOrientationInPortrait();
              browser.hide();
              this.zone.run(() => {
                instance.disableConfirmBtn = true;
                this.fetchPerformanceSummary(instance.eventId);
              });
            }
          }
        });
        browser.on('loaderror').subscribe(() => {
          this.spinnerDialog.hide();
        });
        browser.on('exit').subscribe(() => {
          this.utilsService.lockOrientationInPortrait();
        });
      });
    }
  }

  /**
   * @function getLearningToolInformation
   * This method is used to get learning tool information
   */
  public async getLearningToolInformation(learningToolId) {
    const learningTools = learningToolId && await this.learningToolsService.getLearningToolInformation(learningToolId) || null;
    if (learningTools) {
      this.LUContentURLGeneration(learningTools);
    }
    return learningTools;
  }

  /**
   * @function LUContentURLGeneration
   * This method is used to form LUContentURL
   */
  public LUContentURLGeneration(learningTools) {
    const content = this.collection;
    const userSession = this.sessionService.userSession;
    const collectionId = content.id;
    const collectionType = content.collectionType;
    const contentURL = content.url;
    const userId = userSession.user_id;
    const toolConfig = learningTools.toolConfig;
    const additionalParams = toolConfig.additional_query_params;
    const key = toolConfig.key;
    const username = additionalParams && additionalParams.username || 'goorupartner';
    const params = new URL(contentURL).searchParams;
    const lessonId = params['lesson_id'];
    const token = CryptoJS.SHA1(userId + lessonId + key);
    const host = new URL(environment.API_END_POINT).host;
    const callbackURL = `${host}/player-external-collection/${collectionId}/${collectionType}`;
    const addtionalParams = `&token=${token}&student_id=${userId}&username=${username}&subdomain=${callbackURL}&high_score=100`;
    const url = contentURL + addtionalParams;
    content.url = url;
  }

  /**
   * @function renderCollectionContent
   * This method is used to render the collection contents
   */
  public renderCollectionContent() {
    const contents = this.collection.content;
    this.isBidirectionalPlay = this.collection.settings
      ? this.collection.settings.bidirectionalPlay
      : true;
    contents.forEach((content, index) => {
      const contentFormatTypes =
        content.contentFormat === COLLECTION_SUB_FORMAT_TYPES.RESOURCE
          ? RESOURCE_TYPES
          : QUESTION_TYPES;
      const subformat = content.contentSubformat;
      let componentType = contentFormatTypes[subformat];
      if (componentType) {
        const regex = new RegExp('serp');
        if (regex.test(subformat)) {
          const isSupportedQuestion = SUPPORTED_SERP_QUESTION_TYPES.includes(subformat);
          if (!isSupportedQuestion) {
            componentType = UpcomingQuestionComponent;
          }
        }
      } else {
        componentType = UpcomingQuestionComponent;
      }
      this.renderCollection(componentType, content, index);
    });
    this.handleActivityInitialState(1);
  }

  /**
   * @function renderCollection
   * This method is used to render the collections
   */
  public renderCollection(componentType, content, index) {
    if (componentType) {
      const factory = this.componentFactoryResolver.resolveComponentFactory(
        componentType
      );
      const componentRef = this.contentViewRef.createComponent(factory);
      if (content.contentFormat === COLLECTION_SUB_FORMAT_TYPES.RESOURCE) {
        this.onResourceContent(componentRef, content, index);
      } else {
        this.onQuestionContent(componentRef, content, index);
      }
      this.componentRefList.push(componentRef);
    }
  }

  /**
   * @function handleActivityInitialState
   * This method is used to handle the activity initial state
   */
  public handleActivityInitialState(componentSeq) {
    if (this.collection.isAssessment) {
      this.setQuestionActiveState(componentSeq);
    } else {
      this.setResourceActiveState();
    }
  }

  /**
   * @function getCurrentResourceLocationIndex
   * This method is used to get the last resource played
   */
  public getCurrentResourceLocationIndex() {
    const location = this.currentResourceLocation;
    if (
      location &&
      location.collectionStatus === ATTEMPTED_STATUS.IN_PROGRESS
    ) {
      const currentResourceIndex = this.collection.content.findIndex(
        (item) => item.id === location.resourceId
      );
      if (currentResourceIndex > -1) {
        const currentElementIndex =
          location.resourceStatus === ATTEMPTED_STATUS.IN_PROGRESS &&
            currentResourceIndex <= this.collection.content.length - 1
            ? currentResourceIndex
            : currentResourceIndex + 1;
        return currentElementIndex;
      }
    }
    return 0;
  }

  /**
   * @function setLastPlayedPerformance
   * This method is used to set the last played performance
   */
  private setLastPlayedPerformance() {
    if (
      this.lastPlayedContentPerformance &&
      this.componentRefList &&
      this.componentRefList.length
    ) {
      const contentKey =
        this.collection.collectionType === ASSESSMENT
          ? 'questions'
          : 'resources';
      const performances = this.lastPlayedContentPerformance[contentKey];
      let isToggleToCurrentPlay = false;
      this.componentRefList.forEach((component) => {
        const performance = performances.find(
          (performanceItem) =>
            performanceItem.id === component.instance.content.id
        );
        if (performance) {
          const questionContent = component.instance.content;
          const answerObject = {
            questionId: questionContent.id,
            contentFormat: questionContent.contentFormat,
            alreadyPlayedQuestions: performance
          };
          this.answersPayLoad.push(answerObject);
          component.instance.performance = performance;
          component.instance.showLastPlayedAnswer = true;
          this.answeredQuestions.push(component.instance.content.id);
        } else {
          if (!isToggleToCurrentPlay) {
            component.instance.isCurrentPlay = true;
            isToggleToCurrentPlay = true;
            this.scrollToNextContent(component.instance);
            this.handleActivityInitialState(component.instance.componentSequence);
          }
        }
      });
      // when all the content has answered
      if (this.componentRefList.length === this.answeredQuestions.length) {
        this.isLastResourcePlayed = true;
      }
    }
  }

  /**
   * @function clearComponentRef
   * This method is used to clear all the component reference
   */
  public clearComponentRef() {
    if (this.componentRefList) {
      this.componentRefList.forEach((componentRef) => {
        componentRef.destroy();
      });
    }
  }

  /**
   * @function onQuestionContent
   * This method is used to initiate the question content Properties
   */
  public onQuestionContent(componentRef, content, index) {
    const instance = componentRef.instance as {
      eventId: string;
      content: ContentModel;
      isBidirectionalPlay: boolean;
      isCurrentPlay: boolean;
      onConfirmAnswer: EventEmitter<{
        answers: Array<AnswerModel>;
        reaction: number;
        subQuestion?: Array<AnswerModel>;
      }>;
      componentSequence: number;
      reportViewMode: boolean;
      performance: SubContentModel;
      disableConfirmBtn: boolean;
      onSubmitFeedback: EventEmitter<boolean>;
      onSelectQuestion: EventEmitter<number>;
      showAnswer: boolean;
      isSubmit: boolean;
      isActive: boolean;
      isShowReaction: boolean;
      isShowEvidence: boolean;
    };
    const classDetails = this.classService.class;
    const isNotSupportedQuestion = instance instanceof UpcomingQuestionComponent;
    const componentSequence = index + 1;
    instance.disableConfirmBtn = false;
    instance.isSubmit = false;
    instance.eventId = generateUUID();
    instance.componentSequence = componentSequence;
    instance.isBidirectionalPlay = this.isBidirectionalPlay;
    const isCurrentPlay = index === this.currentResourceIndex;
    instance.isCurrentPlay = isCurrentPlay;
    instance.isShowEvidence =  this.playerService.checkEvidenceIsEnabled(classDetails, this.tenantSettings, content);
    if (isCurrentPlay) {
      this.onStartQuestionPlay(instance.eventId, instance.componentSequence);
    }
    instance.onSelectQuestion.subscribe((selectedComponentSeq) => {
      if (!instance.isActive) {
        this.scrollToNextContent(instance);
      }
      if (!this.isSubmit) {
        this.setQuestionActiveState(selectedComponentSeq);
      }
    });
    instance.onSubmitFeedback.subscribe((event) => {
      // setTimeout is used to wait feedback to close
      if (!this.isSubmit) {
        const componentSeq = event.componentSequence + 1;
        this.setQuestionActiveState(componentSeq);
      }
      setTimeout(() => {
        const componentRefList = this.componentRefList;
        instance.showAnswer = true;
        const componentRefIndex = componentRefList.indexOf(componentRef);
        const nextComponentRefIndex = componentRefIndex + 1;
        const lastComponentRefIndex = componentRefList.length - 1;
        this.isLastResourcePlayed = componentRefIndex === lastComponentRefIndex;
        if (nextComponentRefIndex <= lastComponentRefIndex) {
          const nextComponentRef =
            componentRefList[nextComponentRefIndex].instance;
          nextComponentRef.isCurrentPlay = true;
          this.scrollToNextContent(nextComponentRef);
        }
        if (nextComponentRefIndex === this.collection.content.length) {
          this.scrollIntoFinishButton();
        }
      }, 700);
    });
    instance.onConfirmAnswer.subscribe((data) => {
      const subQuestion = data.subQuestion || null;
      const componentRefList = this.componentRefList;
      const componentRefIndex = componentRefList.indexOf(componentRef);
      const currentComponentRefIndex = data.componentSequence;
      const nextComponentRefIndex = componentRefIndex + 1;
      if (!subQuestion) {
        if (!this.isSubmit) {
          this.handleQuestionActiveState(nextComponentRefIndex, currentComponentRefIndex);
        }
        const lastComponentRefIndex = componentRefList.length - 1;
        this.isLastResourcePlayed = componentRefIndex === lastComponentRefIndex;
        if (nextComponentRefIndex <= lastComponentRefIndex) {
          const nextComponentRef =
            componentRefList[nextComponentRefIndex].instance;
          nextComponentRef.isCurrentPlay = true;
          this.onStartQuestionPlay(nextComponentRef.eventId, data.componentSequence);
        }
        if (nextComponentRefIndex === this.collection.content.length) {
          this.scrollIntoFinishButton();
        }
      }
      const selectedAnswers = data.answers;
      const reaction = data.reaction;
      // Here we used to check the sub questions for the comprehension question to set baseContentGooruId
      const resourceStopContext = subQuestion || content;
      resourceStopContext.evidence = data.evidence;
      if (subQuestion) {
        resourceStopContext.baseContentGooruId = content.id;
      }
      // To prevent the stop event api call for the not supported serp questions
      if (!isNotSupportedQuestion) {
        this.onStopQuestionPlay(resourceStopContext, selectedAnswers).then(() => {
          this.onCreateReaction(content, instance.eventId, reaction);
        });
        this.answeredQuestions.push(content.id);
      }
    });
    instance.content = content;
    instance.isShowReaction = this.tenantSettings && this.tenantSettings.isShowReaction || false;
  }

  /**
   * @function setQuestionActiveState
   * This method is used to handle the resource active state
   */
  public setQuestionActiveState(componentRefIndex) {
    this.componentRefList.forEach((component, index) => {
      const isCurrentComponent = (index + 1) === componentRefIndex;
      component.instance.isFeedback = isCurrentComponent;
      component.instance.isNextQuestion = false;
      if (this.collection.isCollection) {
        // to enable the focus for question in collection level
        component.instance.isNextQuestion = isCurrentComponent;
        component.instance.isActiveResource = isCurrentComponent;
      }
      component.instance.isActive = isCurrentComponent;
    });
  }

  /**
   * @function handleQuestionActiveState
   * This method is used to handle the question active state
   */
  public handleQuestionActiveState(nextComponentRefIndex, currentComponentRefIndex) {
    const nextComponentIndex = nextComponentRefIndex + 1;
    this.componentRefList.forEach((component, index) => {
      const isNextComponent = (index + 1) === nextComponentIndex;
      const isCurrentComponent = (index + 1) === currentComponentRefIndex;
      component.instance.isFeedback = isCurrentComponent;
      component.instance.isActive = isNextComponent;
      component.instance.isNextQuestion = isNextComponent;
    });
  }

  /**
   * @function handleResourceActiveState
   * This method is used to set the resource active state
   */
  public handleResourceActiveState(instance) {
    this.componentRefList.map((component, index) => {
      const componentResourceIndex = (index + 1);
      const nextComponentRef = (instance.componentSequence + 1);
      component.instance.isActive = componentResourceIndex === nextComponentRef;
      component.instance.isFeedback = componentResourceIndex === instance.componentSequence;
      component.instance.isNextQuestion = componentResourceIndex === nextComponentRef;
    });
  }

  /**
   * @function setResourceActiveState
   * This method is used to set the resource active state
   */
  public setResourceActiveState() {
    this.componentRefList.map((component) => {
      component.instance.isActive = true;
      component.instance.isFeedback = false;
      component.instance.isNextQuestion = false;
    });
  }

  /**
   * @function scrollIntoFinishButton
   * This method is used to scroll into finish button
   */
  public scrollIntoFinishButton() {
    const finishBtnElement = this.finishBtn.nativeElement;
    if (finishBtnElement) {
      finishBtnElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }

  /**
   * @function onResourceContent
   * This method is used to initiate the resource content Properties
   */
  public onResourceContent(componentRef, content, index) {
    const instance = componentRef.instance as {
      eventId: string;
      content: ContentModel;
      onStart: EventEmitter<string>;
      onStartInlineVideo: EventEmitter<string>;
      isActive: boolean;
      onReaction: EventEmitter<number>;
      onPlayResource: EventEmitter<number>;
      onStopResource: EventEmitter<number>;
      onSelectResource: EventEmitter<number>;
      onSubmitFeedback: EventEmitter<boolean>;
      componentSequence: number;
      disableConfirmBtn: boolean;
      isInlineVideo: boolean;
      isSubmit: boolean;
      isFeedback: boolean;
      isNextQuestion: boolean;
      isShowReaction: boolean;
    };
    instance.disableConfirmBtn = false;
    instance.isSubmit = false;
    instance.eventId = generateUUID();
    const componentSequence = index + 1;
    instance.componentSequence = componentSequence;
    const componentRefList = this.componentRefList;

    instance.onSubmitFeedback.subscribe((event) => {
      const nextComponentInstance = componentRefList[instance.componentSequence].instance;
      this.setActiveResource(nextComponentInstance);
      const nextComponentRef = componentRefList[componentSequence];
      if (nextComponentRef) {
        const nextComponentRefInstance = nextComponentRef.instance;
        if (
          nextComponentRefInstance.content.contentFormat ===
          COLLECTION_SUB_FORMAT_TYPES.QUESTION
        ) {
          nextComponentRefInstance.isCurrentPlay = true;
          this.onStartQuestionPlay(nextComponentRefInstance.eventId, instance.componentSequence);
        }
        if (!this.isSubmit) {
          const nextComponentRefIndex = componentSequence + 1;
          this.setQuestionActiveState(nextComponentRefIndex);
        }
        this.scrollToNextContent(nextComponentRefInstance);
      }
    });
    instance.onReaction.subscribe((reactedValue) => {
      this.onCreateReaction(instance.content, instance.eventId, reactedValue);
    });
    instance.onStart.subscribe((event) => {
      this.onStartResourcePlay(instance.content, instance.eventId);
      this.setActiveResource(instance);
    });
    if (instance.onStartInlineVideo) {
      instance.onStartInlineVideo.subscribe((event) => {
        this.onStartInlineResource(instance.content, instance.eventId);
        this.scrollToNextContent(instance);
        this.setActiveResource(instance);
      });
      instance.onPlayResource.subscribe((selectedComponentSeq) => {
        this.setQuestionActiveState(selectedComponentSeq);
      });
    }
    instance.onStopResource.subscribe((event) => {
      const nextComponentRefInstance = componentRefList[instance.componentSequence].instance;
      if (!instance.isInlineVideo) {
        if (!this.isSubmit) {
          this.handleResourceActiveState(instance);
        }
        this.scrollToNextContent(nextComponentRefInstance);
      }
    });
    instance.onSelectResource.subscribe((selectedComponentSeq) => {
      const currentContextInstance = instance;
      if (!this.isSubmit) {
        this.setActiveResource(instance);
        this.setQuestionActiveState(selectedComponentSeq);
      }
      this.scrollToNextContent(currentContextInstance);
    });
    instance.content = this.updateContent(content);
    instance.isShowReaction = this.tenantSettings && this.tenantSettings.isShowReaction || false;
  }

  /**
   * @function updateContent
   * This method is used to updateContent if content is h5
   */
  public updateContent(content) {
    const isH5PContent = this.utilsService.isH5PContent(content.contentSubformat);
    if (isH5PContent) {
      const userSession = this.sessionService.userSession;
      const accessToken = userSession.access_token;
      const resourceId = content.id;
      const contentURL = `${environment.API_END_POINT}/tools/h5p/play/${resourceId}?accessToken=${accessToken}&contentType=${content.contentSubformat}`;
      content.url = contentURL;
    }
    return content;
  }

  /**
   * @function setActiveResource
   * This method is used to set the active resource state
   */
  private setActiveResource(instance) {
    this.componentRefList.forEach((component) => {
      return (component.instance.isActiveResource =
        component.instance.content.id === instance.content.id);
    });
  }

  /**
   * @function onStartResourcePlay
   * This method is used to start resource play event
   */
  public onStartResourcePlay(content, eventId) {
    this.collectionPlayerService.playResourceContent(
      this.collection,
      this.currentContext,
      content,
      eventId
    );
  }

  /**
   * @function onStartExternalResourcePlayForLu
   * This method is used to start resource play for lU
   */
  public onStartExternalResourcePlayForLu(content, eventId) {
    this.collectionPlayerService.playExternalResourceContentForLu(
      this.collection,
      this.currentContext,
      content,
      eventId
    );
  }

  /**
   * @function onContentReaction
   * This method is used to create resource reaction event
   */
  public onCreateReaction(content, eventId, reaction) {
    this.collectionPlayerService.reactionCreateEvent(
      this.collection,
      this.currentContext,
      content,
      eventId,
      reaction
    );
  }

  /**
   * @function onStartInlineResource
   * This method is used to start youtube resource play event
   */
  public onStartInlineResource(content, eventId) {
    this.collectionPlayerService.startResourcePlayEvent(
      this.collection,
      this.currentContext,
      content,
      eventId
    );
  }

  /**
   * @function onExternalCollectionEventForLu
   * This method is used to start external collection event for lu
   */
  public onExternalCollectionEventForLu(content, eventId) {
    this.collectionPlayerService.startExternalResourcePlayEvent(
      this.collection,
      this.currentContext,
      content,
      eventId
    );
  }

  /**
   * @function onStartQuestionPlay
   * This method is used to start question play event
   */
  public onStartQuestionPlay(eventId, questionIndex) {
    const isFirstQuestion = questionIndex <= 1;
    this.collectionPlayerService.playQuestionResourceContent(eventId , isFirstQuestion);
  }

  /**
   * @function onStopQuestionPlay
   * This method is used to stop question play event
   */
  public onStopQuestionPlay(content, selectedAnswers, isSkipped?) {
    const answerObject = {
      questionId: content.id,
      contentFormat: content.contentFormat,
      selectedAnswers
    };
    this.answersPayLoad.push(answerObject);
    return this.collectionPlayerService.stopQuestionResourceContent(
      this.collection,
      this.currentContext,
      content,
      selectedAnswers,
      isSkipped,
    );
  }

  /**
   * @function onFinishActivities
   * This method is triggers when user click the finish
   */
  public onFinishActivities() {
    this.componentRefList.forEach((component) => {
      component.instance.isSubmit = true;
    });
  }

  /**
   * @function onFinish
   * This method is used to stop collection play event
   */
  public onFinish() {
    this.isSubmit = true;
    this.onFinishActivities();
    this.disableQuestionResourceSubmit();
    const inlineVideoComponents = this.componentRefList.filter((component) => {
      return component.instance.isInlineVideo;
    });
    this.setResourceActiveState();
    if (inlineVideoComponents.length) {
      inlineVideoComponents.map((component) => {
        return (component.instance.isSubmited = true);
      });
    }
    this.loaderService.displayLoader();
    this.checkSkippedQuestion().then(() => {
      this.collectionPlayerService.onCollectionStop().then((sessionId) => {
        if (this.context.source !== PLAYER_EVENT_SOURCE.DIAGNOSTIC) {
          this.fetchPerformanceSummary(sessionId);
        } else {
          this.loaderService.dismissLoader().then(() => {
            this.finishCollection.emit({ answersPayLoad: this.answersPayLoad });
          });
        }
      });
    });
  }

  /**
   * @function onDiagnosticFinish
   * This method is used to finsih diagnostic
   */
  public onDiagnosticFinish() {
    this.isSubmit = true;
    this.onFinishActivities();
    this.disableQuestionResourceSubmit();
    const inlineVideoComponents = this.componentRefList.filter((component) => {
      return component.instance.isInlineVideo;
    });
    this.setResourceActiveState();
    if (inlineVideoComponents.length) {
      inlineVideoComponents.map((component) => {
        return (component.instance.isSubmited = true);
      });
    }
    this.loaderService.displayLoader();
    this.checkSkippedQuestion().then(() => {
      this.collectionPlayerService.onCollectionStop().then((sessionId) => {
        this.loaderService.dismissLoader().then(() => {
          this.finishCollection.emit({ answersPayLoad: this.answersPayLoad });
        });
      });
    });
  }

  /**
   * @function disableQuestionResourceSubmit
   * This method is used to disable confirm button in question and resource
   */
  public disableQuestionResourceSubmit() {
    this.componentRefList.forEach((component) => {
      component.instance.disableConfirmBtn = true;
    });
  }

  /**
   * @function checkSkippedQuestion
   * This method is used to stop collection play event for unanswered question
   */
  public checkSkippedQuestion() {
    return new Promise((resolve, reject) => {
      const unansweredQuestions = this.collection.content.filter((question) => {
        return (
          question.contentFormat === COLLECTION_SUB_FORMAT_TYPES.QUESTION &&
          !this.answeredQuestions.includes(question.id)
        );
      });
      const skippedQuestionResponses = unansweredQuestions.map(
        (unansweredQuestion) => {
          return this.onStopQuestionPlay(unansweredQuestion, [], true);
        }
      );
      Promise.all(skippedQuestionResponses).then(() => {
        resolve(null);
      }, reject);
    });
  }

  /**
   * @function fetchPerformanceSummary
   * This method is used to fetch performance summary
   */
  public fetchPerformanceSummary(sessionId) {
    this.sessionId = sessionId;
    this.startPlay = false;
    const contentSource = this.currentContext.source;
    this.performanceProvider
      .fetchActivitySummary(
        this.collection.format,
        this.collection.id,
        sessionId,
        contentSource
      )
      .then((activityPerformance) => {
        this.activityPerformance = activityPerformance;
        this.finishCollection.emit({
          sessionId,
          performance: activityPerformance,
          answersPayLoad: this.answersPayLoad
        });
        this.showSummaryReport = true;
        this.loaderService.dismissLoader();
      });
  }

  /**
   * @function onPlayNext
   * This method is used to play next collection
   */
  public onPlayNext() {
    this.playNext.emit();
    this.showSummaryReport = false;
  }

  /**
   * @function onRedirectToProfiency
   * This method is used to emit event for proficiency redirection
   */
  public onRedirectToProfiency() {
    this.showMasteredCompetency.emit();
  }

  /**
   * @function closeMasteryCard
   * This method is used to emit close event for mastery card
   */
  public closeMasteryCard() {
    this.cancelToShowMasteredCompetency.emit();
  }

  /**
   * @function scrollToNextContent
   * This method is used to emit to parent scroll into element
   */
  public scrollToNextContent(component) {
    const childElement = component.elementReference.nativeElement;
    if (childElement) {
      setTimeout(() => {
        this.scrollToContentView.emit(childElement.offsetTop);
      }, 600);
    }
  }

  /**
   * @function showReport
   * This method is used to show report based on type
   */
  public showReport(event) {
    event.stopPropagation();
    const context = {
      collectionType: this.collection.collectionType,
      collectionId: this.collection.id,
      contentSource: this.currentContext.source,
      sessionId: this.sessionId,
      showCorrectAnswer: this.showCorrectAnswer
    };
    const collection = cloneObject(this.collection);
    const activityPerformance = cloneObject(this.activityPerformance);
    this.reportService.showReport(context, collection, activityPerformance);
  }

  /**
   * @function toggleLessonBoundary
   * This method is used to toggle lesson boundary description
   */
  public toggleLessonBoundary() {
    this.isToggleLessonBoundary = !this.isToggleLessonBoundary;
    const lessonElement = this.lessonBoundaryElement.nativeElement;
    if (lessonElement) {
      this.scrollToElement(lessonElement.offsetTop);
    }
  }

  /**
   * @function scrollToNextCollection
   * This method is used to scroll to next collection
   */
  public scrollToNextCollection() {
    const element = this.nextCollectionElement.nativeElement;
    if (element) {
      this.scrollToElement(element.offsetTop);
    }
  }

  /**
   * @function scrollToElement
   * This method is used to scroll to selected element
   */
  public scrollToElement(offsetTop) {
    this.scrollToContentView.emit(offsetTop);
  }

  /**
   * @function onOpenRelatedContent
   * This method is triggered when user open related content tab
   */
  public onOpenRelatedContent(offsetTop) {
    this.openRelatedContent.emit(offsetTop);
  }

  /**
   * @function hideConfetti
   * This method is used to hide confetti
   */
  public hideConfetti() {
    this.hideConfettiEvent.emit();
  }

  public ngOnDestory() {
    this.clearComponentRef();
  }
}
