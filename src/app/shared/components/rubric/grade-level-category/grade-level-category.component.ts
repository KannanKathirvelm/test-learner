import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LevelModel, SelectedLevelModel } from '@shared/models/rubric/rubric';

@Component({
  selector: 'grade-level-category',
  templateUrl: './grade-level-category.component.html',
  styleUrls: ['./grade-level-category.component.scss'],
})
export class GradeLevelCategoryComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public level: LevelModel;
  @Input() public allowsScoring: boolean;
  @Input() public levelIndex: number;
  @Input() set selectedlevelIndex(selectedlevelIndex: number) {
    this.isSelected = selectedlevelIndex === this.levelIndex;
  }
  @Output() public selectLevel: EventEmitter<SelectedLevelModel> = new EventEmitter();
  public isSelected: boolean;

  // -------------------------------------------------------------------------
  // Actions

  /**
   * @function selectLevel
   * This method is used to set the selected category
   */
  public onSelectLevel() {
    this.isSelected = true;
    const selectLevel = {
      level: this.level,
      allowsScoring: this.allowsScoring,
      levelIndex: this.levelIndex
    };
    this.selectLevel.emit(selectLevel);
  }
}
