import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef, EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { fadeAnimation } from '@shared/animations';
import { QUESTION_TYPES } from '@shared/components/player/questions/serp/serp-questions.import';
import { RESOURCE_TYPES } from '@shared/components/player/resources/resources.import';
import { COLLECTION_SUB_FORMAT_TYPES, FEEDBACK_CONTENT_TYPES } from '@shared/constants/helper-constants';
import { AnswerModel, ContentModel } from '@shared/models/collection/collection';
import { CategoryModel } from '@shared/models/feedback/feedback';
import { SubContentModel } from '@shared/models/portfolio/portfolio';
import { FeedbackService } from '@shared/providers/service/feedback/feedback.service';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'comprehension',
  templateUrl: './comprehension.component.html',
  styleUrls: ['./comprehension.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 }), fadeAnimation]
})
export class ComprehensionComponent implements OnInit, OnDestroy {

  // -------------------------------------------------------------------------
  // Properties
  public alreadyPlayed: boolean;
  @Input() public isPreview: boolean;
  @Input() public content: ContentModel;
  @Input() public isBidirectionalPlay: boolean;
  @Input() set isCurrentPlay(value: boolean) {
    this.onCurrentPlay(value);
  }
  @Input() set isShowCorrectAnswer(value: boolean) {
    this.onShowCorrectAnswer(value);
  }
  @Input() set showLastPlayedAnswer(value: boolean) {
    this.alreadyPlayed = value;
    if (this.performance && value) {
      this.onShowLastPlayedAnswer();
    }
  }
  @Input() public reportViewMode: boolean;
  @Input() public performance: SubContentModel;
  @Input() public isSubmit: boolean;
  @Input() public componentSequence: number;
  @Input() public disableConfirmBtn: boolean;
  @Input() public isActive: boolean;
  @Input() public isFeedback: boolean;
  @Input() public isNextQuestion: boolean;
  @Input() public isShowReaction: boolean;
  @Input() public isHideAnswerDetails: boolean;
  public onConfirmAnswer: EventEmitter<{
    componentSequence: number,
    answers: Array<AnswerModel>,
    reaction: number,
    subQuestion?: Array<AnswerModel>
  }> = new EventEmitter();
  public showAnswer: boolean;
  public showAdditionalInfo: boolean;
  public isDisabled: boolean;
  public averageScore: number;
  public showCorrectAnswer: boolean;
  public showFeedback: boolean;
  public feedbackCategory: Array<CategoryModel>;
  public isQuestionAnswered: boolean;
  public hideConfirmButton: boolean;
  private selectedReaction: number;
  public onSubmitFeedback: EventEmitter<{ isSubmited: boolean, componentSequence: number }> = new EventEmitter();
  public onSelectQuestion: EventEmitter<number> = new EventEmitter();
  @ViewChild('comprehension_view', { read: ViewContainerRef, static: true })
  private contentViewRef: ViewContainerRef;
  @Input() public isAnswerKeyHidden: boolean;
  public isShowAnswerToggle: number;
  public isThumbnailError: boolean;
  public componentRefList: Array<ComponentRef<any>>;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private feedbackService: FeedbackService,
    // tslint:disable-next-line
    private elementReference: ElementRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {
    this.hideConfirmButton = false;
    this.showAdditionalInfo = true;
    this.componentRefList = [];
  }

