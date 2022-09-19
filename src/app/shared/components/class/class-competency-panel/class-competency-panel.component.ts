import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { EVENTS } from '@app/shared/constants/events-constants';
import { ClassService } from '@app/shared/providers/service/class/class.service';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { routerPathIdReplace } from '@shared/constants/router-constants';
import { ClassCompetencySummaryModel } from '@shared/models/competency/competency';

@Component({
  selector: 'class-competency-panel',
  templateUrl: './class-competency-panel.component.html',
  styleUrls: ['./class-competency-panel.component.scss'],
})
export class ClassCompetencyPanelComponent implements OnChanges {

  @Input() public isCompetencyPerformanceLoaded: boolean;
  @Input() public compentencyPerformance: ClassCompetencySummaryModel;
  @Input() public classId: string;
  @Input() public baseMasteredCompetencies: number;
  public completedCompetencyPercentage: number;
  public numberOfCompetencies: number;
  public completedCompetencies: number;
  public isShowCompletedCompetencies: boolean;

  constructor(private router: Router, private parseService: ParseService, private classService: ClassService) {
    this.completedCompetencyPercentage = 0;
    this.numberOfCompetencies = 0;
    this.completedCompetencies = 0;
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.baseMasteredCompetencies && changes.baseMasteredCompetencies.currentValue) {
      this.calculateCompetencyStats();
    }
    if (changes.compentencyPerformance && changes.compentencyPerformance.currentValue) {
      this.calculateCompetencyStats();
    }
  }

  /**
   * @function calculateCompetencyStats
   * This method is used to calculate competency stats
   */
  private calculateCompetencyStats() {
    if (this.baseMasteredCompetencies) {
      this.completedCompetencies = (this.compentencyPerformance.completedCompetencies - this.baseMasteredCompetencies);
      this.numberOfCompetencies = (this.compentencyPerformance.totalCompetencies - this.baseMasteredCompetencies);
      const completedCompetencies = this.completedCompetencies;
      const numberOfCompetencies = this.numberOfCompetencies;
      this.completedCompetencyPercentage = completedCompetencies / numberOfCompetencies;
      this.isShowCompletedCompetencies = this.compentencyPerformance.completedCompetencies !== this.compentencyPerformance.totalCompetencies;
    } else {
      if (this.compentencyPerformance) {
        this.completedCompetencyPercentage = this.compentencyPerformance.completedCompetencies / this.compentencyPerformance.totalCompetencies;
      }
    }
  }

  /**
   * @function navigateToProficiency
   * This method is used to navigate to proficiency
   */
  public navigateToProficiency() {
    const proficiencyURL = routerPathIdReplace('proficiency', this.classId);
    this.router.navigate([proficiencyURL]);
    this.trackSelectProficiencyEvent();
  }

  /*
   * @function trackSelectProficiencyEvent
   * This method is used to track proficiency event
  */
  public trackSelectProficiencyEvent() {
    const context = this.getProficiencyEventContext();
    this.parseService.trackEvent(EVENTS.CLICK_PROFICIENCY_CHARTS_SELECT_MONTH, context);
  }

  /*
   * @function getProficiencyEventContext
   * This method is used to get the context for Proficiency event
  */
  public getProficiencyEventContext() {
    const classDetails = this.classService.class;
    return {
      classId: classDetails.id,
      className: classDetails.title,
      courseId: classDetails.course_id,
      premiumClass: classDetails.isPremiumClass,
      publicClass: classDetails.isPublic
    };
  }
}
