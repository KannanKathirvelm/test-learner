import { Component, ElementRef, EventEmitter, Input, OnInit } from '@angular/core';
import { FEEDBACK_CONTENT_TYPES } from '@shared/constants/helper-constants';
import { ContentModel } from '@shared/models/collection/collection';
import { CategoryModel } from '@shared/models/feedback/feedback';
import { SubContentModel } from '@shared/models/portfolio/portfolio';
import { FeedbackService } from '@shared/providers/service/feedback/feedback.service';
import { CollectionPlayerService } from '@shared/providers/service/player/collection-player.service';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'nav-image-resource',
  templateUrl: './image-resource.component.html',
  styleUrls: ['./image-resource.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 })]
})
export class ImageResourceComponent implements OnInit {
  // -------------------------------------------------------------------------
  // Properties
  @Input() public showResourcePreview: boolean;
  @Input() public content: ContentModel;
  public onStart: EventEmitter<string> = new EventEmitter();
  public onSubmitFeedback: EventEmitter<{ isSubmited: boolean, componentSequence: number }> = new EventEmitter();
  public onReaction: EventEmitter<number> = new EventEmitter();
  public onSelectResource: EventEmitter<number> = new EventEmitter();
  public onStopResource: EventEmitter<number> = new EventEmitter();
  @Input() public isPreview: boolean;
  public showAdditionalInfo: boolean;
  @Input() public componentSequence: number;
  @Input() public reportViewMode: boolean;
  @Input() public performance: SubContentModel;
  @Input() public disableConfirmBtn: boolean;
  @Input() public readonlyMode: boolean;
  @Input() public isActive: boolean;
  @Input() public isSubmit: boolean;
  @Input() public isNextQuestion: boolean;
  @Input() public isFeedback: boolean;
  @Input() public isRelatedContent: boolean;
  @Input() public isShowReaction: boolean;
  public showFeedback: boolean;
  public feedbackCategory: Array<CategoryModel>;
  public showReactions: boolean;
  public isQuestionAnswered: boolean;
  public showDefaultImage: boolean;
  public showResourseContent: boolean;
  public isThumbnailError: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private collectionPlayerService: CollectionPlayerService,
    private feedbackService: FeedbackService,
    // tslint:disable-next-line
    private elementReference: ElementRef) {
    this.showAdditionalInfo = true;
    this.showDefaultImage = true;
  }

  public ngOnInit() {
    if (!this.reportViewMode) {
      const contentType = FEEDBACK_CONTENT_TYPES[this.content.contentFormat];
      const feedbackCategories = this.feedbackService.feedbackCategories;
      this.feedbackCategory = feedbackCategories[contentType];
    }
    this.showResourseContent = !this.readonlyMode;
  }

  /**
   * @function onClickResource
   * This method triggers when user click on the resourse
   */
  public onClickResource() {
    if (!this.isSubmit) {
      this.onSelectResource.next(this.componentSequence);
    }
  }

  /**
   * @function onPlay
   * This method triggered when user play resource
   */
  public onPlay(event?) {
    if (event) {
      event.stopPropagation();
    }
    this.onStart.next(this.content.id);
    this.isQuestionAnswered = true;
    if (this.feedbackCategory.length) {
      this.showFeedback = true;
      this.showReactions = true;
    }
    if (this.isFeedback || this.isNextQuestion) {
      this.onClickResource();
    }
    this.onStopResource.next(this.componentSequence);
  }

  /**
   * @function onClickResourceIcon
   * This method is used to open resource while clicking on the resource icon
   */
  public onClickResourceIcon() {
    this.collectionPlayerService.openResourceContent(this.content, true);
  }

  /**
   * @function onClickToView
   * This method used to call when user click the content
   */
  public onClickToView() {
    if (!this.isActive && this.isFeedback && !this.isRelatedContent) {
      this.onClickResource();
    }
  }

  /**
   * @function onPlayContent
   * This method used to call when user click the related content
   */
  public onPlayContent() {
    if (this.isRelatedContent) {
      this.onPlay();
    }
  }

  /**
   * @function toggleResourseContent
   * This method used to show the resource content
   */
  public toggleResourseContent() {
    if (!this.isRelatedContent) {
      this.showResourseContent = this.readonlyMode ? !this.showResourseContent : true;
    }
  }

  /**
   * @function feedbackSkiporSubmit
   * This method triggered when feedback skip or submitted
   */
  public feedbackSkiporSubmit() {
    this.onSubmitFeedback.next({ isSubmited: true, componentSequence: this.componentSequence });
  }

  /**
   * @function onSelectReaction
   * This method trigger when user clicked on reaction
   */
  public onSelectReaction(reaction) {
    this.onReaction.next(reaction);
  }

  /**
   * @function toggleInfo
   * This method triggered when user click on toggle icon
   */
  public toggleInfo() {
    this.showAdditionalInfo = !this.showAdditionalInfo;
  }

  /**
   * @function imageErrorHandler
   * This Method is used to set content thumbnail image error
   */
   public imageErrorHandler() {
    this.isThumbnailError = true;
  }
}
