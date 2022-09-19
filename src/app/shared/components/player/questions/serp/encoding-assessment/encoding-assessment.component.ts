import { Component, ElementRef, EventEmitter, Input, OnInit } from '@angular/core';
import { fadeAnimation } from '@shared/animations';
import { ATTEMP_STATUS, FEEDBACK_CONTENT_TYPES } from '@shared/constants/helper-constants';
import { AnswerModel, ContentModel } from '@shared/models/collection/collection';
import { CategoryModel } from '@shared/models/feedback/feedback';
import { SubContentModel } from '@shared/models/portfolio/portfolio';
import { FeedbackService } from '@shared/providers/service/feedback/feedback.service';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'encoding-assessment',
  templateUrl: './encoding-assessment.component.html',
  styleUrls: ['./encoding-assessment.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 }), fadeAnimation]
})
export class EncodingAssessmentComponent implements OnInit {

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
  @Input() public isComprehension: boolean;
  @Input() public isShowReaction: boolean;
  @Input() public isHideAnswerDetails: boolean;
  public onConfirmAnswer: EventEmitter<{
    componentSequence: number,
    answers: Array<AnswerModel>,
    reaction: number
  }> = new EventEmitter();
  public showAnswer: boolean;
  public showAdditionalInfo: boolean;
  public isDisabled: boolean;
  public answers: Array<AnswerModel>;
  public enableConfirm: boolean;
  public averageScore: number;
  public showCorrectAnswer: boolean;
  public showFeedback: boolean;
  public feedbackCategory: Array<CategoryModel>;
  public isQuestionAnswered: boolean;
  public hideConfirmButton: boolean;
  private selectedReaction: number;
  public onSubmitFeedback: EventEmitter<{ isSubmited: boolean, componentSequence: number }> = new EventEmitter();
  public onSelectQuestion: EventEmitter<number> = new EventEmitter();
  public uploading: boolean;
  public answerInputs: Array<AnswerModel>;
  @Input() public studentScore: number;
  public isThumbnailError: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private feedbackService: FeedbackService,
    // tslint:disable-next-line
    private elementReference: ElementRef
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.enableConfirm = false;
    this.answerInputs = [];
    if (this.reportViewMode) {
      this.showAnswer = false;
      this.averageScore = this.performance
        ? this.performance.averageScore
        : null;
    } else {
      this.isQuestionAnswered = false;
      const contentType = FEEDBACK_CONTENT_TYPES[this.content.contentFormat];
      const feedbackCategories = this.feedbackService.feedbackCategories;
      this.feedbackCategory = feedbackCategories[contentType];
    }
    this.setAnswersText();
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
    if (this.performance.answerObject && this.performance.answerObject.length) {
      this.checkFeedback();
      this.afterQuestionAnswered();
      this.setUserPerformance();
    }
  }

  /**
   * @function onShowCorrectAnswer
   * This method used to show correct answer
   */
  public onShowCorrectAnswer(value) {
    if (value) {
      this.answerInputs.map((answer) => {
        const answers = this.content.answer;
        const selectedAnswer = answers.find((item) => item.sequence === answer.order);
        const correctAnswer = selectedAnswer ? selectedAnswer.answer_text : '';
        answer.answer_text = correctAnswer;
        answer.status = ATTEMP_STATUS.CORRECT;
        answer.answerInLetters = correctAnswer ? correctAnswer.split('') : null;
      });
    } else {
      this.setUserPerformance();
    }
  }

  /**
   * @function setUserPerformance
   * This method is used to set user answered text
   */
  public setUserPerformance() {
    if (this.performance && this.performance.answerObject) {
      const userAnswerExists =
        this.performance && this.performance.answerObject.length;
      this.answerInputs.map((answer, index) => {
        const userAnswerText = userAnswerExists
          ? this.performance.answerObject[index].answer_text
          : '';
        answer.answer_text = userAnswerText;
        answer.status = userAnswerExists
          ? this.performance.answerObject[index].status
          : '';
        answer.answerInLetters = userAnswerText ? userAnswerText.split('') : null;
      });
    }
  }

  /**
   * @function setAnswersText
   * This method is used to set answer text
   */
  public setAnswersText() {
    this.content.answer.forEach((answer, index) => {
      const answerText = answer.answer_text;
      const userAnswerExists =
        this.performance &&
        this.performance.answerObject &&
        this.performance.answerObject.length;
      const userAnswerText = userAnswerExists
        ? this.performance.answerObject[index].answer_text
        : '';
      this.answerInputs.push({
        text: answerText,
        audioUrl: answer.answer_audio_filename,
        answer_text: userAnswerText,
        status: userAnswerExists
          ? this.performance.answerObject[index].status
          : null,
        order: index + 1,
        answerInLetters: userAnswerText
          ? userAnswerText.split('')
          : null
      });
    });
  }

  /**
   * @function notifyInputAnswers
   * This method triggers when user types in answer input
   */
  public notifyInputAnswers(event, answerIndex, inputIndex) {
    const answerInputs = this.answerInputs;
    const elementReference = this.elementReference.nativeElement;
    const inputsContainer = elementReference.querySelectorAll(`.answer-${answerIndex} .answer-input`);
    const value = event.detail.value;
    if (value.length) {
      const nextElement = elementReference.querySelector(`.answer-${answerIndex} .input-${inputIndex + 1}`);
      if (nextElement) {
        nextElement.setFocus();
      }
    }
    if (inputsContainer && inputsContainer.length) {
      const keys = Object.keys(inputsContainer);
      const answerValues = keys.map((index) => {
        return inputsContainer[index].value;
      }).join('');
      answerInputs[answerIndex].answer_text = answerValues;
    }
    const answerInputWithAnswer = answerInputs.find((answer) => {
      return answer.answer_text.length > 0;
    });
    this.enableConfirm = !!answerInputWithAnswer;
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
   * @function onSubmitAnswer
   * This method is used to submit the answered value
   */
  private onSubmitAnswer() {
    const answerInputs = this.answerInputs;
    const correctAnswers = this.content.answer;
    const answers = [];
    answerInputs.forEach((answer, index) => {
      const correctAnswer = correctAnswers[index];
      const answerText = answer.answer_text.trim();
      const isCorrect = correctAnswer
        ? correctAnswer.answer_text.trim() === answerText
        : null;
      answers.push({
        answer_text: answerText,
        is_correct: isCorrect,
        sequence: index,
      });
    });
    this.onConfirmAnswer.next({
      answers,
      reaction: this.selectedReaction,
      componentSequence: this.componentSequence
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
   * @function playAudio
   * This method is used to play audio
   */
  public playAudio(answer) {
    answer.isAudioPlaying = true;
  }

  /**
   * @function pauseAudio
   * This method is used to pause audio
   */
  public pauseAudio(answer, event?) {
    if (event) {
      event.stopPropagation();
    }
    answer.isAudioPlaying = false;
  }

  /**
   * @function onSelectReaction
   * This method trigger when user selected on reaction
   */
  public onSelectReaction(reactionValue) {
    this.selectedReaction = reactionValue;
  }

  /**
   * @function feedbackSkiporSubmit
   * This method is used to emit event when user clicks on confirm button
   */
  public feedbackSkiporSubmit() {
    this.onSubmitFeedback.next({ isSubmited: true, componentSequence: this.componentSequence });
  }

  /**
   * @function toggleInfo
   * This method is used to toggle info
   */
  public toggleInfo() {
    this.showAdditionalInfo = !this.showAdditionalInfo;
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
   * @function toggleAnswers
   * This method is used to toggle the answers
   */
  public toggleAnswers() {
    this.showAnswer = !this.showAnswer;
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
   * @function imageErrorHandler
   * This Method is used to set content thumbnail image error
   */
   public imageErrorHandler() {
    this.isThumbnailError = true;
  }
}
