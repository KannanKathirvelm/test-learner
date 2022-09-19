import { Component, ElementRef, EventEmitter, Input, OnInit } from '@angular/core';
import { EvidenceModel } from '@app/shared/models/performance/performance';
import { CORRECT_ANSWER_YES, FEEDBACK_CONTENT_TYPES } from '@shared/constants/helper-constants';
import { AnswerModel, ContentModel } from '@shared/models/collection/collection';
import { CategoryModel } from '@shared/models/feedback/feedback';
import { SubContentModel } from '@shared/models/portfolio/portfolio';
import { FeedbackService } from '@shared/providers/service/feedback/feedback.service';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'multiple-answer',
  templateUrl: './multiple-answer.component.html',
  styleUrls: ['./multiple-answer.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 })]
})
export class MultipleAnswerComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties
  public alreadyPlayed: boolean;
  @Input() public content: ContentModel;
  @Input() public isPreview: boolean;
  @Input() public isBidirectionalPlay: boolean;
  @Input() set isCurrentPlay(value: boolean) {
    this.onCurrentPlay(value);
  }
  public showCorrectAnswer: boolean;
  @Input() set isShowCorrectAnswer(value: boolean) {
    this.showCorrectAnswer = value;
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
  @Input() public isActive: boolean;
  @Input() public isNextQuestion: boolean;
  @Input() public isShowReaction: boolean;
  @Input() public isShowEvidence: boolean;
  public onConfirmAnswer: EventEmitter<{
    componentSequence: number,
    answers: Array<AnswerModel>,
    reaction: number,
    evidence: Array<EvidenceModel>
  }> = new EventEmitter();
  @Input() public disableConfirmBtn: boolean;
  @Input() public isFeedback: boolean;
  @Input() public isHideAnswerDetails: boolean;
  public selectedAnswer: Array<AnswerModel>;
  public showAnswer: boolean;
  public showAdditionalInfo: boolean;
  public isDisabled: boolean;
  public enableConfirm: boolean;
  public answers: Array<AnswerModel>;
  public averageScore: number;
  public feedbackCategory: Array<CategoryModel>;
  public showFeedback: boolean;
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
    private elementReference: ElementRef) {
    this.selectedAnswer = [];
    this.showAdditionalInfo = true;
    this.hideConfirmButton = false;
  }

  public ngOnInit() {
    const answers = [...this.content.answer];
    if (this.reportViewMode) {
      this.evidenceFile = this.performance ? this.performance.evidence : [];
      this.showAnswer = false;
      this.showUserAnswer(answers);
    } else {
      this.isQuestionAnswered = false;
      const contentType = FEEDBACK_CONTENT_TYPES[this.content.contentFormat];
      const feedbackCategories = this.feedbackService.feedbackCategories;
      this.feedbackCategory = feedbackCategories[contentType];
      this.answers = answers;
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
   * @function showUserAnswer
   * This method used to show user answer
   */
  public showUserAnswer(answers) {
    this.averageScore = this.performance ? this.performance.averageScore : null;
    const userAnswers = this.performance ? this.performance.answerObject : null;
    answers.forEach((answer) => {
      const userAnswer = userAnswers ? userAnswers.find((item) => item.order === answer.sequence) : null;
      if (userAnswer) {
        const userAnswerText = userAnswer.answer_text.toLowerCase();
        const userSelectedAnswer = userAnswerText === CORRECT_ANSWER_YES ? 1 : 0;
        answer.status = userAnswer.status;
        answer.is_correct = userSelectedAnswer;
        answer.userAnswerText = userAnswerText;
      }
    });
    this.answers = answers;
  }

  /**
   * @function selectAnswer
   * This method triggers when user selects answer
   */
  public selectAnswer(answer, answerValue, event) {
    const userValue = event.target.value;
    const tempAnswer = { ...answer };
    const answerIndex = this.selectedAnswer.findIndex((answerItem) => answerItem.sequence === answer.sequence);
    tempAnswer.is_correct = tempAnswer.is_correct === answerValue ? 1 : 0;
    tempAnswer.answer_text = userValue;
    if (answerIndex !== -1) {
      this.selectedAnswer[answerIndex] = tempAnswer;
    } else {
      this.selectedAnswer.push(tempAnswer);
    }
    if (this.selectedAnswer.length === this.content.answer.length) {
      this.enableConfirm = true;
    }
  }

  /**
   * @function onSelectReaction
   * This method trigger when user selected on reaction
   */
  public onSelectReaction(reactionValue) {
    this.selectedReaction = reactionValue;
  }

  /**
   * @function onSubmitAnswer
   * This method is used to submit the answered value
   */
  private onSubmitAnswer() {
    this.onConfirmAnswer.next({
      answers: this.selectedAnswer,
      reaction: this.selectedReaction,
      componentSequence: this.componentSequence,
      evidence: this.evidenceFile
    });
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
   * @function onShowLastPlayedAnswer
   * This method is used to show last answered value
   */
  public onShowLastPlayedAnswer() {
    if (this.performance.answerObject && this.performance.answerObject.length) {
      this.afterQuestionAnswered();
      this.checkFeedback();
      const answers = [...this.content.answer];
      this.showUserAnswer(answers);
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
