import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TenantSettingsModel } from '@app/shared/models/tenant/tenant-settings';
import { ModalController } from '@ionic/angular';
import { pullDownAnimation } from '@shared/animations/pull-down';
import { pullUpAnimation } from '@shared/animations/pull-up';
import { CompetencyInfoComponent } from '@shared/components/proficiency/competency-info-pull-up/competency-info-pull-up.component';
import { DomainInfoComponent } from '@shared/components/proficiency/domain-info/domain-info.component';
import { LegendPullUpComponent } from '@shared/components/proficiency/legend-pull-up/legend-pull-up.component';
import { TopicInfoComponent } from '@shared/components/proficiency/topic-info/topic-info.component';
import { DEFAULT_SUBJECT, GUT } from '@shared/constants/helper-constants';
import { DomainModel, DomainTopicCompetencyMatrixModel, FwCompetenciesModel, MatrixCoordinatesModel, SelectedCompetencyModel, SelectedTopicsModel } from '@shared/models/competency/competency';
import { SubjectModel, TaxonomyModel } from '@shared/models/taxonomy/taxonomy';
import { CompetencyProvider } from '@shared/providers/apis/competency/competency';
import { TaxonomyProvider } from '@shared/providers/apis/taxonomy/taxonomy';
import { LoadingService } from '@shared/providers/service/loader.service';
import { LookupService } from '@shared/providers/service/lookup/lookup.service';
import { ProfileService } from '@shared/providers/service/profile/profile.service';
import { TaxonomyService } from '@shared/providers/service/taxonomy/taxonomy.service';
import { flattenGutToFwCompetency, flattenGutToFwDomain } from '@shared/utils/taxonomyUtils';
import axios from 'axios';
import * as moment from 'moment';

@Component({
  selector: 'my-learner-identity',
  templateUrl: './my-learner-identity.page.html',
  styleUrls: ['./my-learner-identity.page.scss']
})

export class MyLearnerIdentityPage {
  public activeSubject: SubjectModel;
  public categories: Array<TaxonomyModel>;
  public frameworkId: string;
  public fwCompetencies: Array<FwCompetenciesModel>;
  public fwDomains: Array<DomainModel>;
  public showCompetencyInfo: boolean;
  public showDomainInfo: boolean;
  public isExpandedReport: boolean;
  public selectedCompetency: SelectedCompetencyModel;
  public subjects: Array<SubjectModel>;
  public profilePreferences: Array<string>;
  public domainTopicCompetencyMatrix: Array<DomainTopicCompetencyMatrixModel>;
  public domainCoordinates: Array<MatrixCoordinatesModel>;
  public activeCategory: TaxonomyModel;
  public selectedDomain: DomainModel;
  public isExpandedDomainReport: boolean;
  public showReport: boolean;
  public isLoading: boolean;
  public showLegendInfo: boolean;
  public showTopicInfo: boolean;
  public selectedTopic: SelectedTopicsModel;
  public tenantSettings: TenantSettingsModel;
  public isProfileProficiency: boolean;


  /**
   * @property hideProficiencyScroll
   * This property is used to hide the scroll
   */
  get hideProficiencyScroll(): boolean {
    if (this.showDomainInfo && this.showReport && this.showTopicInfo) {
      return !this.isExpandedDomainReport;
    }
    return this.showReport;
  }

  constructor(
    public modalController: ModalController,
    private activatedRoute: ActivatedRoute,
    private loader: LoadingService,
    private profileService: ProfileService,
    private taxonomyService: TaxonomyService,
    private taxonomyProvider: TaxonomyProvider,
    private lookupService: LookupService,
    private competencyProvider: CompetencyProvider
  ) {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.initalize();
    });
  }

  /**
   * @function initalize
   * Method to initalize
   */
  public initalize() {
    this.isExpandedReport = false;
    this.showReport = false;
    this.isProfileProficiency = true;
    this.loadData();
    this.fetchTenantSettings();
  }

  /**
   * @function getFrameworkId
   * Method to get the frameworkId
   */
  public getFrameworkId(subjectCode) {
    this.profilePreferences = this.profileService.profilePreferences.standard_preference;
    return this.profilePreferences ? this.profilePreferences[`${subjectCode}`] : GUT;
  }

  /**
   * @function loadData
   * This method is used to load data
   */
  private loadData() {
    this.isLoading = true;
    this.fetchCategories();
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
   * @function fetchCategories
   * This method is used to fetch categories
   */
  private fetchCategories() {
    this.taxonomyService.fetchCategories().then((categories: Array<TaxonomyModel>) => {
      this.categories = categories;
      this.activeCategory = categories[0];
      this.fetchSubjects(this.activeCategory.id);
    });
  }

  /**
   * @function fetchTenantSettings
   * This method is used to fetch tenant settings
   */
  private fetchTenantSettings() {
    this.lookupService.fetchTenantSettings().then((tenantSettings: TenantSettingsModel) => {
      this.tenantSettings = tenantSettings;
    });
  }

  /**
   * @function fetchSubjects
   * Method to fetch the subjects
   */
  public fetchSubjects(categoryId) {
    this.taxonomyProvider.fetchSubjects(categoryId).then((subjects) => {
      const tenantSubCode = this.tenantSettings && this.tenantSettings.txSubPrefs ? this.tenantSettings.txSubPrefs.defaultGutSubjectCode : DEFAULT_SUBJECT;
      const activeSubject = subjects.find((subject) => {
        return subject.code === tenantSubCode;
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
    this.loader.displayLoader();
    this.isLoading = true;
    this.frameworkId = this.getFrameworkId(subject.code);
    this.activeSubject = subject;
    this.loadChartData();
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
    this.loader.displayLoader();
    this.isLoading = true;
    this.activeCategory = category;
    this.fetchSubjects(category.id);
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
      this.isLoading = false;
    }), (error) => {
      this.domainTopicCompetencyMatrix = [];
      this.domainCoordinates = [];
      this.fwCompetencies = [];
      this.fwDomains = [];
      this.isLoading = false;
    });
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
   * @function closeDomainInfoPullUp
   * This method is used to close the domain pull up
   */
  public closeDomainInfoPullUp() {
    this.showDomainInfo = false;
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
}
