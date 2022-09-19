import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StandardFrameworkModel, SubjectsModel } from '@models/preferences/preferences';

@Component({
  selector: 'preferences-framework-panel',
  templateUrl: './preferences-framework-panel.component.html',
  styleUrls: ['./preferences-framework-panel.component.scss'],
})
export class PreferenceFrameworkPanelComponent implements OnInit {

  @Input() public subject: SubjectsModel;
  @Output() public selectFramework: EventEmitter<{ frameworkId: string, subjectId: string }> = new EventEmitter();
  public activeFramework: StandardFrameworkModel;
  private selectedFramework: StandardFrameworkModel;

  public ngOnInit() {
    const standardFrameworkId = this.subject.value;
    this.activeFramework = { standardFrameworkId };
    this.selectedFramework = { standardFrameworkId };
  }
  /**
   * @function compareWithCode
   * This method is used to check the code
   */
  public compareWithCode(item1, item2) {
    return item1.standardFrameworkId === item2.standardFrameworkId;
  }

  /**
   * @function onSelectFramework
   * Method to set the selected framework
   */
  public onSelectFramework(item) {
    const frameworkId = item.detail.value.standardFrameworkId;
    if (frameworkId && frameworkId !== this.selectedFramework.standardFrameworkId) {
      this.selectedFramework = item.detail.value;
      const subjectId = this.subject.id;
      const selectedSubject = {
        frameworkId,
        subjectId
      };
      this.selectFramework.emit(selectedSubject);
    }
  }
}
