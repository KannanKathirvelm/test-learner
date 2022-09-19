import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { SelectedCategoryModel } from '@shared/models/offline-activity/offline-activity';
import { RubricModel } from '@shared/models/rubric/rubric';

@Component({
  selector: 'rubric-report',
  templateUrl: './rubric-report.component.html',
  styleUrls: ['./rubric-report.component.scss']
})

export class RubricComponent implements OnInit, OnChanges {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public rubric: RubricModel;
  @Input() public studentScore: number;
  @Input() public isCanceled: boolean;
  @Input() public disabled: boolean;
  @Input() public isPreview: boolean;
  @Output() public selectCategory: EventEmitter<SelectedCategoryModel> = new EventEmitter();
  @Output() public generalComments: EventEmitter<string> = new EventEmitter();
  @Input() public isReportViewMode: boolean;
  public totalRubricPoints: number;
  public scoreInPercentage: number;
  public comments: string;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor() {
    this.totalRubricPoints = 0;
  }

  /**
   * This method is used to set the rubric points
   */
  public ngOnInit() {
    this.totalRubricPoints = this.rubric.maxScore;
  }

  /**
   * This method is used to detect all changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    if (changes.studentScore && changes.studentScore.currentValue) {
      this.studentScore = changes.studentScore.currentValue;
      this.totalRubricPoints = this.rubric.maxScore;
      this.scoreInPercentage = Math.floor((changes.studentScore.currentValue / this.totalRubricPoints) * 100);
    }
    if (changes.rubric && changes.rubric.currentValue) {
      if (this.rubric.comment) {
        this.comments = this.rubric.comment;
        this.onEnterGeneralComments();
      }
    }
    if (changes.isCanceled && changes.isCanceled.currentValue) {
      this.isCanceled = changes.isCanceled.currentValue;
      this.studentScore = 0;
      this.scoreInPercentage = null;
    }
  }

  /**
   * @function onSelectLevel
   * This method is used to get the selected level
   */
  public onSelectLevel(level) {
    this.selectCategory.emit(level);
  }

  /**
   * @function onEnterGeneralComments
   * This method is used to get the overallComment
   */
  public onEnterGeneralComments() {
    this.generalComments.emit(this.comments);
  }
}
