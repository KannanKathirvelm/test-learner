import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit } from '@angular/core';
import { fadeAnimation } from '@shared/animations';
import { FEEDBACK_CONTENT_TYPES } from '@shared/constants/helper-constants';
import { AnswerModel, ContentModel } from '@shared/models/collection/collection';
import { CategoryModel } from '@shared/models/feedback/feedback';
import { SubContentModel } from '@shared/models/portfolio/portfolio';
import { FeedbackService } from '@shared/providers/service/feedback/feedback.service';
import { collapseAnimation } from 'angular-animations';
import { DragulaService } from 'ng2-dragula';

@Component({
  selector: 'sorting',
  templateUrl: './sorting.component.html',
  styleUrls: ['./sorting.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 }), fadeAnimation]
})
export class SortingComponent implements OnInit, OnDestroy {

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
  @Input() set questionAnswered(value: boolean) {
    if (value) {
      this.afterQuestionAnswered();
    }
  }
  @Input() public reportViewMode: boolean;
  @Input() public performance: SubContentModel;
  @Input() public isSubmit: boolean;
  @Input() public componentSequence: number;
  @Input() public disableConfirmBtn: boolean;
  @Input() public isActive: boolean;
  @Input() public isComprehension: boolean;
  @Input() public isFeedback: boolean;
  @Input() public isNextQuestion: boolean;
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
  public answers: Array<{
    answerType: string;
    title: string;
    items: Array<AnswerModel>;
  }>;
  public averageScore: number;
  public showCorrectAnswer: boolean;
  public enableConfirm: boolean;
  public showFeedback: boolean;
  public feedbackCategory: Array<CategoryModel>;
  public isQuestionAnswered: boolean;
  public hideConfirmButton: boolean;
  public sortingColumnName: string;
  public sortingItemsName: string;
  private selectedReaction: number;
  public onSubmitFeedback: EventEmitter<{ isSubmited: boolean, componentSequence: number }> = new EventEmitter();
  public onSelectQuestion: EventEmitter<number> = new EventEmitter();
  public isThumbnailError: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private dragulaService: DragulaService,
    private feedbackService: FeedbackService,
    // tslint:disable-next-line
    private elementReference: ElementRef
  ) {
    this.hideConfirmButton = false;
    this.showAdditionalInfo = true;
  }

  // -------------------------------------------------------------------------
  // Events
  public ngOnInit() {
    const isComprehension = this.isComprehension;
    const columnName = `${this.reportViewMode ? 'report' : 'question'}_${isComprehension ? 'comprehension' : 'not_comprehension'}`;
    this.sortingColumnName = `${columnName}_sorting_colums_${this.componentSequence}`;
    this.sortingItemsName = `${columnName}_sorting_items_${this.componentSequence}`;
    this.dragulaService.createGroup(this.sortingColumnName, {
      direction: 'horizontal',
      moves: (el, container, handle) => {
        this.enableConfirm = true;
        return handle.className === 'handle';
      }
    });
    this.initializeAnswers();
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
  }

  public ngOnDestroy() {
    this.dragulaService.destroy(this.sortingColumnName);
  }

  /**
   * @function initializeAnswers
   * This method used to intialize answers
   */
  public initializeAnswers() {
    const titleMetadata = this.content.player_metadata ?
      this.content.player_metadata.additional_attributes : null;
    this.answers = [{
      answerType: 'hard',
      title: titleMetadata ? titleMetadata['hard_text'] : null,
      items: []
    }, {
      answerType: 'not-sorted',
      title: '',
      items: []
    }, {
      answerType: 'soft',
      title: titleMetadata ? titleMetadata['soft_text'] : null,
      items: []
    }];
    this.setSortingAnswers();
  }

  /**
   * @function setSortingAnswers
   * This method used to set sorting answers
   */
  public setSortingAnswers() {
    const sortingItems = this.getNotSortedItems();
    this.content.answer.forEach((answer, index) => {
      this.pushIntoSortingObjects(sortingItems, answer, index);
    });
  }

  /**
   * @function pushIntoSortingObjects
   * This method used to push into sorting answers
   */
  public pushIntoSortingObjects(sortingItems, answer, index) {
    try {
      const sortingItem = { ...answer, answerIndex: index };
      sortingItem.text = answer.answer_text;
      // To pass the correct answers as answer text to the stop event
      const correctAnswer = answer.correct_answer.map((item) => JSON.parse(item));
      sortingItem.answer_text = JSON.stringify(correctAnswer);
      sortingItems.items.push(sortingItem);
    } catch (error) {
      // tslint:disable-next-line
      console.log(error);
    }
  }

  /**
   * @function getCorrectAnswers
   * This method used to get correct answers
   */
  public getCorrectAnswers() {
    let selectedAnswers = [];
    this.answers.forEach((payload) => {
      const answerType = payload.answerType;
      const answers = this.getSelectedAnswers(payload.items, answerType);
      selectedAnswers = selectedAnswers.concat(answers);
    });
    selectedAnswers.sort((answer1, answer2) => answer1.answerIndex - answer2.answerIndex);
    return selectedAnswers;
  }

  /**
   * @function getSelectedAnswers
   * This method used to get selected answers
   */
  public getSelectedAnswers(answers, answerType) {
    return answers.map((answer) => {
      answer.is_correct = answer.answer_type === answerType;
      const answerText = JSON.parse(answer.answer_text);
      // Here we are updating the answer type in answer text of user selecting data
      answerText[0].answer_type = answerType !== 'not-sorted' ? answerType : null;
      answer.answer_text = JSON.stringify(answerText);
      return answer;
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
    const selectedAnswers = this.getCorrectAnswers();
    this.onConfirmAnswer.next({
      answers: selectedAnswers,
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
    this.initializeAnswers();
    this.checkUserAnswers();
  }

  /**
   * @function onShowLastPlayedAnswer
   * This method is used to show last answered value
   */
  public onShowLastPlayedAnswer() {
    if (this.performance.answerObject && this.performance.answerObject.length) {
      this.afterQuestionAnswered();
      this.checkFeedback();
      const sortingGroup = this.getNotSortedItems();
      sortingGroup.items.map((sortingAnswer, index) => {
        this.getUserPlayedAnswerText(index, sortingAnswer);
      });
      const notSortedItems = sortingGroup.items.filter((item) => item.isNotSorted);
      sortingGroup.items = notSortedItems;
    }
  }

  /**
   * @function getUserPlayedAnswerText
   * This method used to get answers
   */
  public getUserPlayedAnswerText(answerIndex, sortingAnswer) {
    this.performance.answerObject.forEach((answer, performanceIndex) => {
      if (performanceIndex === answerIndex) {
        this.setAnswerPerformance(answer, sortingAnswer);
      }
    });
  }

  /**
   * @function setAnswerPerformance
   * This method used to set answers
   */
  public setAnswerPerformance(answer, sortingAnswer?) {
    const answerPerformance = sortingAnswer || answer;
    const correctAnswers = JSON.parse(answer.answer_text);
    const answerType = correctAnswers[0].answer_type;
    if (answerType) {
      const answerGroup = this.answers.find((item) => item.answerType === answerType);
      answerGroup.items.push(answerPerformance);
    } else {
      answerPerformance.isNotSorted = true;
    }
  }

  /**
   * @function getNotSortedItems
   * This method used to get sorted answers
   */
  public getNotSortedItems() {
    return this.answers.find((item) => item.answerType === 'not-sorted');
  }

  /**
   * @function checkUserAnswers
   * This method used to check user answers
   */
  public checkUserAnswers() {
    const sortingGroup = this.getNotSortedItems();
    sortingGroup.items.map((sortingAnswer, index) => {
      if (this.showCorrectAnswer) {
        this.setAnswerPerformance(sortingAnswer);
      } else {
        this.getUserPlayedAnswerText(index, sortingAnswer);
      }
    });
    const notSortedItems = sortingGroup.items.filter((item) => item.isNotSorted);
    sortingGroup.items = notSortedItems;
  }

  /**
   * @function imageErrorHandler
   * This Method is used to set content thumbnail image error
   */
   public imageErrorHandler() {
    this.isThumbnailError = true;
  }
}
