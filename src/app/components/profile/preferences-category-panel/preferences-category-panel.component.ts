import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClassificationsModel } from '@models/preferences/preferences';

@Component({
  selector: 'preferences-category-panel',
  templateUrl: './preferences-category-panel.component.html',
  styleUrls: ['./preferences-category-panel.component.scss']
})
export class PreferencesCategoryPanelComponent {
  // -------------------------------------------------------------------------
  // Properties
  @Input() public classificationType: Array<ClassificationsModel>;
  @Output() public selectFramework: EventEmitter<{ frameworkId: string, subjectId: string }> = new EventEmitter();
  @Output() public deleteCategory = new EventEmitter<{ category: Array<ClassificationsModel>, classificationIndex: number }>();

  /**
   * @function onSelectFramework
   * Method to set the selected framework
   */
  public onSelectFramework(selectedSubject) {
    this.selectFramework.emit(selectedSubject);
  }

  /**
   * @function onDeleteCategory
   * Method to delete the selected category
   */
  public onDeleteCategory(category, classificationIndex) {
    this.deleteCategory.emit({ category, classificationIndex });
  }

}
