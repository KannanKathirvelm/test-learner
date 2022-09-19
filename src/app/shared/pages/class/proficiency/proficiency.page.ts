import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TenantSettingsModel } from '@app/shared/models/tenant/tenant-settings';
import { LookupService } from '@app/shared/providers/service/lookup/lookup.service';
import { ModalController } from '@ionic/angular';
import { pullDownAnimation } from '@shared/animations/pull-down';
import { pullUpAnimation } from '@shared/animations/pull-up';
import { CompetencyInfoComponent } from '@shared/components/proficiency/competency-info-pull-up/competency-info-pull-up.component';
import { DomainInfoComponent } from '@shared/components/proficiency/domain-info/domain-info.component';
import { LegendPullUpComponent } from '@shared/components/proficiency/legend-pull-up/legend-pull-up.component';
import { TopicInfoComponent } from '@shared/components/proficiency/topic-info/topic-info.component';
import { DOMAIN_TOPIC_MATRIX } from '@shared/constants/domain-topic-matrix-constants';
import { EVENTS } from '@shared/constants/events-constants';
import { PROFICIENCY_TOPIC_META_DATA } from '@shared/constants/proficiency-topic-meta-data-constants';
import { ClassModel } from '@shared/models/class/class';
import { DomainModel, DomainTopicCompetencyMatrixModel, FwCompetenciesModel, MatrixCoordinatesModel, SelectedCompetencyModel, SelectedTopicsModel } from '@shared/models/competency/competency';
import { SubjectModel, TaxonomyGrades, TaxonomyModel } from '@shared/models/taxonomy/taxonomy';
import { TaxonomyProvider } from '@shared/providers/apis/taxonomy/taxonomy';
import { ClassService } from '@shared/providers/service/class/class.service';
import { CompetencyService } from '@shared/providers/service/competency/competency.service';
import { LoadingService } from '@shared/providers/service/loader.service';
import { ParseService } from '@shared/providers/service/parse/parse.service';
import { ProfileService } from '@shared/providers/service/profile/profile.service';
import { TaxonomyService } from '@shared/providers/service/taxonomy/taxonomy.service';
import { UtilsService } from '@shared/providers/service/utils/utils.service';
import { flattenGutToFwCompetency, flattenGutToFwDomain, getCategoryCodeFromSubjectId } from '@shared/utils/taxonomyUtils';
import axios from 'axios';
import * as moment from 'moment';

@Component({
  selector: 'proficiency',
  templateUrl: './proficiency.page.html',
  styleUrls: ['./proficiency.page.scss'],
})

export class ProficiencyPage {
  public class: ClassModel;
  public activeSubject: SubjectModel;
  public categories: Array<TaxonomyModel>;
  public frameworkId: string;
  public fwCompetencies: Array<FwCompetenciesModel>;
  public fwDomains: Array<DomainModel>;
  public showCompetencyInfo: boolean;
  public showDomainInfo: boolean;
  public selectedCompetency: SelectedCompetencyModel;
  public subjects: Array<SubjectModel>;
  public classSubject: string;
  public profilePreferences: Array<string>;
  public defaultCategory: string;
  public classFramework: string;
  public domainTopicCompetencyMatrix: Array<DomainTopicCompetencyMatrixModel>;
  public domainCoordinates: Array<MatrixCoordinatesModel>;
  public activeCategory: TaxonomyModel;
  public taxonomyGrades: Array<TaxonomyGrades>;
  public selectedTopic: SelectedTopicsModel;
  public tenantSettings: TenantSettingsModel;
  public isExpandedDomainReport: boolean;
  public isLoading: boolean;
  public isShowExpandedPopover: boolean;
  public startTime: number;
  public isChartDataLoaded: boolean;
  public enableNavigatorProgram: boolean;
  public isClassProficiency: boolean;

