import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { TenantSettingsModel } from '@app/shared/models/tenant/tenant-settings';
import { IonContent } from '@ionic/angular';
import {
  pullLeftEnterAnimation,
  pullLeftLeaveAnimation,
} from '@shared/animations/pull-left';
import { DiagnosisOfKnowledgeComponent } from '@shared/components/class/diagnosis-of-knowledge/diagnosis-of-knowledge.component';
import { ProficiencyDirectionComponent } from '@shared/components/class/proficiency-direction/proficiency-direction.component';
import { MilestoneLocationModel } from '@shared/models/location/location';
import { MilestoneModel } from '@shared/models/milestone/milestone';
import { ClassService } from '@shared/providers/service/class/class.service';
import { MilestoneService } from '@shared/providers/service/milestone/milestone.service';
import { ModalService } from '@shared/providers/service/modal.service';

@Component({
  selector: 'milestone',
  templateUrl: './milestone.component.html',
  styleUrls: ['./milestone.component.scss'],
})
export class MilestoneComponent implements OnInit, OnDestroy {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public milestones: Array<MilestoneModel>;
  @Input() public isLoaded: boolean;
  @Input() public isHideInfo: boolean;
  @Input() public disableDefaultLessonToggle: boolean;
  @Input() public currentLocation: MilestoneLocationModel;
  @Input() public isToggleRescopedInfo: boolean;
  @Output() public openMilestoneReport: EventEmitter<MilestoneModel> = new EventEmitter();
  public courseId: string;
  public classId: string;
  public fwCode: string;
  public route0Applicable: boolean;
  public skeletonViewCount: number;
  public isPublicClass: boolean;
  public subjectCode: string;
  @ViewChild(IonContent, { static: false }) public content: IonContent;
  @Input() public tenantSettings: TenantSettingsModel;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private modalService: ModalService,
    private classService: ClassService,
    private milestoneService: MilestoneService
  ) {
    this.isLoaded = false;
    this.skeletonViewCount = 3;
  }

  // --------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    const classDetails = this.classService.class;
    this.classId = classDetails.id;
    this.courseId = classDetails.course_id;
    this.isPublicClass = this.classService.class.isPublic;
    const classPerference = classDetails.preference;
    this.route0Applicable = classDetails.route0_applicable;
    this.fwCode =
      classPerference && classPerference.framework
        ? classPerference.framework
        : null;
    this.subjectCode =
      classPerference && classPerference.subject
        ? classPerference.subject
        : null;
  }

  /**
   * @function onOpenMilestoneReport
   * This method is used to open milestone report
   */
  public onOpenMilestoneReport(milestone) {
    this.openMilestoneReport.emit(milestone);
  }

  /**
   * @function onShowDirections
   * This method is used to open direction component in modal
   */
  public onShowDirections() {
    const classInfo = this.classService.class;
    const props = {
      classInfo,
    };
    this.modalService.open(ProficiencyDirectionComponent, props);
  }

  /**
   * @function onDiagnosticPlay
   * This method is used to open diagnostic knowledge component in modal
   */
  public onDiagnosticPlay(diagnosticId) {
    const classInfo = this.classService.class;
    const classId = this.classService.class.id;
    const taxonomySubject = this.classService.classTaxonomy;
    const props = {
      diagnosticId,
      classId,
      classInfo,
      taxonomySubject: {
        subject: taxonomySubject ? taxonomySubject.title : null
      }
    };
    this.modalService.open(
      DiagnosisOfKnowledgeComponent,
      props,
      'diagnostic-modal',
      pullLeftEnterAnimation,
      pullLeftLeaveAnimation
    );
  }

  /**
   * @function scrollToCollection
   * This method is used to scroll to the view
   */
  public scrollToCollection(offsetTop) {
    this.content.scrollToPoint(0, offsetTop, 1000);
  }

  public ngOnDestroy() {
    this.milestoneService.unSubscribeEvent();
    this.classService.unSubscribeEvent();
  }

  /**
   * @function onScroll
   * This method is used after scrolls
   */
  public onScroll() {
    const contentElement = this.content['el'];
    const currentMilestoneElement = contentElement.querySelector(
      '.milestone-panel .mat-expanded'
    );
    if (currentMilestoneElement) {
      const allChildElement = currentMilestoneElement.querySelectorAll(
        '.lesson-panel:not(.rescoped-lesson)'
      );
      const firstLessonElement = allChildElement[0] || null;
      if (firstLessonElement) {
        const lessonElementScrollPosition = firstLessonElement.getBoundingClientRect().top;
        const svgElement = currentMilestoneElement.querySelector<HTMLElement>(
          '.milestone-icon-downward-line svg'
        );
        const calculatedElementHeight = 134;
        if (lessonElementScrollPosition < calculatedElementHeight) {
          svgElement.style.display = 'none';
        } else {
          svgElement.style.display = 'block';
        }
      }
    }
  }
}
