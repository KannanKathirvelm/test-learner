import { Component, ElementRef, EventEmitter, Input, OnInit, ViewChild } from '@angular/core';
import { EvidenceModel } from '@app/shared/models/performance/performance';
import { IonReorderGroup } from '@ionic/angular';
import { fadeAnimation } from '@shared/animations';
import { ATTEMP_STATUS, FEEDBACK_CONTENT_TYPES } from '@shared/constants/helper-constants';
import { AnswerModel, ContentModel } from '@shared/models/collection/collection';
import { CategoryModel } from '@shared/models/feedback/feedback';
import { AnswerObjectModel, SubContentModel } from '@shared/models/portfolio/portfolio';
import { FeedbackService } from '@shared/providers/service/feedback/feedback.service';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'drag-and-drop',
  templateUrl: './drag-and-drop.component.html',
  styleUrls: ['./drag-and-drop.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 }), fadeAnimation]
})
export class DragAndDropComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties
  @ViewChild(IonReorderGroup, { static: true })
  public reorderGroup: IonReorderGroup;
  public alreadyPlayed: boolean;
  @Input() public content: ContentModel;
  @Input() public isPreview: boolean;
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
  @Input() public isActive: boolean;
  @Input() public isNextQuestion: boolean;
  @Input() public isFeedback: boolean;
  @Input() public reportViewMode: boolean;
  @Input() public performance: SubContentModel;
  @Input() public isSubmit: boolean;
  @Input() public componentSequence: number;
  @Input() public isShowReaction: boolean;
  @Input() public isShowEvidence: boolean;
  public onConfirmAnswer: EventEmitter<{
    componentSequence: number,
    answers: Array<AnswerModel>,
    reaction: number,
    evidence: Array<EvidenceModel>
  }> = new EventEmitter();
  @Input() public disableConfirmBtn: boolean;
  @Input() public isHideAnswerDetails: boolean;
  public showAnswer: boolean;
  public showAdditionalInfo: boolean;
  public isDisabled: boolean;
  public answers: Array<AnswerModel>;
  public isAnswered: boolean;
  public averageScore: number;
  public userAnswer: Array<AnswerObjectModel>;
  public showFeedback: boolean;
  public feedbackCategory: Array<CategoryModel>;
  public isQuestionAnswered: boolean;
  public hideConfirmButton: boolean;
  private selectedReaction: number;
  public onSubmitFeedback: EventEmitter<{ isSubmited: boolean, componentSequence: number }> = new EventEmitter();
  public onSelectQuestion: EventEmitter<number> = new EventEmitter();
  public evidenceFile: Array<EvidenceModel>;
  @Input() public studentScore: number;
  public isThumbnailError: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private feedbackService: FeedbackService,
    // tslint:disable-next-line
    private elementReference: ElementRef
  ) {
    this.showAdditionalInfo = true;
    this.hideConfirmButton = false;
  }

  // -------------------------------------------------------------------------
  // Events
  public ngOnInit() {
    const answers = [...this.content.answer];
    if (this.reportViewMode) {
      this.evidenceFile = this.performance ? this.performance.evidence : [];
      this.showAnswer = false;
      this.averageScore = this.performance ? this.performance.averageScore : null;
      this.checkUserAnswers(answers);
    } else {
      this.isQuestionAnswered = false;
      const contentType = FEEDBACK_CONTENT_TYPES[this.content.contentFormat];
      const feedbackCategories = this.feedbackService.feedbackCategories;
      this.feedbackCategory = feedbackCategories[contentType];
      this.answers = this.answerShuffle(answers);
    }
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
   * @function onClickAnswer
   * This method triggers when user click on the answer
   */
  public onClickAnswer() {
    if (this.isBidirectionalPlay && !this.isActive) {
      this.onClickQuestion();
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
   * @function onCurrentPlay
   * This method is used to initialize Properties
   */
  public onCurrentPlay(isCurrentPlay: boolean) {
    this.showAnswer = !isCurrentPlay;
    this.isDisabled = !this.isBidirectionalPlay && this.showAnswer && !this.isQuestionAnswered;
  }

  /**
   * @function onSelectReaction
   * This method trigger when user selected on reaction
   */
  public onSelectReaction(reactionValue) {
    this.selectedReaction = reactionValue;
  }

  /**
   * @function reorderAnswer
   * This method triggers when user re-order the answer
   */
  public reorderAnswer(event) {
    this.onClickAnswer();
    this.isAnswered = true;
    event.detail.complete();
    const indexes = event.detail;
    const element = this.answers[indexes.from];
    this.answers.splice(indexes.from, 1);
    this.answers.splice(indexes.to, 0, element);
  }

  /**
   * @function onSubmitAnswer
   * This method is used to submit the answered value
   */
  private onSubmitAnswer() {
    this.answers.forEach((answer, index) => {
      answer.is_correct = answer.sequence === (index + 1) ? 1 : 0;
    });
    this.onConfirmAnswer.next({
      answers: this.answers,
      reaction: this.selectedReaction,
      componentSequence: this.componentSequence,
      evidence: this.evidenceFile
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
   * @function afterQuestionAnswered
   * This method is used to add css class for after question answered
   */
  public afterQuestionAnswered() {
    this.isQuestionAnswered = true;
    this.isDisabled = false;
    if (!this.isBidirectionalPlay) {
      this.hideConfirmButton = true;
    }
  }

  /**
   * @function onShowLastPlayedAnswer
   * This method is used to show last answered value
   */
  public onShowLastPlayedAnswer() {
    if (this.performance.answerObject && this.performance.answerObject.length) {
      this.afterQuestionAnswered();
      this.checkFeedback();
      this.checkUserAnswers(this.answers);
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
    const answers = this.answers;
    if (value) {
      this.answers = answers.sort(function(a, b) {
        return a.sequence - b.sequence;
      }).map((item) => {
        item.status = ATTEMP_STATUS.CORRECT;
        return item;
      });
    } else {
      this.checkUserAnswers(answers);
    }
  }

  /**
   * @function checkUserAnswers
   * This method used to user answers
   */
  public checkUserAnswers(answers) {
    answers.forEach((answer, index) => {
      const userAnswerIndex = this.performance && this.performance.answerObject && this.performance.answerObject.length ?
        this.performance.answerObject.findIndex((item) => item.order === answer.sequence) : null;
      answer.userSequence = userAnswerIndex;
      answer.status = userAnswerIndex !== null ? (userAnswerIndex === index) ?
        ATTEMP_STATUS.CORRECT : ATTEMP_STATUS.INCORRECT : ATTEMP_STATUS.SKIPPED;
      return answer;
    });
    answers.sort(function(a, b) {
      return a.userSequence - b.userSequence;
    });
    this.answers = answers;
  }

  /**
   * @function checkUserAnswers
   * This method used to user answers
   */
  public answerShuffle(answers) {
    return answers.sort(() => (0.5 - Math.random()));
  }

  /**
   * @function evidenceUploadFile
   * This method triggers when evidence upload file
   */
  public evidenceUploadFile(evidence) {
    this.evidenceFile = evidence;
  }

  /**
   * @function imageErrorHandler
   * This Method is used to set content thumbnail image error
   */
   public imageErrorHandler() {
    this.isThumbnailError = true;
  }
}
