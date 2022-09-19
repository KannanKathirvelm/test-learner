import {
  Component,
  HostListener,
  NgZone,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, ModalController, NavController, NavParams } from '@ionic/angular';
import { PLAYER_EVENT_SOURCE, ROUTE_STATUS } from '@shared/constants/helper-constants';
import { routerPath } from '@shared/constants/router-constants';
import { ClassModel } from '@shared/models/class/class';
import {
  DomainModel,
  DomainTopicCompetencyMatrixModel,
  FwCompetenciesModel,
  MatrixCoordinatesModel,
  SelectedCompetencyModel,
  SelectedTopicsModel
} from '@shared/models/competency/competency';
import { MilestoneModel } from '@shared/models/milestone/milestone';
import { StudyPlayerContextModel } from '@shared/models/player/player';
import { Route0ContentModel } from '@shared/models/route0/route0';
import {
  SubjectModel,
  TaxonomyGrades,
  TaxonomyModel,
} from '@shared/models/taxonomy/taxonomy';
import { CompetencyProvider } from '@shared/providers/apis/competency/competency';
import { MilestoneProvider } from '@shared/providers/apis/milestone/milestone';
import { NavigateProvider } from '@shared/providers/apis/navigate/navigate';
import { TaxonomyProvider } from '@shared/providers/apis/taxonomy/taxonomy';
import { LoadingService } from '@shared/providers/service/loader.service';
import { MilestoneService } from '@shared/providers/service/milestone/milestone.service';
import { Route0Service } from '@shared/providers/service/route0/route0.service';
import { TaxonomyService } from '@shared/providers/service/taxonomy/taxonomy.service';
import {
  flattenGutToFwCompetency,
  flattenGutToFwDomain,
  getCategoryCodeFromSubjectId,
} from '@shared/utils/taxonomyUtils';
import { collapseAnimation } from 'angular-animations';
import axios from 'axios';
import * as moment from 'moment';

@Component({
  selector: 'proficiency-direction',
  templateUrl: './proficiency-direction.component.html',
  styleUrls: ['./proficiency-direction.component.scss'],
  animations: [collapseAnimation({ duration: 300, delay: 0 })],
})
export class ProficiencyDirectionComponent implements OnInit {
  // -------------------------------------------------------------------------
  // Properties
  public activeSubject: { code: string };
  public activeIndex: number;
  public directions: Array<{
    label: string;
    message: string;
    isActive: boolean;
  }>;
  public isFinishDirection: boolean;
  public frameworkId: string;
  public class: ClassModel;
  public fwCompetencies: Array<FwCompetenciesModel>;
  public fwDomains: Array<DomainModel>;
  public taxonomyGrades: Array<TaxonomyGrades>;
  public domainTopicCompetencyMatrix: Array<DomainTopicCompetencyMatrixModel>;
  public domainCoordinates: Array<MatrixCoordinatesModel>;
  public showYourDestination: boolean;
  public currentGrade: TaxonomyGrades;
  public milestones: Array<MilestoneModel>;
  public courseId: string;
  public isExpanded: boolean;
  public route0Applicable: boolean;
  public route0Details: Route0ContentModel;
  public showDirections: boolean;
  public masteredCompetencies: Array<string>;
  public showCompetencyInfo: boolean;
  public isExpandedDomainReport: boolean;
  public showLegendInfo: boolean;
  public selectedTopic: SelectedTopicsModel;
  public subjects: Array<SubjectModel>;
  public categories: Array<TaxonomyModel>;
  public activeCategory: TaxonomyModel;
  public selectedCompetency: SelectedCompetencyModel;
  public showGradeInfo: boolean;
  public translateParam: { subject: string };
  public isToggleLegend: boolean;
  public isPublicClass: boolean;
  public context: StudyPlayerContextModel;
  @ViewChild('milestoneContainer', { static: false })
  public content: IonContent;

  get activeDirection() {
    return this.directions.find((direction) => {
      return direction.isActive;
    });
  }

  /** Stop hardware back button */
  @HostListener('document:ionBackButton', ['$event'])
  public overrideHardwareBackAction(event) {
    if (this.showDirections) {
      event.detail.register(100, async () => {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
      });
      if (this.activeIndex > 0) {
        this.onPrevious();
      } else {
        this.onBack();
        this.navCtrl.navigateRoot(routerPath('studentHome'));
      }
    }
  }

