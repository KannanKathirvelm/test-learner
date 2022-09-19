import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { slideUpAnimation } from '@shared/animations';
import { SelectedCategoryModel } from '@shared/models/offline-activity/offline-activity';
import { CategoriesModel, LevelModel, SelectedLevelModel } from '@shared/models/rubric/rubric';

@Component({
  selector: 'grade-rubric-category',
  templateUrl: './grade-rubric-category.component.html',
  styleUrls: ['./grade-rubric-category.component.scss'],
  animations: [
    slideUpAnimation
  ],
})
export class GradeRubricCategoryComponent implements OnInit, OnChanges {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public category: CategoriesModel;
  @Input() public categoryIndex: number;
  @Input() public disabled: boolean;
  @Input() public isCanceled: boolean;
  @Output() public selectedLevelScoring: EventEmitter<SelectedCategoryModel> = new EventEmitter();
  @Input() public isReportViewMode: boolean;
  public selectedScoreIndex: number;
  public isShowCategory: boolean;
  public isShowComment: boolean;
  public scoreInPercentage: number;
  public comments: string;
  public selectedLevel: SelectedLevelModel;
  public levels: Array<LevelModel>;
  public totalPoints: number;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor() {
    this.isShowCategory = false;
    this.isShowComment = false;
    this.scoreInPercentage = 0;
  }

  public ngOnInit() {
    this.levels = [...this.category.levels];
    this.totalPoints = Math.max(0, ...this.levels.map(level => level.score));
  }


  /**
   * This method is used to detect all changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    if (changes.isCanceled && changes.isCanceled.currentValue) {
      this.isCanceled = changes.isCanceled.currentValue;
      this.scoreInPercentage = 0;
      this.selectedScoreIndex = null;
      this.resetCatetoryLevels();
    }
    if (changes.category && changes.category.currentValue) {
      this.levels = [...this.category.levels];
      this.levels.map((categorylevel, levelIndex) => {
        if (categorylevel.isSelected) {
          this.onSelectGradeRadio(categorylevel, levelIndex);
          if (this.category.allowsScoring) {
            this.scoreInPercentage = categorylevel.scoreInPrecentage;
          }
        }
      });
      if (this.category.comment) {
        this.comments = this.category.comment;
        this.enterLevelComments();
      }
    }
  }

  // -------------------------------------------------------------------------
  // Actions

  /**
   * @function resetCatetoryLevels
   * This method is used to reset selected level
   */
  private resetCatetoryLevels() {
    this.levels.map((categorylevel) => {
      categorylevel.isChecked = false;
    });
  }

  /**
   * @function showProgressBar
   * This method is used to show the progress bar
   */
  public showProgressBar(level, levelIndex) {
    if (!this.disabled) {
      this.scoreInPercentage = level.scoreInPrecentage;
      this.selectedLevel = level;
      this.emitSelectedLevel(levelIndex, level);
    }
  }

  /**
   * @function onSelectGradeRadio
   * This method is used to set selected grade
   */
  public onSelectGradeRadio(level, selectedlevelIndex) {
    this.selectedLevel = level;
    this.levels.map((categorylevel, levelIndex) => {
      categorylevel.isChecked = selectedlevelIndex === levelIndex;
    });
    this.emitSelectedLevel(selectedlevelIndex, level);
  }

  /**
   * @function onSelectLevel
   * This method is used to set grade color and percentage
   */
  public onSelectLevel(selectedLevel) {
    const levelIndex = selectedLevel.levelIndex;
    const level = selectedLevel.level;
    if (selectedLevel.allowsScoring) {
      this.scoreInPercentage = selectedLevel.level.scoreInPrecentage;
      this.emitSelectedLevel(levelIndex, level);
    } else {
      this.levels.map((categorylevel, categorylevelIndex) => {
        categorylevel.isChecked = levelIndex === categorylevelIndex;
      });
      this.emitSelectedLevel(levelIndex, level);
    }
  }

  /**
   * @function emitSelectedLevel
   * This method is used to emit the selected level to parent
   */
  private emitSelectedLevel(levelIndex, level, comments?) {
    this.selectedScoreIndex = levelIndex;
    const levelComments = comments ? comments : null;
    this.selectedLevelScoring.emit({
      selectedLevel: this.parseCategoryLevel(level),
      selectCategoryIndex: this.categoryIndex,
      selectedLevelIndex: levelIndex,
      allowsScoring: this.category.allowsScoring,
      levelComments
    });
  }

  /**
   * @function parseCategoryLevel
   * This method is used to parse the level content
   */
  public parseCategoryLevel(level) {
    if (level) {
      return {
        description: level.description,
        name: level.name,
        score: level.score,
        allowsScoring: this.category.allowsScoring,
        scoreInPrecentage: level.scoreInPrecentage,
        categoryTitle: this.category.title,
        maxScore: this.category.maxScore
      };
    }
    return null;
  }

  /**
   * @function showCategory
   * This method is used to show the category section
   */
  public showCategory(category) {
    this.isShowCategory = !this.isShowCategory;
    if (this.isShowComment) {
      this.isShowComment = false;
    }
  }

  /**
   * @function showGradeComment
   * This method is used to show the comment section
   */
  public showGradeComment() {
    this.isShowComment = !this.isShowComment;
    if (this.isShowCategory) {
      this.isShowCategory = false;
    }
  }

  /**
   * @function enterLevelComments
   * This method is used to get the level comments
   */
  public enterLevelComments() {
    this.emitSelectedLevel(this.selectedScoreIndex, this.selectedLevel, this.comments);
  }
}
