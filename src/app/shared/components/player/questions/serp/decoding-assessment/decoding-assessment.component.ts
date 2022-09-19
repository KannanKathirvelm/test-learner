import { Component, ElementRef, EventEmitter, Input, NgZone, OnInit } from '@angular/core';
import { fadeAnimation } from '@shared/animations';
import { FEEDBACK_CONTENT_TYPES } from '@shared/constants/helper-constants';
import { AnswerModel, ContentModel } from '@shared/models/collection/collection';
import { CategoryModel } from '@shared/models/feedback/feedback';
import { SubContentModel } from '@shared/models/portfolio/portfolio';
import { FeedbackService } from '@shared/providers/service/feedback/feedback.service';
import { MediaService } from '@shared/providers/service/media/media.service';
import { CollectionPlayerService } from '@shared/providers/service/player/collection-player.service';
import { SessionService } from '@shared/providers/service/session/session.service';
import { UtilsService } from '@shared/providers/service/utils/utils.service';
import { addHttpsProtocol, checkHttpUrl, cloneObject } from '@shared/utils/global';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'decoding-assessment',
  templateUrl: './decoding-assessment.component.html',
  styleUrls: ['./decoding-assessment.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 }), fadeAnimation]
})
export class DecodingAssessmentComponent implements OnInit {

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
  public selectedAnswer: AnswerModel;
  public isUploading: boolean;
  public sayOutLoudText: string;
  public timers: { [key: string]: { [key: string]: number } };
  public isThumbnailError: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private utilsService: UtilsService,
    private collectionPlayerService: CollectionPlayerService,
    private ngZone: NgZone,
    private sessionService: SessionService,
    private mediaService: MediaService,
    private feedbackService: FeedbackService,
    // tslint:disable-next-line
    private elementReference: ElementRef
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnInit() {
    this.timers = {};
    const answers = cloneObject(this.content.answer);
    if (this.reportViewMode) {
      this.showAnswer = false;
      this.checkUserAnswers(answers);
    } else {
      this.isQuestionAnswered = false;
      const contentType = FEEDBACK_CONTENT_TYPES[this.content.contentFormat];
      const feedbackCategories = this.feedbackService.feedbackCategories;
      this.feedbackCategory = feedbackCategories[contentType];
      this.answers = answers;
      this.setAnswersText();
    }
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
      this.answers.map((answerInput, index) => {
        const answeredObject = this.performance.answerObject.find((answer) => answer.order
          === (index + 1));
        const pattern = checkHttpUrl(answeredObject.answer_text);
        if (pattern) {
          answerInput.audioUrl = answeredObject.answer_text;
        }
        return answerInput;
      });
    }
  }

  /**
   * @function onShowCorrectAnswer
   * This method used to show correct answer
   */
  public onShowCorrectAnswer(value) {
    this.showCorrectAnswer = value;
    const answers = this.answers;
    this.checkUserAnswers(answers);
  }

  /**
   * @function checkUserAnswers
   * This method used to check user answers
   */
  public checkUserAnswers(answers) {
    this.answers = this.collectionPlayerService.checkSerpAudioAnswers(answers, this.performance, this.showCorrectAnswer, this.content.hintExplanationDetail);
  }

  /**
   * @function setAnswersText
   * This method is used to set answer text
   */
  public setAnswersText() {
    this.answers.forEach((answer) => {
      const answerText = answer.answer_text;
      answer.text = answerText;
      return answer;
    });
  }

  /**
   * @function onConfirm
   * This method is used to emit event when user clicks on confirm button
   */
  public onConfirm() {
    this.isUploading = true;
    this.uploadAudioToS3().then(() => {
      this.isUploading = false;
      this.onSubmitAnswer();
      this.afterQuestionAnswered();
      this.checkFeedback();
    });
  }

  /**
   * @function uploadAudioToS3
   * Method to upload audio to s3
   */
  private uploadAudioToS3() {
    const cdnUrl = this.sessionService.userSession.cdn_urls.content_cdn_url;
    const filesPromise = this.answers.map((answer: AnswerModel) => {
      return new Promise((resolve, reject) => {
        if (answer.audioBlob) {
          this.mediaService.uploadContentFile(answer.audioBlob, 'content', true).then((filename: string) => {
            answer.answer_text = addHttpsProtocol(filename, cdnUrl);
            resolve(answer);
          });
        } else {
          resolve(answer);
        }
      });

    });
    return Promise.all(filesPromise);
  }

  /**
   * @function onSubmitAnswer
   * This method is used to submit the answered value
   */
  private onSubmitAnswer() {
    this.onConfirmAnswer.next({
      answers: this.answers,
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
   * @function onClickRecording
   * This method is used to toggle recording
   */
  public onClickRecording(answer, index) {
    this.utilsService.checkMicrophoneAndStoragePermission();
    this.selectedAnswer = answer;
    if (!answer.vioceActivated) {
      answer.vioceActivated = true;
      this.pauseAudio(answer);
      this.startTimer(`record-${index}`);
    } else {
      answer.vioceActivated = false;
      this.stopTimer(`record-${index}`);
    }
    this.enableConfirm = true;
  }

  /**
   * @function recordedAudio
   * This method is used to record audio
   */
  public recordedAudio(event) {
    this.ngZone.run(() => {
      this.selectedAnswer.audioUrl = event.audioUrl;
      this.selectedAnswer.audioBlob = event.audioBlob;
    });
  }

  /**
   * @function playAudio
   * This method is used to play audio
   */
  public playAudio(answer, answerIndex) {
    answer.isAudioPlaying = true;
    answer.timerDuration = this.getTimespent(`record-${answerIndex}`) / 1000;
  }

  /**
   * @function pauseAudio
   * This method is used to pause audio
   */
  public pauseAudio(answer) {
    answer.isAudioPlaying = false;
  }

  /**
   * @function startTimer
   * This Method to initialize a label/id based timer
   */
  public startTimer(label) {
    this.timers[label] = {
      start: window.performance.now()
    };
  }

  /**
   * @function stopTimer
   * This Method to stop running label/id based timer
   */
  public stopTimer(label) {
    this.timers[label]['end'] = window.performance.now();
  }

  /**
   * @function getTimespent
   * This Method to get duration in millisec by label/id
   */
  public getTimespent(label) {
    if (this.timers[label]) {
      return this.timers[label].end - this.timers[label].start;
    }
    return 0;
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