  constructor(
    private zone: NgZone,
    private router: Router,
    private modalCtrl: ModalController,
    private milestoneService: MilestoneService,
    private navParams: NavParams,
    private loader: LoadingService,
    private taxonomyService: TaxonomyService,
    private taxonomyProvider: TaxonomyProvider,
    private competencyProvider: CompetencyProvider,
    private milestoneProvider: MilestoneProvider,
    private navigateProvider: NavigateProvider,
    private navCtrl: NavController,
    private activatedRoute: ActivatedRoute,
    private route0Service: Route0Service
  ) {
    this.activeIndex = 0;
    this.showDirections = true;
    this.directions = [
      {
        label: 'SKYLINE',
        message: 'SKYLINE_MESSAGE',
        isActive: true,
      },
      {
        label: 'DARK_BLUE_CELLS',
        message: 'DARK_BLUE_CELL_MESSAGE',
        isActive: false,
      },
    ];
    this.isFinishDirection = false;
    this.isExpanded = false;
    this.showCompetencyInfo = false;
    this.isExpandedDomainReport = false;
    this.showLegendInfo = false;
    this.showGradeInfo = true;
    this.isToggleLegend = true;
    this.class = this.navParams.get('classInfo');
    this.translateParam = { subject: '' };
    this.isPublicClass = this.activatedRoute.snapshot.queryParams
      ? this.activatedRoute.snapshot.queryParams.isPublic
      : false;
  }

