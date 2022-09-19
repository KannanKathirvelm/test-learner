import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { EvidenceModel } from '@app/shared/models/performance/performance';
import { fadeAnimation } from '@shared/animations';
import {
  ATTEMP_STATUS,
  FEEDBACK_CONTENT_TYPES,
} from '@shared/constants/helper-constants';
import { AnswerModel, ContentModel } from '@shared/models/collection/collection';
import { CategoryModel } from '@shared/models/feedback/feedback';
import { SubContentModel } from '@shared/models/portfolio/portfolio';
import { FeedbackService } from '@shared/providers/service/feedback/feedback.service';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'fill-in-the-blanks',
  templateUrl: './fill-in-the-blanks.component.html',
  styleUrls: ['./fill-in-the-blanks.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 }), fadeAnimation],
})
export class FillInTheBlanksComponent implements OnInit, AfterViewInit {
  // -------------------------------------------------------------------------
  // Properties
  @ViewChild('questionElementRef', { read: ElementRef, static: false })
  public questionElement: ElementRef;
  @Input() public content: ContentModel;
  @Input() public isBidirectionalPlay: boolean;
  @Input() public isPreview: boolean;
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
  @Input() public isFeedback: boolean;
  @Input() public isActive: boolean;
  @Input() public isNextQuestion: boolean;
  @Input() public isShowReaction: boolean;
  @Input() public isShowEvidence: boolean;
  @Input() public isHideAnswerDetails: boolean;
  public onConfirmAnswer: EventEmitter<{
    componentSequence: number,
    answers: Array<AnswerModel>,
    reaction: number,
    evidence: Array<EvidenceModel>
  }> = new EventEmitter();
  public showAnswer: boolean;
  public showAdditionalInfo: boolean;
  public isDisabled: boolean;
  public answerInputs: Array<{
    answer_text: string;
    top: number;
    left: number;
    status?: string;
    order: number;
    type?: string;
  }>;
  public question: string;
  public enableConfirm: boolean;
  public INPUT_TAG = '<span class="invisble-fib-question"></span>';
  public FIB_REGEX = {
    global: /(\[.*?\])|_______*/g,
  };
  public averageScore: number;
  public description: string;
  public showFeedback: boolean;
  public feedbackCategory: Array<CategoryModel>;
  public isQuestionAnswered: boolean;
  public hideConfirmButton: boolean;
  private selectedReaction: number;
  public alreadyPlayed: boolean;
  public isMathjaxEquation: boolean;
  private readonly MATHJAXPATTERN = /(?:(?:^|[-+_*/])(?:\s*-?\d+(\.\d+)?(?:[eE][+-]?\d+)?\s*))+$/;
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
    this.answerInputs = [];
    this.hideConfirmButton = false;
    this.enableConfirm = false;
  }

  // -------------------------------------------------------------------------
  // Events
  public ngOnInit() {
    const description = this.content.description;
    this.description = description.replace(this.FIB_REGEX.global, '');
    this.question = description.replace(
      this.FIB_REGEX.global,
      this.INPUT_TAG
    );
    this.isMathjaxEquation = this.MATHJAXPATTERN.test(this.question);
    if (this.reportViewMode) {
      this.evidenceFile = this.performance ? this.performance.evidence : [];
      this.showAnswer = false;
      this.averageScore = this.performance
        ? this.performance.averageScore
        : null;
    } else {
      this.isQuestionAnswered = false;
      const contentType =
        FEEDBACK_CONTENT_TYPES[this.content.contentFormat];
      const feedbackCategories = this.feedbackService.feedbackCategories;
      this.feedbackCategory = feedbackCategories[contentType];
    }
  }

  public ngAfterViewInit() {
    if (!this.isMathjaxEquation) {
      setTimeout(() => {
        this.mathjaxRendered();
      }, 1000);
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
   * @function mathjaxRendered
   * This method is used trigger when mathjax is rendered
   */
  public mathjaxRendered() {
    const questionElements = this.questionElement.nativeElement.querySelectorAll(
      '.invisble-fib-question'
    );
    questionElements.forEach((element: HTMLElement, index) => {
      const answers = this.content.answer;
      let answerType = 'text';
      if (answers && answers.length) {
        const answerContent = this.content.answer[index];
        if (answerContent) {
          const itemAnswer = Number(answerContent.answer_text);
          answerType = isNaN(itemAnswer) ? 'text' : 'number';
        }
      }
      const userAnswerExists =
        this.performance &&
        this.performance.answerObject &&
        this.performance.answerObject.length;
      this.answerInputs.push({
        answer_text: userAnswerExists
          ? this.performance.answerObject[index].answer_text
          : '',
        status: userAnswerExists
          ? this.performance.answerObject[index].status
          : null,
        top: element.offsetTop,
        left: element.offsetLeft,
        order: index + 1,
        type: answerType,
      });
    });
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
    this.isDisabled =
      !this.isBidirectionalPlay &&
      this.showAnswer &&
      !this.isQuestionAnswered;
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
   * @function onShowLastPlayedAnswer
   * This method is used to show last answered value
   */
  public onShowLastPlayedAnswer() {
    if (
      this.performance.answerObject &&
      this.performance.answerObject.length
    ) {
      this.afterQuestionAnswered();
      this.checkFeedback();
      this.answerInputs.map((answerInput, index) => {
        const answeredObject = this.performance.answerObject.find(
          (answer) => answer.answerId === index.toString()
        );
        if (answeredObject) {
          answerInput.answer_text = answeredObject.answer_text;
        }
        return answerInput;
      });
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
   * @function feedbackSkiporSubmit
   * This method is used to emit event when user clicks on confirm button
   */
  public feedbackSkiporSubmit() {
    this.onSubmitFeedback.next({ isSubmited: true, componentSequence: this.componentSequence });
  }

  /**
   * @function notifyInputAnswers
   * This method triggers when user types in answer input
   */
  public notifyInputAnswers() {
    const answerInputs = this.answerInputs;
    const answerInputWithAnswer = answerInputs.filter((answer) => {
      return answer.answer_text.length > 0;
    });
    this.enableConfirm = answerInputWithAnswer.length > 0;
  }

  /**
   * @function onShowCorrectAnswer
   * This method used to show correct answer
   */
  public onShowCorrectAnswer(value) {
    if (value) {
      this.answerInputs.map((answer, index) => {
        const answers = this.content.answer;
        const userAnswer = answers.find(
          (item) => item.sequence === answer.order
        );
        answer.answer_text = userAnswer ? userAnswer.answer_text : '';
        answer.status = ATTEMP_STATUS.CORRECT;
      });
    } else {
      if (this.performance.answerObject) {
        const userAnswerExists =
          this.performance && this.performance.answerObject.length;
        this.answerInputs.map((answer, index) => {
          answer.answer_text = userAnswerExists
            ? this.performance.answerObject[index].answer_text
            : '';
          answer.status = userAnswerExists
            ? this.performance.answerObject[index].status
            : '';
        });
      }
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
   * @function imageErrorHandler
   * This Method is used to set content thumbnail image error
   */
   public imageErrorHandler() {
    this.isThumbnailError = true;
  }
}
