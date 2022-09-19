import {
  Component, ElementRef, EventEmitter, Input, OnInit
} from '@angular/core';
import { EvidenceModel } from '@app/shared/models/performance/performance';
import { fadeAnimation } from '@shared/animations';
import { FEEDBACK_CONTENT_TYPES } from '@shared/constants/helper-constants';
import { AnswerModel, ContentModel } from '@shared/models/collection/collection';
import { CategoryModel } from '@shared/models/feedback/feedback';
import { SubContentModel } from '@shared/models/portfolio/portfolio';
import { FeedbackService } from '@shared/providers/service/feedback/feedback.service';
import { CollectionPlayerService } from '@shared/providers/service/player/collection-player.service';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'multiple-choice',
  templateUrl: './multiple-choice.component.html',
  styleUrls: ['./multiple-choice.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 }), fadeAnimation]
})
export class MultipleChoiceComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties
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
  @Input() public disableConfirmBtn: boolean;
  @Input() public reportViewMode: boolean;
  @Input() public performance: SubContentModel;
  @Input() public componentSequence: number;
  @Input() public isActive: boolean;
  @Input() public isNextQuestion: boolean;
  @Input() public isSubmit: boolean;
  @Input() public isFeedback: boolean;
  @Input() public isShowReaction: boolean;
  @Input() public isShowEvidence: boolean;
  @Input() public isHideAnswerDetails: boolean;
  public onConfirmAnswer: EventEmitter<{
    componentSequence: number,
    answers: Array<AnswerModel>,
    reaction: number,
    evidence: Array<EvidenceModel>
  }> = new EventEmitter();
  public selectedAnswerText: string;
  public selectedAnswer: AnswerModel;
  public showAnswer: boolean;
  public showAdditionalInfo: boolean;
  public isDisabled: boolean;
  public answers: Array<AnswerModel>;
  public averageScore: number;
  public showCorrectAnswer: boolean;
  public showFeedback: boolean;
  public feedbackCategory: Array<CategoryModel>;
  public isQuestionAnswered: boolean;
  public primaryColor: string;
  public secondaryColor: string;
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
    private collectionPlayerService: CollectionPlayerService,
    private feedbackService: FeedbackService,
    // tslint:disable-next-line
    private elementReference: ElementRef
  ) {
    this.hideConfirmButton = false;
    this.showAdditionalInfo = true;
  }

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
      this.answers = answers;
    }
  }

  /**
   * @function evidenceUploadFile
   * This method triggers when evidence upload file
   */
  public evidenceUploadFile(evidence) {
   this.evidenceFile = evidence;
  }

  /**
   * @function selectAnswer
   * This method triggers when user selects answer
   */
  public selectAnswer(answer) {
    this.onClickAnswer();
    this.selectedAnswerText = answer.answer_text;
    this.selectedAnswer = answer;
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
   * @function onSelectReaction
   * This method trigger when user selected on reaction
   */
  public onSelectReaction(reactionValue) {
    this.selectedReaction = reactionValue;
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
   * @function onShowLastPlayedAnswer
   * This method is used to show last answered value
   */
  public onShowLastPlayedAnswer() {
    const lastAnswer = this.performance.answerObject && this.performance.answerObject.length ?
      this.performance.answerObject[0] : null;
    if (lastAnswer) {
      this.afterQuestionAnswered();
      this.checkFeedback();
      this.selectAnswer(lastAnswer);
    }
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
   * @function onSubmitAnswer
   * This method is used to submit the answered value
   */
  private onSubmitAnswer() {
    this.onConfirmAnswer.next({
      answers: [this.selectedAnswer],
      reaction: this.selectedReaction,
      componentSequence: this.componentSequence,
      evidence: this.evidenceFile

    });
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
    this.checkUserAnswers(this.answers);
  }

  /**
   * @function checkUserAnswers
   * This method used to check user answers
   */
  public checkUserAnswers(answers) {
   this.answers = this.collectionPlayerService.checkUserAnswers(answers, this.performance, this.showCorrectAnswer);
  }

  /**
   * @function imageErrorHandler
   * This Method is used to set content thumbnail image error
   */
   public imageErrorHandler() {
    this.isThumbnailError = true;
  }
}
