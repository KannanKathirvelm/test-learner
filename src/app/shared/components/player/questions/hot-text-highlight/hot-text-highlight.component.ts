import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
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
  selector: 'hot-text-highlight',
  templateUrl: './hot-text-highlight.component.html',
  styleUrls: ['./hot-text-highlight.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 }), fadeAnimation],
})
export class HotTextHighlightComponent implements OnInit {
  // -------------------------------------------------------------------------
  // Properties
  public alreadyPlayed: boolean;
  @Input() public isPreview: boolean;
  @Input() public content: ContentModel;
  @Input() public isBidirectionalPlay: boolean;
  @Input() set isCurrentPlay(value: boolean) {
    this.onCurrentPlay(value);
  }
  @Input() public reportViewMode: boolean;
  @Input() public performance: SubContentModel;
  @Input() public isSubmit: boolean;
  @Input() set isShowCorrectAnswer(value: boolean) {
    this.onShowCorrectAnswer(value);
  }
  @Input() set showLastPlayedAnswer(value: boolean) {
    this.alreadyPlayed = value;
    if (this.performance && value) {
      this.onShowLastPlayedAnswer();
    }
  }
  @Input() public componentSequence: number;
  public onConfirmAnswer: EventEmitter<{
    componentSequence: number,
    answers: Array<AnswerModel>,
    reaction: number,
    evidence: Array<EvidenceModel>
  }> = new EventEmitter();
  @Input() public disableConfirmBtn: boolean;
  @Input() public isActive: boolean;
  @Input() public isNextQuestion: boolean;
  @Input() public isFeedback: boolean;
  @Input() public isShowReaction: boolean;
  @Input() public isShowEvidence: boolean;
  @Input() public isHideAnswerDetails: boolean;
  public showAnswer: boolean;
  public showAdditionalInfo: boolean;
  public isDisabled: boolean;
  public enableConfirm: boolean;
  public answers: Array<{
    index: number;
    answer_text: string;
    selected: boolean;
    is_correct: number;
  }>;
  public HIGHLIGHT_WORD_TYPE = 'word';
  public BRACKET_REGEX = {
    global: /\[([^[]*)\]/g,
  };
  public averageScore: number;
  public showCorrectAnswer: boolean;
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
    private collectionPlayerService: CollectionPlayerService,
    private feedbackService: FeedbackService,
    // tslint:disable-next-line
    private elementReference: ElementRef
  ) {
    this.answers = [];
    this.hideConfirmButton = false;
    this.showAdditionalInfo = true;
  }

  // -------------------------------------------------------------------------
  // Events
  public ngOnInit() {
    if (!this.reportViewMode) {
      this.evidenceFile = this.performance ? this.performance.evidence : [];
      this.isQuestionAnswered = false;
    }
    const answers = [...this.content.answer];
    this.splitAnswer(answers);
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
    const selectedAnswers = this.answers.filter((answer) => {
      return answer.selected;
    });
    const answers = [];
    selectedAnswers.forEach((selectedAnswer) => {
      answers.push({
        answer_text: selectedAnswer.answer_text,
        is_correct: selectedAnswer.is_correct ? 1 : 0,
        sequence: selectedAnswer.index,
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
      this.answers.map((answerInput, index) => {
        const answeredObject = this.performance.answerObject.find(
          (answer) => answer.order === answerInput.index
        );
        if (answeredObject) {
          answerInput.selected = true;
        }
        return answerInput;
      });
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
   * @function feedbackSkiporSubmit
   * This method is used to emit event when user clicks on confirm button
   */
  public feedbackSkiporSubmit() {
    this.onSubmitFeedback.next({ isSubmited: true, componentSequence: this.componentSequence });
  }

  /**
   * @function answerSelect
   * This method triggered when user select the answer
   */
  public answerSelect(answer) {
    answer.selected = !answer.selected;
    const isSelected = this.answers.find((answerItem) => {
      return answerItem.selected;
    });
    this.enableConfirm = isSelected ? true : false;
  }

  /**
   * @function transformText
   * This method is used to transform the text
   */
  public transformText(text) {
    const match = /^<p>(.*)<\/p>$/gm.exec(text);
    return match ? match[1].trim() : text;
  }

  /**
   * @function splitAnswer
   * This method is used to split the answer based on type
   */
  public splitAnswer(answers) {
    answers.map((answer) => {
      const text = this.transformText(answer.answer_text);
      this.answers =
        answer.highlight_type === this.HIGHLIGHT_WORD_TYPE
          ? this.getWordItems(answer)
          : this.getSentenceItems(text);
    });
    if (this.reportViewMode) {
      this.showAnswer = false;
      this.averageScore = this.performance
        ? this.performance.averageScore
        : null;
      this.checkUserAnswers(this.answers);
    } else {
      const contentType =
        FEEDBACK_CONTENT_TYPES[this.content.contentFormat];
      const feedbackCategories = this.feedbackService.feedbackCategories;
      this.feedbackCategory = feedbackCategories[contentType];
    }
  }

  /**
   * @function getWordItems
   * This method is used to get word items
   */

  public getWordItems(answer) {
    return this.toItems(this.splitWithIndex(answer.answer_text, ' '));
  }

  /**
   * @function getSentenceItems
   * This method is used to sentences items
   */
  public getSentenceItems(text) {
    return this.toItems(
      this.splitWithIndex(text
        .replace(/\.\]/gm, ']@')
        .replace(/\./gm, '.@')
        .replace(/\?/gm, '?@')
        .replace(/!/gm, '!@')
        .replace(/: /gm, ': @')
        .replace(/\./gm, '.@'), '@')
    );
  }

  /**
   * @function isCorrectAnswer
   * This method is used to check the correct answer
   */
  public correctAnswerStatus(text) {
    return text.match(/\[[^\]]*]/g) ? 1 : 0;
  }

  /**
   * @function splitWithIndex
   * This method is used to split with index
   */
  public splitWithIndex(text, delim) {
    const regex = new RegExp(delim);
    let remainingText = text;
    const result = [];
    let index = 0;
    let nextSplit = regex.exec(remainingText);
    while (nextSplit) {
      const currentText = remainingText.slice(0, nextSplit.index);
      remainingText = remainingText
        .slice(nextSplit.index)
        .replace(nextSplit[0], '');
      result.push({
        text: currentText,
        index,
      });
      index += nextSplit.index + nextSplit[0].length;
      nextSplit = regex.exec(remainingText);
    }
    if (index < text.length) {
      result.push({
        text: remainingText,
        index,
      });
    }
    return result;
  }

  /**
   * @function toItems
   * This method is used to normalize the items
   */
  public toItems(textList) {
    const answerList = textList.filter((item) => {
      return !!item.text.trim();
    });
    return answerList.map((item, index) => {
      const checkAnswerStatus = this.correctAnswerStatus(item.text);
      const answerText = item.text.replace('[', '').replace(']', '');
      const order = item.index + item.text.search(/\S/);
      return {
        index: order,
        answer_text: answerText.trim(),
        selected: false,
        sequence: order,
        is_correct: checkAnswerStatus
      };
    });
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
    this.answers = this.collectionPlayerService.checkUserAnswers(
      answers,
      this.performance,
      this.showCorrectAnswer
    );
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