  constructor(
    public modalController: ModalController,
    private utilsService: UtilsService,
    private loader: LoadingService,
    private profileService: ProfileService,
    private classService: ClassService,
    private taxonomyService: TaxonomyService,
    private taxonomyProvider: TaxonomyProvider,
    private competencyProvider: CompetencyService,
    private activatedRoute: ActivatedRoute,
    private lookupService: LookupService,
    private parseService: ParseService
  ) {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.class = this.classService.class;
      this.initialize();
    });
  }

  /**
   * @function initialize
   * Method to initalize the values
   */
  public initialize() {
    this.resetChart();
    this.loadSkeletonChartData();
    this.startTime = moment().valueOf();
    this.classSubject = this.class.preference ? this.class.preference.subject : null;
    this.profilePreferences = this.profileService.profilePreferences;
    this.frameworkId = this.getFrameworkId();
    this.loadData();
    this.isShowExpandedPopover = this.utilsService.showExpandedPopover(1);
  }

  /**
   * @function resetChart
   * Method is used to reset the chart data
   */
  public resetChart() {
    this.isChartDataLoaded = false;
    this.domainCoordinates = null;
    this.domainTopicCompetencyMatrix = null;
  }

  /**
   * @function loadSkeletonChartData
   * Method is used to load the skeleton chart data
   */
  public async loadSkeletonChartData() {
    this.getSkeletonChartData().then(() => {
      this.isChartDataLoaded = true;
    });
  }

  /**
   * @function getSkeletonChartData
   * Method is used to get the skeleton chart data
   */
  public getSkeletonChartData() {
    return new Promise((resolve) => {
      this.domainCoordinates = PROFICIENCY_TOPIC_META_DATA;
      this.domainTopicCompetencyMatrix = DOMAIN_TOPIC_MATRIX;
      resolve(null);
    });
  }

  /**
   * @function getFrameworkId
   * Method to get the frameworkId
   */
  public getFrameworkId(subjectCode?) {
    const classFramework = this.class.preference ? this.class.preference.framework : null;
    return subjectCode && subjectCode !== this.classSubject ? this.profilePreferences && this.profilePreferences[subjectCode] :
      classFramework ? classFramework : this.profilePreferences && this.profilePreferences[this.classSubject];
  }

  /**
   * @function loadData
   * This method is used to load data
   */
  private loadData() {
    this.isLoading = true;
    this.fetchCategories();
    this.loadTenantSettings();
  }

  /**
   * @function onSelectDomain
   * This method is used to open the domain report
   */
  public onSelectDomain(domain) {
    this.showDomainInfo = true;
    const params = {
      domain,
      fwCompetencies: this.fwCompetencies
    };
    this.openModalReport(
      DomainInfoComponent,
      params,
      'domain-info-component',
      pullUpAnimation,
      pullDownAnimation
    );
  }

  /**
   * @function trackProficiencyViewEvent
   * This method is used to track the view proficiency event
   */
  public trackProficiencyViewEvent() {
    const context = this.getProficiencyChartContext();
    this.parseService.trackEvent(EVENTS.VIEW_PROFICIENCY_CHART, context);
  }

  /**
   * @function getProficiencyChartContext
   * This method is used to get the context for proficiency chart event
   */
  private getProficiencyChartContext() {
    const endTime = moment().valueOf();
    return {
      classId: this.class.id,
      className: this.class.title,
      courseName: this.class.course_title,
      courseId: this.class.course_id,
      startTime: this.startTime,
      endTime
    };
  }

  /**
   * @function trackInspectCompetencyEvent
   * This method is used to track the inspect competency event
   */
  public trackInspectCompetencyEvent(eventContent) {
    const context = this.getInspectCompetencyContext(eventContent);
    this.parseService.trackEvent(EVENTS.INSPECT_COMPETENCY, context);
  }

  /**
   * @function getInspectCompetencyContext
   * This method is used to get the context for inspect competency event
   */
  private getInspectCompetencyContext(eventContent) {
    return {
      classId: this.class.id,
      classTitle: this.class.title,
      courseId: this.class.course_id,
      courseTitle: this.class.course_title,
      fwCode: this.frameworkId,
      subjectCode: eventContent.selectedSubject ? eventContent.selectedSubject.code : null,
      gradeName: eventContent.activeGrade ? eventContent.activeGrade.grade : null,
      domainCode: eventContent.competency.domainCode,
      topicCode: eventContent.competency.topicCode,
      domainName: eventContent.competency.domainName,
      competencyName: eventContent.competency.competencyName,
      competencyCode: eventContent.competency.competencyCode
    };
  }

  /**
   * @function loadTaxonomyGrades
   * Method to taxonomy grades
   */
  private loadTaxonomyGrades(subject) {
    this.enableNavigatorProgram = this.class.isPublic && this.tenantSettings && this.tenantSettings.uiElementVisibilitySettings && this.tenantSettings.uiElementVisibilitySettings.enableNavigatorProgram;
    const tenantPrefFwIds = this.tenantSettings.twFwPref || {};
    const tenantPrefFwId = tenantPrefFwIds[subject.code];
    const prefFrameworkId = this.enableNavigatorProgram && tenantPrefFwId ? tenantPrefFwId['default_fw_id'] : this.frameworkId;
    const filters = {
      subject: subject.code,
      fw_code: prefFrameworkId
    };
    return this.taxonomyService.fetchGradesBySubject(filters)
      .then((taxonomyGrades: Array<TaxonomyGrades>) => {
        this.taxonomyGrades = taxonomyGrades.sort((grade1, grade2) =>
          grade1.sequenceId - grade2.sequenceId);
      });
  }

  /**
   * @function fetchCategories
   * This method is used to fetch categories
   */
  private fetchCategories() {
    this.taxonomyService.fetchCategories().then((categories: Array<TaxonomyModel>) => {
      const defaultCategoryCode = this.classSubject ? getCategoryCodeFromSubjectId(this.classSubject)
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
      const activeSubject = subjects.find((subject) => {
        return subject.code === this.classSubject;
      });
      const defaultSubject = activeSubject ? activeSubject : subjects[0];
      this.onSelectSubject(defaultSubject);
      this.subjects = subjects;
    });
  }

  /**
   * @function onSelectSubject
   * This method is used to load the data based on the selected subject
   */
  public onSelectSubject(subject) {
    if (!this.isLoading) {
      this.loader.displayLoader();
      this.isChartDataLoaded = false;
    }
    this.frameworkId = this.getFrameworkId(subject.code);
    if (subject.code === this.classSubject) {
      this.loadTaxonomyGrades(subject);
    } else {
      this.taxonomyGrades = null;
    }
    this.activeSubject = subject;
    this.loadChartData();
  }

  /**
   * @function closeExpandedPopover
   * This method is used to close the expanded popover
   */
  public closeExpandedPopover() {
    this.isShowExpandedPopover = false;
  }

  /**
   * @function chartLoded
   * This method is used to dismiss the loader
   */
  public chartLoded() {
    this.loader.dismissLoader();
  }

  /**
   * @function onSelectCategory
   * This method is used to load the data based on the selected category
   */
  public onSelectCategory(category) {
    this.isChartDataLoaded = false;
    this.loader.displayLoader();
    this.activeCategory = category;
    this.fetchSubjects(category.id);
  }

  /**
   * @function onSelectLegend
   * This method is used to show the legend report
   */
  public onSelectLegend() {
    const params = {
      activeSubject: this.activeSubject
    };
    this.openModalReport(
      LegendPullUpComponent,
      params,
      'legend-info-component',
      pullUpAnimation,
      pullDownAnimation
    );
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
   * @function loadChartData
   * This method is used to get the chart data
   */
  private loadChartData() {
    return axios.all<{}>([
      this.fetchDomainTopicCompetencyMatrix(),
      this.fetchCompetencyMatrixCordinates(),
      this.loadCrossWalkData()
    ]).then(axios.spread((domainTopicCompetencyMatrix: Array<any>, matrixCoordinates: Array<MatrixCoordinatesModel>, crossWalkData) => {
      this.domainTopicCompetencyMatrix = domainTopicCompetencyMatrix;
      this.domainCoordinates = matrixCoordinates;
      this.fwCompetencies = flattenGutToFwCompetency(crossWalkData);
      this.fwDomains = flattenGutToFwDomain(crossWalkData);
      domainTopicCompetencyMatrix.forEach((domainData) => {
        this.parseCrossWalkFWC(domainData, crossWalkData);
      });
      this.isLoading = false;
      this.isChartDataLoaded = true;
    }), (error) => {
      this.domainTopicCompetencyMatrix = [];
      this.domainCoordinates = [];
      this.fwCompetencies = [];
      this.fwDomains = [];
      this.isLoading = false;
      this.isChartDataLoaded = true;
    });
  }

  /**
   * @function closeDomainInfoPullUp
   * This method is used to close the domain pull up
   */
  public closeDomainInfoPullUp() {
    this.showDomainInfo = false;
  }

  /**
   * @function onSelectTopic
   * This method is used to open the topic pull up
   */
  public onSelectTopic(topic) {
    const params = {
      content: topic,
      fwCompetencies: this.fwCompetencies,
      fwDomains: this.fwDomains,
      frameworkId: this.frameworkId
    };
    this.openModalReport(
      TopicInfoComponent,
      params,
      'topic-info-component',
      pullUpAnimation,
      pullDownAnimation
    );
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
      subject: this.activeSubject.code
    };
    return this.competencyProvider.fetchSubjectDomainTopicMetadata(subject);
  }

  /**
   * @function closePullUp
   * This method is used to close the pull up
   */
  public closePullUp() {
    this.showCompetencyInfo = false;
  }

  /**
   * @function onSelectCompetency
   * This method is used to get the selected values from chart
   */
  public onSelectCompetency(competency) {
    this.showCompetencyInfo = true;
    const params = {
      fwCompetencies: this.fwCompetencies,
      fwDomains: this.fwDomains,
      frameworkId: this.frameworkId,
      selectedCompetency: competency
    };
    this.openModalReport(
      CompetencyInfoComponent,
      params,
      'competency-info-component',
      pullUpAnimation,
      pullDownAnimation
    );
  }

  /**
   * @function openModalReport
   * This method is used to open modal report
   */
  public async openModalReport(component, componentProps, cssClass, enterAnimation, leaveAnimation) {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component,
      componentProps,
      cssClass,
      enterAnimation,
      leaveAnimation
    });
    modal.onDidDismiss().then((dismissContent) => {
      if (dismissContent.data && dismissContent.data.isCloseCompetencyReport) {
        this.closePullUp();
      }
      if (dismissContent.data && dismissContent.data.isCloseDomainReport) {
        this.closeDomainInfoPullUp();
      }
    });
    await modal.present();
  }

  /**
   * @function loadTenantSettings
   * This method is used to fetch tenant settings
   */
     public loadTenantSettings() {
      this.lookupService.fetchTenantSettings().then((tenantSettings: TenantSettingsModel) => {
        this.tenantSettings = tenantSettings;
      });
    }

  /**
   * @function parseCrossWalkFWC
   * This Method to parse cross walk framework code.
   */
  public parseCrossWalkFWC(domainData, crossWalkFWC) {
    if (crossWalkFWC && crossWalkFWC.length && domainData) {
      const fwDomain = crossWalkFWC.find((crossWalkDomain) => crossWalkDomain.domainCode === domainData.domainCode);
      if (fwDomain) {
        domainData.topics.forEach((topic) => {
          const competencies = topic.competencies;
          const fwTopics = fwDomain.topics.find((fwTopic) => fwTopic.topicCode === topic.topicCode);
          const fwCompetencies = fwTopics && fwTopics.competencies || [];
          if (fwCompetencies.length) {
            competencies.forEach((competency) => {
              const fwCompetency = fwCompetencies.find((fwCompetencyItem) => fwCompetencyItem.competencyCode === competency.competencyCode);
              if (fwCompetency) {
                competency.framework = fwCompetency;
                competency.isMappedWithFramework = true;
              }
            });
          }
        });
      }
    }
  }
}