  // -------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    if (this.reportViewMode) {
      this.showAnswer = false;
      this.averageScore = this.performance ? this.performance.averageScore : null;
      this.checkUserAnswers();
    } else {
      this.isQuestionAnswered = false;
      const contentType = FEEDBACK_CONTENT_TYPES[this.content.contentFormat];
      const feedbackCategories = this.feedbackService.feedbackCategories;
      this.feedbackCategory = feedbackCategories[contentType];
    }
    this.renderContents();
  }

  public ngOnDestroy() {
    this.clearComponentRef();
  }

  /**
   * @function renderContents
   * This method is used to create dyanamic component
   */
  public renderContents() {
    if (this.content && this.content.subQuestions) {
      this.content.subQuestions.forEach((content, index) => {
        const contentFormatTypes = content.contentFormat === COLLECTION_SUB_FORMAT_TYPES.QUESTION ? QUESTION_TYPES : RESOURCE_TYPES;
        const componentType = contentFormatTypes[content.contentSubformat];
        if (componentType) {
          const factory = this.componentFactoryResolver.resolveComponentFactory(componentType);
          const componentRef = this.contentViewRef.createComponent(factory);
          this.onContentInstance(componentRef, content, index);
          this.componentRefList.push(componentRef);
        }
      });
    }
  }

  /**
   * @function onContentInstance
   * This method is used to pass instance to dynamic components
   */
  public onContentInstance(componentRef, content, index) {
    const instance = componentRef.instance as {
      content: ContentModel;
      isBidirectionalPlay: boolean;
      reportViewMode: boolean;
      performance: SubContentModel;
      showCorrectAnswer: boolean;
      componentSequence: number;
      showResourcePreview: boolean;
      isPreview: boolean;
      disableConfirmBtn: boolean;
      isComprehension: boolean;
      onConfirmAnswer: EventEmitter<{
        answers: Array<AnswerModel>;
        reaction: number;
        componentSequence: number;
      }>;
    };
    instance.componentSequence = (index + 1);
    instance.isBidirectionalPlay = this.isBidirectionalPlay;
    instance.reportViewMode = this.reportViewMode;
    instance.isPreview = this.isPreview;
    instance.disableConfirmBtn = this.disableConfirmBtn;
    instance.isComprehension = true;
    instance.onConfirmAnswer.subscribe((data) => {
      this.onConfirmAnswer.next({
        answers: data.answers,
        reaction: 0,
        componentSequence: data.componentSequence,
        subQuestion: content
      });
    });
    if (this.performance && this.performance.subQuestions) {
      const summaryPerformance = this.performance.subQuestions.find((item) => item.id === content.id);
      instance.performance = summaryPerformance;
    }
    instance.showCorrectAnswer = false;
    instance.content = content;
  }

  /**
   * @function toggleShowCorrectAnswer
   * This method is used to start question play event
   */
  public toggleShowCorrectAnswer(value) {
    this.componentRefList.forEach((component) => {
      component.instance.isShowCorrectAnswer = value;
    });
  }

  /**
   * @function clearComponentRef
   * This method is used to clear dynamic components
   */
  public clearComponentRef() {
    this.componentRefList.forEach((component) => {
      component.destroy();
    });
  }

  /**
   * @function onClickQuestionWithFeedBack
   * This method triggers when user click on the question
   */
  public onClickQuestionWithFeedBack() {
    if (this.isNextQuestion) {
      this.onClickQuestion();
    }
  }

  /**
   * @function onClickQuestion
   * This method triggers when user click on the question
   */
  public onClickQuestion() {
    if (!this.isSubmit) {
      if (!this.isActive) {
        this.showAnswer = false;
      }
      this.onSelectQuestion.next(this.componentSequence);
    }
  }

  /**
   * @function toggleAnswers
   * This method is used to toggle the answers
   */
  public toggleAnswers() {
    this.showAnswer = !this.showAnswer;
  }

  /**
   * @function toggleInfo
   * This method is used to toggle info
   */
  public toggleInfo() {
    this.showAdditionalInfo = !this.showAdditionalInfo;
  }

  /**
   * @function onSelectReaction
   * This method trigger when user selected on reaction
   */
  public onSelectReaction(reactionValue) {
    this.selectedReaction = reactionValue;
  }

  /**
   * @function onCurrentPlay
   * This method is used to initialize Properties
   */
  public onCurrentPlay(isCurrentPlay: boolean) {
    this.showAnswer = !isCurrentPlay;
    this.isDisabled = !this.isBidirectionalPlay && this.showAnswer && !this.isQuestionAnswered;
  }

  /**
   * @function onSubmitAnswer
   * This method is used to submit the answered value
   */
  private onSubmitAnswer() {
    this.onConfirmAnswer.next({
      answers: [],
      reaction: this.selectedReaction,
      componentSequence: this.componentSequence
    });
  }

  /**
   * @function onConfirm
   * This method is used to emit event when user clicks on confirm button
   */
  public onConfirm() {
    this.onSubmitAnswer();
    this.afterQuestionAnswered();
    this.checkFeedback();
  }

  /**
   * @function afterQuestionAnswered
   * This method is used to add css class for after question answered
   */
  public afterQuestionAnswered() {
    this.isQuestionAnswered = true;
    this.isDisabled = false;
    if (!this.isBidirectionalPlay) {
      this.hideConfirmButton = true;
    }
    this.componentRefList.forEach((component) => {
      component.instance.questionAnswered = true;
    });
  }

  /**
   * @function checkFeedback
   * This method is used to check feedback has or not
   */
  public checkFeedback() {
    if (this.feedbackCategory.length) {
      this.showFeedback = true;
    } else {
      this.feedbackSkiporSubmit();
    }
  }

  /**
   * @function feedbackSkiporSubmit
   * This method is used to emit event when user clicks on confirm button
   */
  public feedbackSkiporSubmit() {
    this.onSubmitFeedback.next({ isSubmited: true, componentSequence: this.componentSequence });
  }

  /**
   * @function onShowCorrectAnswer
   * This method used to show correct answer
   */
  public onShowCorrectAnswer(value) {
    this.showCorrectAnswer = value;
    this.checkUserAnswers();
    this.toggleShowCorrectAnswer(value);
  }

  /**
   * @function onShowLastPlayedAnswer
   * This method is used to show last answered value
   */
  public onShowLastPlayedAnswer() {
    if (this.performance.subQuestions && this.performance.subQuestions.length) {
      this.afterQuestionAnswered();
      this.checkFeedback();
      this.setSubQuestionPerformance(true);
    }
  }

  /**
   * @function setSubQuestionPerformance
   * This method used to set sub questions performance
   */
  public setSubQuestionPerformance(isLastPlayed?) {
    this.componentRefList.forEach((component) => {
      const componentInstance = component.instance;
      const performance = this.performance.subQuestions.find((question) => {
        return question.id === componentInstance.content.id;
      });
      if (performance) {
        componentInstance.performance = performance;
        if (isLastPlayed) {
          componentInstance.showLastPlayedAnswer = true;
        }
      }
    });
  }

  /**
   * @function checkUserAnswers
   * This method used to check user answers
   */
  public checkUserAnswers() {
    if (this.performance.subQuestions && this.performance.subQuestions.length) {
      this.setSubQuestionPerformance();
    }
  }

  /**
   * @function imageErrorHandler
   * This Method is used to set content thumbnail image error
   */
   public imageErrorHandler() {
    this.isThumbnailError = true;
  }
}