  // -------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    const code = this.class.preference ? this.class.preference.subject : null;
    this.courseId = this.class.course_id;
    this.frameworkId = this.class.preference ? this.class.preference.framework : null;
    this.route0Applicable = this.class.route0_applicable;
    this.activeSubject = { code };
    this.loadData();
  }

  /**
   * @function onNext
   * This method triggers when user clicks on next button
   */
  public onNext() {
    const activeIndex = ++this.activeIndex;
    this.directions.forEach((direction) => {
      direction.isActive = false;
    });
    this.activeIndex = activeIndex;
    this.isFinishDirection = activeIndex === this.directions.length - 1;
    this.directions[activeIndex].isActive = true;
  }

  /**
   * @function onPrevious
   * This method used to go to previous content
   *
   */
  public onPrevious() {
    this.zone.run(() => {
      const activeIndex = --this.activeIndex;
      this.directions.forEach((direction) => {
        direction.isActive = false;
      });
      this.activeIndex = activeIndex;
      this.isFinishDirection = activeIndex === this.directions.length - 1;
      this.directions[activeIndex].isActive = true;
    });
  }

  /**
   * @function onContinueCourse
   * This method triggers when user clicks on continue course button
   */
  public onContinueCourse(event) {
    event.stopPropagation();
    this.continueBasedOnGradeInfo();
  }

  /**
   * @function continueBasedOnGradeInfo
   * This method is used to run based on grade info
   */
  public continueBasedOnGradeInfo() {
    if (this.showGradeInfo) {
      this.showGradeInfo = false;
      this.fetchMilestone();
    } else {
      this.onPlayContent();
    }
  }

  /**
   * @function scrollToCollection
   * This method is used to scroll to the view
   */
  public scrollToCollection(offsetTop) {
    this.content.scrollToPoint(0, offsetTop, 1000);
  }

  /**
   * @function onContinueCourse
   * This method used to navigate to play the current course content
   */
  public onPlayContent() {
    this.loader.displayLoader();
    const classId = this.class.id;
    const courseId = this.courseId;
    this.navigateProvider.continueCourse(courseId, classId).then((response) => {
      const collection = response.context;
      const collectionId = collection.collection_id;
      const lessonId = collection.lesson_id;
      const unitId = collection.unit_id;
      const collectionType = collection.current_item_type;
      const source = PLAYER_EVENT_SOURCE.COURSE_MAP;
      const pathId = collection.path_id || 0;
      const pathType = collection.path_type || null;
      const milestoneId = collection.milestone_id;
      const ctxPathId = collection.ctx_path_id || 0;
      const ctxPathType = collection.ctx_path_type || null;
      this.onPlay();
      this.loader.dismissLoader();
      const playerUrl = routerPath('studyPlayer');
      this.router.navigate([playerUrl], {
        queryParams: {
          classId,
          collectionType,
          source,
          courseId,
          unitId,
          lessonId,
          collectionId,
          pathId,
          pathType,
          milestoneId,
          toMilestone: true,
          isPublicClass: this.isPublicClass,
          ctxPathId,
          ctxPathType
        },
      });
    });
  }

  /**
   * @function onReviewDestination
   * This method triggers when user clicks on review destination button
   */
  public onReviewDestination() {
    this.showYourDestination = true;
    if (!this.isPublicClass) {
      this.milestoneProvider.updateProfileBaseline(this.class.id);
    }
  }

  /**
   * @function onBack
   * This method close the modal
   */
  public onBack() {
    this.modalCtrl.dismiss();
  }

  /**
   * @function onPlay
   * This method triggers when user play a collection
   */
  public onPlay() {
    this.onBack();
  }

  /**
   * @function onToggle
   * This method is used to toggle the content
   */
  public onToggle() {
    this.isExpanded = !this.isExpanded;
  }

  /**
   * @function toggleLegend
   * This method is used to toggle the
   */
  public toggleLegend() {
    this.isToggleLegend = !this.isToggleLegend;
  }

  /**
   * @function onSelectDomain
   * This method is used to open the domain report
   */
  public onSelectTopic(domain) {
    this.selectedTopic = domain;
  }

  /**
   * @function onSelectLegend
   * This method is used to show the legend report
   */
  public onSelectLegend() {
    this.showLegendInfo = true;
  }

  /**
   * @function closeLegendPullUp
   * This method is used to close the legend pull up
   */
  public closeLegendPullUp() {
    this.showLegendInfo = false;
  }

  /**
   * @function showFullDomainReport
   * This method is used to show the full domain report
   */
  public showFullDomainReport() {
    this.isExpandedDomainReport = true;
  }

  /**
   * @function closeDomainInfoPullUp
   * This method is used to close the domain pull up
   */
  public closeDomainInfoPullUp() {
    this.isExpandedDomainReport = false;
  }

  /**
   * @function fetchMilestone
   * This method is used to fetch the milestones
   */
  public fetchMilestone() {
    if (this.frameworkId) {
      this.loader.displayLoader();
      axios.all([
        this.milestoneService.getMilestone(
          this.class.id,
          this.courseId,
          this.frameworkId,
          false,
          false,
          false
        ),
        this.route0Applicable ? this.route0Service.checkAndRetrieveRoute0ByStatus(this.class.id,
          this.courseId, this.frameworkId, ROUTE_STATUS.ACCEPTED) : null
      ]).then(axios.spread((milestones: Array<MilestoneModel>,
                            route0ContentResponse: Route0ContentModel) => {
        const route0Milestones = route0ContentResponse ? route0ContentResponse.route0Content.milestones : [];
        this.milestones = this.addRoute0InMilestone(milestones, route0Milestones);
        this.loader.dismissLoader();
      }));
    }
  }

  /**
   * @function addRoute0InMilestone
   * This method is used to add route0 in milestone
   */
  public addRoute0InMilestone(milestones, route0Milestones) {
    const milestoneList = route0Milestones.concat(milestones);
    return milestoneList.map((milestone, index) => {
      milestone.sequenceId = index + 1;
      return milestone;
    });
  }

  /**
   * @function loadData
   * This method is used to load the data
   */
  public loadData() {
    this.loadTaxonomyGrades();
    this.fetchCategories();
  }

  /**
   * @function loadChartData
   * This method is used to get the chart data
   */
  private loadChartData() {
    this.domainTopicCompetencyMatrix = null;
    this.domainCoordinates = null;
    this.fwCompetencies = null;
    this.fwDomains = null;
    this.loader.displayLoader();
    return axios.all<{}>([
      this.fetchDomainTopicCompetencyMatrix(),
      this.fetchCompetencyMatrixCordinates(),
      this.frameworkId ? this.loadCrossWalkData() : [],
    ]).then(axios.spread((domainTopicCompetencyMatrix: Array<any>, matrixCoordinates: Array<MatrixCoordinatesModel>, crossWalkData) => {
      this.domainTopicCompetencyMatrix = domainTopicCompetencyMatrix;
      this.domainCoordinates = matrixCoordinates;
      this.fwCompetencies = flattenGutToFwCompetency(crossWalkData);
      this.fwDomains = flattenGutToFwDomain(crossWalkData);
    }), (error) => {
      this.domainTopicCompetencyMatrix = [];
      this.domainCoordinates = [];
      this.fwCompetencies = [];
      this.fwDomains = [];
    }
    );
  }

  /**
   * @function chartLoded
   * This method is used to dismiss the loader
   */
  public chartLoded() {
    this.loader.dismissLoader();
  }

  /**
   * @function fetchCategories
   * This method is used to fetch categories
   */
  private fetchCategories() {
    this.taxonomyService.fetchCategories().then((categories: Array<TaxonomyModel>) => {
      const defaultCategoryCode = this.activeSubject
        ? getCategoryCodeFromSubjectId(this.activeSubject.code)
        : categories[0].code;
      const defaultCategory = categories.find((category) => {
        return category.code === defaultCategoryCode;
      });
      this.categories = categories;
      this.activeCategory = defaultCategory;
      this.fetchSubjects(defaultCategory.id);
    });
  }

  /**
   * @function fetchSubjects
   * Method to fetch the subjects
   */
  public fetchSubjects(categoryId) {
    this.taxonomyProvider.fetchSubjects(categoryId).then((subjects) => {
      const activeSubject = subjects.find((subjectData) => {
        return subjectData.code === this.activeSubject.code;
      });
      const defaultSubject = activeSubject ? activeSubject : subjects[0];
      this.onSelectSubject(defaultSubject);
      this.subjects = subjects;
      const subject = defaultSubject.title;
      this.translateParam = { subject };
    });
  }

  /**
   * @function onSelectSubject
   * This method is used to load the data based on the selected subject
   */
  public onSelectSubject(subject) {
    this.activeSubject = subject;
    this.loadChartData();
    if (!this.showDirections) {
      this.loadTaxonomyGrades();
    }
  }

  /**
   * @function onSelectCompetency
   * This method is used to get the selected values from chart
   */
  public onSelectCompetency(competency) {
    this.selectedCompetency = competency;
    this.showCompetencyInfo = true;
  }

  /**
   * @function closePullUp
   * This method is used to close competency pull up
   */
  public closePullUp() {
    this.showCompetencyInfo = false;
  }

  /**
   * @function fetchDomainTopicCompetencyMatrix
   * Method to fetch the topic competency matrix
   */
  private fetchDomainTopicCompetencyMatrix() {
    const subjectCode = this.activeSubject.code;
    const currentDate = moment();
    const month = currentDate.format('M');
    const year = currentDate.format('YYYY');
    return this.competencyProvider.fetchDomainTopicCompetencyMatrix(subjectCode, year, month);
  }

  /**
   * @function fetchCompetencyMatrixCordinates
   * Method to fetch the matrix coordinates
   */
  private fetchCompetencyMatrixCordinates() {
    const subject = {
      subject: this.activeSubject.code,
    };
    return this.competencyProvider.fetchSubjectDomainTopicMetadata(subject);
  }

  /**
   * @function loadCrossWalkData
   * This method is used to fetch the cross Walk Data
   */
  public loadCrossWalkData() {
    return new Promise((resolve, reject) => {
      if (this.frameworkId) {
        const subjectCode = this.activeSubject.code;
        return this.taxonomyService.fetchCrossWalkFWC(this.frameworkId, subjectCode)
          .then((crossWalkData) => {
            resolve(crossWalkData);
          }, (error) => {
            resolve([]);
          });
      } else {
        resolve([]);
      }
    });
  }

  /**
   * @function loadTaxonomyGrades
   * Method to taxonomy grades
   */
  private loadTaxonomyGrades() {
    const classGrade = this.class.grade_current;
    const subject = this.activeSubject;
    const filters = {
      subject: subject.code,
      fw_code: this.frameworkId,
    };
    return this.taxonomyService
      .fetchGradesBySubject(filters)
      .then((taxonomyGrades: Array<TaxonomyGrades>) => {
        this.taxonomyGrades = taxonomyGrades.sort((grade1, grade2) => {
          return grade1.sequenceId - grade2.sequenceId;
        });
        this.currentGrade = this.taxonomyGrades.find((taxonomyGrade) => {
          return Number(classGrade) === Number(taxonomyGrade.id);
        });
      });
  }

  /**
   * @function navigateToClassroom
   * Method to navigate to classroom
   */
  public navigateToClassroom() {
    this.onBack();
    this.navCtrl.navigateRoot(routerPath('studentHome'));
  }
}
