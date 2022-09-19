import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MicroCompetenciesModel, PrerequisitesModel } from '@shared/models/competency/competency';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.scss'],
  animations: [
    collapseAnimation()
  ]
})
export class MetaDataComponent implements OnChanges {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public microCompetencies: Array<MicroCompetenciesModel>;
  @Input() public prerequisites: Array<PrerequisitesModel>;
  public showCompetency: boolean;
  public competencies: Array<MicroCompetenciesModel>;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor() {
    this.showCompetency = false;
  }

  // -------------------------------------------------------------------------
  // Events

  /**
   * This method is used to set values when the data changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    if (changes.microCompetencies) {
      const changedCompetency = changes.microCompetencies.currentValue;
      if (changedCompetency) {
        const microCompetencies = [...changedCompetency];
        const parsedCompetency = this.setDefaultMicroCompetencies(microCompetencies);
        this.competencies = parsedCompetency;
      }
    }
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function setDefaultCategoryLevels
   * This method is used to set the default state of levels
   */
  private setDefaultMicroCompetencies(competencies) {
    return competencies.map((code) => {
      code.isActive = false;
      return code;
    });
  }

  /**
   * @function onClickMicroCompetency
   * This method is used to set active state on competency click
   */
  public onClickMicroCompetency(selectedIndex) {
    this.competencies.map((code, index) => {
      if (index === selectedIndex) {
        code.isActive = !code.isActive;
      }
    });
  }
}
