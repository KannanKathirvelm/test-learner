import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { EVENTS } from '@app/shared/constants/events-constants';
import { TaxonomyGrades } from '@app/shared/models/taxonomy/taxonomy';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { CLASS_SKYLINE_INITIAL_DESTINATION } from '@shared/constants/helper-constants';
import { ClassCompetencySummaryModel } from '@shared/models/competency/competency';
import { PerformanceModel } from '@shared/models/performance/performance';

@Component({
  selector: 'milestone-panel',
  templateUrl: './milestone-panel.component.html',
  styleUrls: ['./milestone-panel.component.scss']
})
export class MilestonePanelComponent implements OnChanges, OnInit {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public title: string;
  @Input() public competencyCount: number;
  @Input() public computedEtlTime: string;
  @Input() public milestoneCount: number;
  @Input() public totalLessonsCount: number;
  @Input() public baseMasteredCompetencies: number;
  @Input() public state: string;
  @Input() public isPublic: boolean;
  @Input() public startCourse: boolean;
  @Input() public isDisabled: boolean;
  @Input() public isLoading: boolean;
  @Input() public showPerformance: boolean;
  @Input() public isIlpInProgress: boolean;
  @Input() public showPublicClassDiagnostic: boolean;
  @Input() public classPerformance: PerformanceModel;
  @Input() public compentencyPerformance: ClassCompetencySummaryModel;
  @Output() public toggleInfo = new EventEmitter();
  @Output() public lessonList = new EventEmitter();
  @Output() public clickStart = new EventEmitter();
  @Output() public clickDirection = new EventEmitter();
  @Output() public diagnosticPlay = new EventEmitter();
  @Output() public clickProficiency = new EventEmitter();
  @Output() public skipDiagnostic = new EventEmitter();
  @Output() public publicClassDiagnosticPlay = new EventEmitter();
  @Output() public openJourneyReport = new EventEmitter();
  @Input() public defaultGradeLevel: number;
  @Input() public studentDestinationLevel: TaxonomyGrades;
  @Input() public isAllContentsAreRescoped: boolean;
  @Input() public enableNavigatorProgram: boolean;
  public isShowCourseMap: boolean;
  public isShowDirections: boolean;
  public isShowDiagnosticPlay: boolean;
  public isBaseLineInProgress: boolean;
  public numberOfCompetencies: number;
  public completedCompetencies: number;
  public isShowCompletedCompetencies: boolean;
  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor( private parseService: ParseService) { }

  public ngOnInit() {
    this.numberOfCompetencies = 0;
    this.completedCompetencies = 0;
    this.parseService.trackEvent(EVENTS.VIEW_MILESTONE);
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.baseMasteredCompetencies && changes.baseMasteredCompetencies.currentValue) {
      this.computeCompetencyStats();
    }
    if (changes.compentencyPerformance && changes.compentencyPerformance.currentValue) {
      this.computeCompetencyStats();
    }
    if (changes.showPublicClassDiagnostic && changes.showPublicClassDiagnostic.currentValue) {
      this.isShowCourseMap = false;
      this.isShowDirections = false;
      this.isShowDiagnosticPlay = false;
      this.isBaseLineInProgress = false;
    }
    if (changes.state && changes.state.currentValue) {
      const destination = this.state;
      if (destination === CLASS_SKYLINE_INITIAL_DESTINATION.courseMap) {
        this.isShowCourseMap = true;
        this.isShowDirections = false;
        this.isShowDiagnosticPlay = false;
        this.isBaseLineInProgress = false;
      } else if (destination === CLASS_SKYLINE_INITIAL_DESTINATION.showDirections) {
        this.isShowDirections = true;
        this.isShowCourseMap = false;
        this.isShowDiagnosticPlay = false;
        this.isBaseLineInProgress = false;
      } else if (destination === CLASS_SKYLINE_INITIAL_DESTINATION.diagnosticPlay) {
        this.isShowDiagnosticPlay = true;
        this.isShowDirections = false;
        this.isShowCourseMap = false;
        this.isBaseLineInProgress = false;
      } else if (destination === CLASS_SKYLINE_INITIAL_DESTINATION.ILPInProgress) {
        if (this.isIlpInProgress) {
          this.isShowDirections = true;
          this.isBaseLineInProgress = false;
        } else {
          this.isBaseLineInProgress = true;
          this.isShowDirections = false;
        }
        this.isShowDiagnosticPlay = false;
        this.isShowCourseMap = false;
      }
    }
  }

  /**
   * @function computeCompetencyStats
   * This method is used to compute competency stats
   */
  private computeCompetencyStats() {
    if (this.baseMasteredCompetencies) {
      this.completedCompetencies = (this.compentencyPerformance.completedCompetencies - this.baseMasteredCompetencies);
      this.numberOfCompetencies = (this.compentencyPerformance.totalCompetencies - this.baseMasteredCompetencies);
      this.isShowCompletedCompetencies = this.compentencyPerformance.completedCompetencies !== this.compentencyPerformance.totalCompetencies;
    }
  }

  /**
   * @function onToggleInfo
   * This method is used to open the info pull up
   */
  public onToggleInfo() {
    this.toggleInfo.emit();
  }

  /**
   * @function onClickProficiency
   * This method is used to open the peoficiency
   */
  public onClickProficiency() {
    this.clickProficiency.emit();
  }

  /**
   * @function onClickStart
   * This method triggers when user click start
   */
  public onClickStart() {
    this.clickStart.emit();
  }

  /**
   * @function getPerformance
   * This method get the class performance
   */
  public getPerformance(performance) {
    return performance ? performance.score : null;
  }

  /**
   * @function onClickDirection
   * This method triggers when user click direction
   */
  public onClickDirection() {
    this.clickDirection.emit();
  }

  /**
   * @function onDiagnosticPlay
   * This method triggers when user click diagnostic play
   */
  public onDiagnosticPlay() {
    if (this.showPublicClassDiagnostic) {
      this.publicClassDiagnosticPlay.emit();
    } else {
      this.diagnosticPlay.emit();
    }
  }

  /**
   * @function onSkipDiagnostic
   * This method triggers when user click skip diagnostic
   */
  public onSkipDiagnostic() {
    this.skipDiagnostic.emit();
  }

  /**
   * @function onOpenJourneyReport
   * This method triggers when user click the performance
   */
  public onOpenJourneyReport() {
    this.openJourneyReport.emit();
  }

  /**
   * @function onClickLessonList
   * This method triggers when user click the lesson list
   */
  public onClickLessonList() {
    this.lessonList.emit();
  }
}
