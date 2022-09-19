import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EVENTS } from '@app/shared/constants/events-constants';
import { ClassService } from '@app/shared/providers/service/class/class.service';
import { ParseService } from '@app/shared/providers/service/parse/parse.service';
import { SessionService } from '@app/shared/providers/service/session/session.service';
import { ClassMembersGrade, ClassModel, DestinationModel } from '@shared/models/class/class';
import {
  CompetencyStyleModel,
  DomainModel,
  DomainTopicCompetencyMatrixModel,
  DomainTopicsModel,
  GradeBoundaryPointsModel,
  MatrixCoordinatesModel,
  SelectedCompetencyModel,
  SelectedTopicsModel,
  SkyLineCompetencyModel,
  TopicsCompetencyModel,
  TopicSkylinePointsModel,
  TopicsModel
} from '@shared/models/competency/competency';
import { GradeBoundaryModel, MultiGradeActiveList, SubjectModel, TaxonomyGrades, TaxonomyModel } from '@shared/models/taxonomy/taxonomy';
import { TaxonomyProvider } from '@shared/providers/apis/taxonomy/taxonomy';
import { getDomainCode } from '@shared/utils/taxonomyUtils';
import * as d3 from 'd3';

@Component({
  selector: 'proficiency-chart',
  templateUrl: './proficiency-chart.component.html',
  styleUrls: ['./proficiency-chart.component.scss'],
})
export class ProficiencyChartComponent implements OnInit, OnChanges, OnDestroy {

  // --------------------------------------------------------------------------
  // Properties

  @ViewChild('chartContainer', { static: true }) private chartContainer: ElementRef;
  @Input() public class: ClassModel;
  @Input() public categories: Array<TaxonomyModel>;
  @Input() public frameworkId: string;
  @Input() public activeSubject: SubjectModel;
  @Input() public showCompetencyInfo: boolean;
  @Input() public showDomainInfo: boolean;
  @Input() public isShowExpandedPopover: boolean;
  @Input() public activeCategory: SubjectModel;
  @Input() public showHeader: boolean;
  @Input() public isSkeletonChart: boolean;
  @Input() public isDefaultSkyline: boolean;
  @Input() public masteredCompetencies: Array<string>;
  @Input() public destinationClass: DestinationModel;
  @Input() public taxonomyGrades: Array<TaxonomyGrades>;
  @Input() public domainTopicCompetencyMatrix: Array<DomainTopicCompetencyMatrixModel>;
  @Input() public domainCoordinates: Array<MatrixCoordinatesModel>;
  @Input() public domainTopicCompetencyMatrixSkeletonData: Array<DomainTopicCompetencyMatrixModel>;
  @Input() public domainCoordinatesSkeletonData: Array<MatrixCoordinatesModel>;
  @Input() public subjects: Array<SubjectModel>;
  @Input() public fwCompetencies: Array<DomainModel>;
  @Input() public currentGrade: TaxonomyGrades;
  @Input() public isPublicClass: boolean;
  @Input() public showLegendInfoPopover: boolean;
  @Input() public gradeLowerBound: boolean;
  @Input() public userSelectedUpperBound: string;
  @Output() public selectCategory: EventEmitter<SubjectModel> = new EventEmitter();
  @Output() public selectSubject: EventEmitter<SubjectModel> = new EventEmitter();
  @Output() public selectCompetency: EventEmitter<SelectedCompetencyModel> = new EventEmitter();
  @Output() public selectDomain: EventEmitter<DomainTopicsModel> = new EventEmitter();
  @Output() public selectTopic: EventEmitter<SelectedTopicsModel> = new EventEmitter();
  @Output() public chartLoded = new EventEmitter();
  @Output() public selectLegend = new EventEmitter();
  @Output() public isLoading: boolean;
  @Output() public closeExpandedPopover = new EventEmitter();
  @Output() public trackProficiencyViewEvent = new EventEmitter();
  @Output() public skylinePresent = new EventEmitter();
  @Output() public trackInspectCompetencyEvent = new EventEmitter();
  @Output() public closeLegendInfoPopover = new EventEmitter();
  @Input() public enableNavigatorProgram: boolean;
  @Input() public isProfileProficiency: boolean;
  @Input() public isClassProficiency: boolean;

  get chartHeight() {
    const component = this;
    const chartContainer = component.elementRef.nativeElement.querySelector('.scrollable-chart') as HTMLElement;
    const chartContainerHeight = chartContainer.offsetHeight;
    let chartHeight = 0;
    chartHeight = component.isShowExpandedGraph ? component.highestTopicSize * component.expandedGraphCellHeight : chartContainerHeight;
    return (chartContainerHeight || chartHeight) - 10;
  }

  get chartWidth() {
    if (!this.chartSize) {
      const chartContainer = this.elementRef.nativeElement.querySelector('.scrollable-chart') as HTMLElement;
      this.chartSize = chartContainer.offsetWidth - 30;
      return this.chartSize;
    }
    return this.chartSize;
  }

  get numberOfCompetenciesInExtendedDomain() {
    let highestTopicSize = 0;
    this.chartData.forEach((domain) => {
      if (domain.isExpanded) {
        domain.topics.forEach((topic) => {
          highestTopicSize = highestTopicSize < topic.competencies.length ? topic.competencies.length : highestTopicSize;
        });
      }
    });
    return highestTopicSize;
  }

  get numberOfCompetenciesInCompressedDomain() {
    let highestDomainSize = 0;
    this.chartData.forEach((domain) => {
      if (!domain.isExpanded) {
        highestDomainSize = highestDomainSize < domain.totalCompetencies ? domain.totalCompetencies : highestDomainSize;
      }
    });
    return highestDomainSize;
  }

  public activeGrade: TaxonomyGrades;
  public isShowExpandedGraph: boolean;
  public isCompetencyActive: boolean;
  public chartSize: number;
  public cellWidth: number;
  public cellHeight: number;
  public selectedCategory: SubjectModel;
  public selectedSubject: SubjectModel;
  public selectedCompetency: TopicsCompetencyModel;
  public chartData: Array<DomainTopicsModel>;
  public activeCompetencyStyle: CompetencyStyleModel;
  public activeCompetency: TopicsCompetencyModel;
  private skylineContainer: d3.Selection<SVGElement, {}, HTMLElement, {}>;
  private gradeLineContainer: d3.Selection<SVGElement, {}, HTMLElement, {}>;
  private maxDomainSize: number;
  private isSelectedCompetency: boolean;
  private activeDomainSeq: number;
  private expandedGraphCellHeight: number;
  private multiGradeActiveList: Array<MultiGradeActiveList>;
  private activeGradeList: Array<TaxonomyGrades>;
  public highlightMasteredCompetencies: TopicsCompetencyModel;
  public isExpanding: boolean;
  private highestTopicSize: number;
  private skylinePoints: Array<SkyLineCompetencyModel>;
  private topicCellHeight: number;
  private domainBoundariesContainer: Array<GradeBoundaryModel[]>;
  private gradeBoundaryPoints: Array<GradeBoundaryPointsModel>;
  private expandedTopicChart: boolean;
  private totalCompetenciesLength: number;
  public showExpandedChart: boolean;
  public isPremiumClass: boolean;
  private hasNextActiveDomain: boolean;
  private domainBoundary: Array<GradeBoundaryModel>;
  private defaultSkylinePoints: Array<GradeBoundaryPointsModel>;
  private memberBound: ClassMembersGrade;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private taxonomyProvider: TaxonomyProvider,
    private elementRef: ElementRef,
    private activatedRoute: ActivatedRoute,
    private sessionService: SessionService,
    private classService: ClassService,
    private parseService: ParseService
  ) {
    this.isShowExpandedGraph = false;
    this.maxDomainSize = 0;
    this.isSelectedCompetency = false;
    this.activeDomainSeq = 0;
    this.expandedGraphCellHeight = 40;
    this.cellWidth = 40;
    this.cellHeight = 40;
    this.multiGradeActiveList = [];
    this.activeGradeList = [];
    this.highestTopicSize = 0;
    this.skylinePoints = [];
    this.topicCellHeight = 40;
    this.chartData = [];
    this.gradeBoundaryPoints = [];
    this.domainBoundariesContainer = [];
    this.totalCompetenciesLength = 0;
    if (!this.isPublicClass) {
      this.isPublicClass = this.activatedRoute.snapshot.queryParams
        ? this.activatedRoute.snapshot.queryParams.isPublic
        : false;
    }
  }

  // -------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    this.isPremiumClass = this.class && this.class.isPremiumClass;
    this.selectedSubject = { ...this.activeSubject };
    this.selectedCategory = { ...this.activeCategory };
    if (this.isSkeletonChart) {
      this.loadSkeletonChart();
    }
    this.getMemberBound();
  }

  /**
   * @function getMemberBound
   * This method is used to get the member bound
   */
  private getMemberBound() {
      const userId = this.sessionService.userSession.user_id;
      this.classService.fetchClassMembers(this.class.id).then((classRes: Array<ClassMembersGrade>) => {
        const memberBound: ClassMembersGrade = classRes.find((classDetails: ClassMembersGrade) => {
          return classDetails.userId === userId;
        });
        this.memberBound = memberBound;
    });
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.class && !changes.class.firstChange) {
      this.isPremiumClass = this.class && this.class.isPremiumClass;
    }
    if (changes.showDomainInfo && !changes.showDomainInfo.firstChange) {
      if (!this.showDomainInfo) {
        this.activeDomainSeq = 0;
        this.toggleActiveDomainBar(this.activeDomainSeq, false);
      }
    }
    if (changes.class && !changes.class.firstChange && changes.class.currentValue) {
      if (!this.isSkeletonChart) {
        this.loadChartData();
      }
    }
    if (changes.domainTopicCompetencyMatrix && changes.domainTopicCompetencyMatrix.currentValue) {
      if (!this.isSkeletonChart) {
        this.clearChartData();
        this.loadChartData();
      }
    }
    if (changes.activeSubject && !changes.activeSubject.firstChange) {
      this.selectedSubject = {
        ...this.activeSubject,
      };
    }
    if (changes.activeCategory && !changes.activeCategory.firstChange) {
      this.selectedCategory = {
        ...this.activeCategory,
      };
    }
    if (changes.showCompetencyInfo && !changes.showCompetencyInfo.firstChange) {
      if (!this.showCompetencyInfo) {
        this.competencyFocusOut();
      }
    }
  }
  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function clearChartData
   * Method to is used to clear the chart data
   */
  private clearChartData() {
    this.gradeBoundaryPoints = [];
    this.skylinePoints = [];
    this.activeGradeList = [];
    this.chartData = null;
    this.highlightMasteredCompetencies = null;
    this.domainBoundariesContainer = [];
    this.totalCompetenciesLength = 0;
  }

  /**
   * @function loadSkeletonChart
   * Method to is used to load the skeleton chart
   */
  private loadSkeletonChart() {
    const parsedDomainData = this.parseDomainTopicCompetencyMatrix();
    this.chartData = parsedDomainData.sort((domain1, domain2) => domain1.domainSeq - domain2.domainSeq);
    this.drawDomainTopicCompetencyChart();
  }

  /**
   * @function loadChartData
   * Method to load the chart data
   */
  private loadChartData() {
    let classSubject = this.class && this.class.preference ? this.class.preference.subject : null;
    let classGradeId = this.class ? this.class.grade_current : null;
    if (this.class && this.class.isPublic && this.class.isPremiumClass) {
      classGradeId = this.currentGrade ? Number(this.currentGrade.id) : classGradeId;
    }
    if (this.destinationClass) {
      classSubject = this.destinationClass && this.destinationClass.preference ? this.destinationClass.preference.subject : null;
      classGradeId = this.destinationClass ? Number(this.destinationClass.grade_current) : null;
    }
    if (this.memberBound && this.memberBound.bounds.gradeUpperBound) {
     classGradeId = this.memberBound.bounds.gradeUpperBound;
    }
    // for navigator program when user selected upper bound.
    if (this.userSelectedUpperBound && this.userSelectedUpperBound !== '') {
      classGradeId = Number(this.userSelectedUpperBound);
    }
    const parsedDomainData = this.parseDomainTopicCompetencyMatrix();
    if (this.skylinePoints && this.skylinePoints.length) {
      const skylineCompetency = this.skylinePoints.find((competency) => {
        return competency.skylineCompetencySeq > 0;
      });
      if (skylineCompetency) {
        this.skylinePresent.emit();
      }
    }
    this.chartData = parsedDomainData.sort((domain1, domain2) => domain1.domainSeq - domain2.domainSeq);
    if (
      this.activeSubject.code === classSubject &&
      this.taxonomyGrades &&
      this.taxonomyGrades.length
    ) {
      const classGrade = this.taxonomyGrades.find((grade) => {
        return grade.id === Number(classGradeId);
      });
      let averageSkylineGrade = null;
      if (this.isDefaultSkyline && this.gradeLowerBound) {
        averageSkylineGrade = this.taxonomyGrades.find((grade) => {
          return grade.id === Number(this.gradeLowerBound);
        });
      }
      if (classGrade) {
        this.activeGrade = classGrade;
        this.drawHiLine(classGrade, averageSkylineGrade);
      } else {
        this.activeGrade = null;
        this.drawDomainTopicCompetencyChart();
      }
    } else {
      this.drawDomainTopicCompetencyChart();
    }
  }

  /**
   * @function addDomainBackShadow
   * Method to add domain back shadow
   */
  private addDomainBackShadow() {
    const group = d3.select('#domains-group')
      .append('defs')
      .append('filter')
      .attr('id', 'domain-shadow');
    group
      .append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '0')
      .attr('stdDeviation', '2');
  }

  /**
   * @function parseDomainTopicCompetencyMatrix
   * Method to parse the domain topics
   */
  private parseDomainTopicCompetencyMatrix() {
    const chartData = [];
    let domainTopicMetadata = this.domainCoordinates;
    let domainTopicMatrix = this.domainTopicCompetencyMatrix;
    if (this.isSkeletonChart) {
      domainTopicMetadata = this.domainCoordinatesSkeletonData;
      domainTopicMatrix = this.domainTopicCompetencyMatrixSkeletonData;
    }
    this.maxDomainSize = Math.max.apply(Math, domainTopicMatrix.map((domain) => domain.totalCompetencies || 0));
    domainTopicMetadata.map((domainMetadata: DomainTopicsModel) => {
      const topicSkylinePoints = [];
      const domainMatrix = domainTopicMatrix.find((matrix) => matrix.domainCode === domainMetadata.domainCode);
      const domainName = domainMetadata.domainName;
      const parsedDomainData = { ...domainMetadata, ...domainMatrix };
      parsedDomainData.isExpanded = this.isShowExpandedGraph;
      this.highestTopicSize = this.highestTopicSize < domainMetadata.topics.length ? domainMetadata.topics.length : this.highestTopicSize;
      if (domainMatrix && domainMatrix.topics) {
        const parsedDomainTopicData = [];
        domainMatrix.topics.map((topicMatrix) => {
          const topicMetadata = domainMetadata.topics.find((topic) => topic.topicCode === topicMatrix.topicCode);
          if (topicMatrix.competencies) {
            this.totalCompetenciesLength = this.totalCompetenciesLength + topicMatrix.competencies.length;
            topicMatrix.competencies.map((competency: TopicsCompetencyModel) => {
              competency.domainCode = domainMetadata.domainCode,
                competency.domainSeq = domainMetadata.domainSeq,
                competency.topicCode = topicMatrix.topicCode,
                competency.topicSeq = topicMatrix.topicSeq,
                competency.competencyStatus = competency.status,
                competency.isMastered = competency.status > 1,
                competency.isInferred = competency.status === 2 || competency.status === 3,
                competency.isSkylineCompetency = false,
                competency.isGradeBoundary = false,
                competency.domainName = domainName;
              return competency;
            });
            topicMatrix.competencies[0].isSkylineCompetency = true;
          }
          topicSkylinePoints.push({
            topicSeq: topicMatrix.topicSeq,
            skylineCompetencySeq: (topicMatrix.masteredCompetencies || 0),
          });
          parsedDomainTopicData.push({ ...topicMatrix, ...topicMetadata });
        });
        parsedDomainData.topics = parsedDomainTopicData;
      }
      this.skylinePoints.push({
        domainSeq: parsedDomainData.domainSeq,
        skylineCompetencySeq: parsedDomainData.masteredCompetencies,
        topicSkylinePoints,
      });
      chartData.push(parsedDomainData);
    });
    return chartData;
  }

  /**
   * @function onCloseLegendInfoPopover
   * Method to close the legend popover
   */
  public onCloseLegendInfoPopover() {
    this.closeLegendInfoPopover.emit();
  }

  /**
   * @function drawDomainTopicCompetencyChart
   * Method to draw the domain Topic chart
   */
  private drawDomainTopicCompetencyChart() {
    const component = this;
    this.expandedTopicChart = false;
    this.showExpandedChart = this.totalCompetenciesLength >= 200;
    const proficiencyChartData = this.chartData;
    let expandedDomain = null;
    const chartHeight = this.chartHeight;
    const chartWidth = this.chartWidth;
    this.cellHeight = this.isShowExpandedGraph
      ? this.expandedGraphCellHeight
      : chartHeight / this.maxDomainSize;
    let width = 0;
    if (proficiencyChartData.length > 6) {
      width =
        chartWidth / proficiencyChartData.length < 48
          ? 48
          : chartWidth / proficiencyChartData.length;
    } else {
      width = chartWidth / proficiencyChartData.length;
    }
    this.cellWidth = width;
    d3.select('svg#chart-graph').remove();
    const svg = d3.select('#chart-area')
      .append('svg')
      .attr('id', 'chart-graph')
      .attr('width', chartWidth)
      .attr('height', chartHeight);
    svg.append('g').attr('id', 'domains-group');
    component.skylineContainer = svg.append('g').attr('id', 'skyline-group');
    component.gradeLineContainer = svg.append('g').attr('id', 'gradeline-group');
    this.addDomainBackShadow();
    proficiencyChartData.map((domainChartData: DomainTopicsModel, seq) => {
      component.drawDomainChart(domainChartData);
      if (domainChartData.isExpanded) {
        this.expandedTopicChart = true;
        expandedDomain = domainChartData;
        component.drawTopicChart(domainChartData, domainChartData.domainSeq);
        component.toggleDomainGroup(
          domainChartData.domainSeq,
          domainChartData.isExpanded
        );
      }
    });
    if (!this.isSkeletonChart) {
      if (this.isDefaultSkyline) {
        component.drawDefaultSkyline();
      } else {
        component.drawProficiencySkyline();
      }
    }
    if (this.activeGradeList && this.activeGradeList.length) {
      component.populateGradeBoundaryLine();
    }
    if (!this.isSelectedCompetency) {
      const chartContainer = this.elementRef.nativeElement.querySelector('.scrollable-chart') as HTMLElement;
      chartContainer.scrollTop = chartHeight;
    }
    this.toggleChartSize(0);
    if (expandedDomain && expandedDomain.isExpanded) {
      this.highlightDomain(expandedDomain, expandedDomain.isExpanded);
    }
    this.chartLoded.emit();
    if (!this.highlightMasteredCompetencies || this.masteredCompetencies) {
      this.highlightMasteredCompetency();
    }
    this.scrollToChartView();
  }

  /**
   * @function competencyFocusIn
   * Method to set the compentency focus
   */
  public competencyFocusIn(isNoScrollToDomain) {
    const component = this;
    const selectedCompetency = component.selectedCompetency;
    if (selectedCompetency) {
      component.handleHighlightCompetency(selectedCompetency, isNoScrollToDomain);
    }
  }

  /**
   * @function competencyFocusOut
   * Method to remove the compentency focus
   */
  public competencyFocusOut() {
    d3.select('#active-competency-group').remove();
  }

  /**
   * @function getSelectedCompetencyXposition
   * Method to get the competency xPosition
   */
  public getSelectedCompetencyXposition(competency) {
    const currentDomainSeq = competency.domainSeq;
    let previousTopicsCount = 0;
    const topicSeq = competency.isExpanded ? (competency.topicSeq - 1) : 0;
    previousTopicsCount = (currentDomainSeq - 1) + topicSeq;
    return previousTopicsCount;
  }

  /**
   * @function handleHighlightCompetency
   * Method to handle the highlight competency
   */
  public handleHighlightCompetency(competency, isNoScrollToDomain?) {
    if (!isNoScrollToDomain) {
      this.scrollToDomain(competency.domainSeq, competency.topicSeq);
    }
    d3.select('#active-competency-group').remove();
    if (this.highlightMasteredCompetencies) {
      const highlightCompetency = this.highlightMasteredCompetencies;
      let selectedElement = this.elementRef.nativeElement.querySelector(
        `#domain-group-${competency.domainSeq} #topic-${competency.topicSeq} #competency-cell-${competency.competencySeq}`
      );
      let cellHeight = this.expandedGraphCellHeight;
      if (!highlightCompetency.isExpanded) {
        selectedElement = this.elementRef.nativeElement.querySelector(
          `#domain-group-${competency.domainSeq} #competencies-group .competency-${competency.domainLevelCompetencySeq}`
        );
        cellHeight = this.cellHeight + 1;
      }
      const verticalPos = 0;
      const yPosition = selectedElement ? selectedElement.getAttribute('y') : 0;
      const xPosition = this.getSelectedCompetencyXposition(competency) * this.cellWidth;
      const activeCompetencyGroup = d3.select('#chart-graph')
        .append('g')
        .attr('id', 'active-competency-group')
        .attr(
          'transform',
          `translate(${xPosition}, ${Number(yPosition)})`
        );
      activeCompetencyGroup.append('rect')
        .attr('width', this.cellWidth)
        .attr('height', cellHeight)
        .attr('class', `active-competency competency-status-fill-${competency.competencyStatus}`);
      activeCompetencyGroup.append('foreignObject')
        .attr('class', 'active-competency highlight-mastered-competency')
        .attr('width', 110)
        .attr('height', 110)
        .attr(
          'transform', `translate(-30, ${competency.isExpanded ? verticalPos : verticalPos - 10})`)
        .append('xhtml:i');
    } else {
      const selectedElement = this.elementRef.nativeElement.querySelector(
        `#domain-group-${competency.domainSeq} #topic-${competency.topicSeq} #competency-cell-${competency.competencySeq}`
      );
      const yPosition = selectedElement ? selectedElement.getAttribute('y') : 0;
      d3.select(`#domain-group-${competency.domainSeq}`)
        .append('g')
        .attr('id', 'active-competency-group')
        .attr(
          'transform',
          `translate(${(competency.topicSeq ? competency.topicSeq - 1 : 0) *
          this.cellWidth}, ${yPosition})`
        )
        .append('foreignObject')
        .attr('class', `active-competency competency-status-fill-${competency.competencyStatus}`)
        .attr('width', this.cellWidth)
        .attr('height', this.expandedGraphCellHeight)
        .append('xhtml:i');
    }
  }

  /**
   * @function drawDefaultSkyline
   * Method to draw the default SkyLine
   */
  private drawDefaultSkyline() {
    const component = this;
    const proficiencyChartData = component.chartData;
    const gradeBoundaries = component.domainBoundary;
    const gradeBoundaryPoints = [];
    if (gradeBoundaries) {
      proficiencyChartData.map((domainData) => {
        const domainGradeBoundariesList = gradeBoundaries.filter((gradeBoundary) => {
          return gradeBoundary.domainCode === domainData.domainCode;
        });
        let domainSkyLineCompSeq = 0;
        const domainTopicPoints = {
          domainSeq: domainData.domainSeq,
          topics: [],
          isExpanded: !!domainData.isExpanded,
          skylineCompetencySeq: domainSkyLineCompSeq
        };
        let isSkyLineTopicCovered = false;
        domainData.topics.map((topic) => {
          let domainGradeBoundaries = gradeBoundaries.find((grade) => {
            return grade.domainCode === domainData.domainCode;
          });
          const topicBoundaries = domainGradeBoundariesList.find(item => item.topicCode && item.topicCode === topic.topicCode);
          if (topicBoundaries) {
            domainGradeBoundaries = topicBoundaries;
          }
          let skylineCompetencySeq = !isSkyLineTopicCovered && domainGradeBoundaries && !domainGradeBoundaries.topicAverageComp && topic.competencies ? topic.competencies.length : 0;
          const topicBoundary = {
            topicSeq: topic.topicSeq,
            skylineCompetencySeq
          };
          if ((domainGradeBoundaries && topic.topicCode === domainGradeBoundaries.topicCode) || (domainGradeBoundaries && topic.topicCode === domainGradeBoundaries.highlineTopic)) {
            isSkyLineTopicCovered = true;
            skylineCompetencySeq = topic.competencies.findIndex((competency) => competency.competencyCode === (domainGradeBoundaries.topicAverageComp ? domainGradeBoundaries.topicAverageComp
              : domainGradeBoundaries.averageComp)) + 1;
          }
          topicBoundary.skylineCompetencySeq = skylineCompetencySeq;
          domainTopicPoints.topics.push(topicBoundary);
          domainSkyLineCompSeq = domainSkyLineCompSeq + skylineCompetencySeq;
        });
        domainTopicPoints.skylineCompetencySeq = domainSkyLineCompSeq;
        gradeBoundaryPoints.push(domainTopicPoints);
      });
    }
    component.defaultSkylinePoints = gradeBoundaryPoints;
    component.drawAverageSkylineLine();
  }

  /**
   * @function drawAverageSkylineLine
   * Method to draw the average SkyLine
   */
  private drawAverageSkylineLine() {
    const component = this;
    const gradeBoundaryPoints = component.defaultSkylinePoints;
    let curBarPos = 0;
    let strokeDash = 0;
    d3.select('#skyline-group polyline').remove();
    let points = '';
    gradeBoundaryPoints.forEach((domain: GradeBoundaryPointsModel) => {
      if (domain.isExpanded) {
        // Get topic bar competency pos
        domain.topics.map((topic, index) => {
          const x1 = curBarPos * this.cellWidth;
          const x2 = x1 + this.cellWidth;
          const y1 = topic.skylineCompetencySeq * this.expandedGraphCellHeight;
          const y2 = y1;
          points += ` ${`${x1},${y1}`} ${`${x2},${y2}`}`;
          curBarPos++;
          strokeDash += x1 === x2 ? Math.max(y1, y2) : Math.max(x1, x2);
        });
      } else {
        const x1 = curBarPos * this.cellWidth;
        const x2 = x1 + this.cellWidth;
        const y1 = domain.skylineCompetencySeq * this.cellHeight;
        const y2 = y1;
        strokeDash += x1 === x2 ? Math.max(y1, y2) : Math.max(x1, x2);
        points += ` ${`${x1},${y1}`} ${`${x2},${y2}`}`;
        curBarPos++;
      }
    });
    d3.select('#skyline-group')
      .append('polyline')
      .attr('points', points)
      .attr('class', 'skyline')
      .attr('stroke-dasharray', strokeDash)
      .attr('stroke-dashoffset', strokeDash);
    component.addPolylineBackshadow();
  }

  /**
   * @function populateGradeBoundaryLine
   * Method to populate the grade boundary
   */
  private populateGradeBoundaryLine() {
    const component = this;
    const activeGradeList = this.activeGradeList;
    const proficiencyChartData = component.chartData;
    const domainBoundariesContainer = component.domainBoundariesContainer;
    activeGradeList.map((gradeData, gradeSeq) => {
      const gradeBoundaryPoints = [];
      const gradeBoundaries = domainBoundariesContainer[gradeSeq];
      if (gradeBoundaries) {
        proficiencyChartData.map(domainData => {
          const domainGradeBoundariesList = gradeBoundaries.filter((domain) => {
            return domain.domainCode === domainData.domainCode;
          });
          let domainHiLineCompSeq = 0;
          const domainTopicPoints = {
            domainSeq: domainData.domainSeq,
            topics: [],
            isExpanded: !!domainData.isExpanded,
            isHiLineAvailable: !!domainGradeBoundariesList.length,
            hiLineCompSeq: domainHiLineCompSeq
          };
          let isHiLineTopicCovered = false;
          let domainGradeBoundaries = gradeBoundaries.find((grade) => {
            return grade.domainCode === domainData.domainCode;
          });
          domainData.topics.map(topic => {
            const topicBoundaries = domainGradeBoundariesList.find(item => item.topicCode && item.topicCode === topic.topicCode);
            if (topicBoundaries) {
              domainGradeBoundaries = topicBoundaries;
            }
            let hiLineCompSeq =
              !isHiLineTopicCovered && domainGradeBoundaries && !domainGradeBoundaries.topicHighlineComp && topic.competencies ? topic.competencies.length : 0;
            const topicBoundary = {
              topicSeq: topic.topicSeq,
              hiLineCompSeq
            };
            if (domainGradeBoundaries && (topic.topicCode === domainGradeBoundaries.topicCode ||
              topic.topicCode === domainGradeBoundaries.highlineTopic)) {
              isHiLineTopicCovered = true;
              if (topic.competencies) {
                topic.competencies = topic.competencies.sort((comp1, comp2) => comp1.competencySeq - comp2.competencySeq);
                hiLineCompSeq =
                  topic.competencies.findIndex(competency => competency.competencyCode === (domainGradeBoundaries.topicHighlineComp ? domainGradeBoundaries.topicHighlineComp
                    : domainGradeBoundaries.highlineComp)) + 1;
              }
            }
            topicBoundary.hiLineCompSeq = hiLineCompSeq;
            domainTopicPoints.topics.push(topicBoundary);
            domainHiLineCompSeq += hiLineCompSeq;
          });
          domainTopicPoints.hiLineCompSeq = domainHiLineCompSeq;
          gradeBoundaryPoints.push(domainTopicPoints);
        });
      }
      component.gradeBoundaryPoints = gradeBoundaryPoints;
      component.drawGradeBoundaryLine();
    });
  }

  /**
   * @function drawHiLine
   * Method to draw hi line
   */
  private drawHiLine(grade, averageSkylineGrade?) {
    const component = this;
    let activeGradeList = component.activeGradeList;
    const domainBoundariesContainer = component.domainBoundariesContainer;
    const selectedGradeSeq = grade.sequenceId;
    if (activeGradeList[`${selectedGradeSeq}`]) {
      this.drawDomainTopicCompetencyChart();
    } else {
      activeGradeList = [];
      activeGradeList[`${selectedGradeSeq}`] = grade;
      if (!domainBoundariesContainer[`${selectedGradeSeq}`]) {
        component.taxonomyProvider.fetchDomainGradeBoundaryBySubjectId(grade.id)
          .then((domainBoundary) => {
            if (averageSkylineGrade) {
              component.taxonomyProvider.fetchDomainGradeBoundaryBySubjectId(averageSkylineGrade.id).then((skylineBoundary) => {
                component.domainBoundary = skylineBoundary;
                domainBoundariesContainer[`${selectedGradeSeq}`] = domainBoundary;
                component.domainBoundariesContainer = domainBoundariesContainer;
                component.activeGradeList = activeGradeList;
                this.drawDomainTopicCompetencyChart();
              });
            } else {
              domainBoundariesContainer[`${selectedGradeSeq}`] = domainBoundary;
              component.domainBoundariesContainer = domainBoundariesContainer;
              component.activeGradeList = activeGradeList;
              this.drawDomainTopicCompetencyChart();
            }
          });
      } else {
        component.domainBoundariesContainer = domainBoundariesContainer;
        component.activeGradeList = activeGradeList;
        this.drawDomainTopicCompetencyChart();
      }
      component.domainBoundariesContainer = domainBoundariesContainer;
      component.activeGradeList = activeGradeList;
    }
  }

  /**
   * @function drawGradeBoundaryLine
   * Method to draw the grade boundary line
   */
  public drawGradeBoundaryLine() {
    const component = this;
    const gradeBoundaryPoints = component.gradeBoundaryPoints;
    let curBarPos = 0;
    let strokeDash = 0;
    d3.select('#gradeline-group polyline').remove();
    let points = '';
    gradeBoundaryPoints.forEach(domain => {
      if (domain.isExpanded) {
        // Get topic bar competency pos
        domain.topics.map((topic, index) => {
          const x1 = curBarPos * this.cellWidth;
          const x2 = x1 + this.cellWidth;
          const y1 = topic.hiLineCompSeq * this.expandedGraphCellHeight;
          const y2 = y1;
          points += ` ${`${x1},${y1}`} ${`${x2},${y2}`}`;
          curBarPos++;
          strokeDash += x1 === x2 ? Math.max(y1, y2) : Math.max(x1, x2);
        });
      } else {
        const x1 = curBarPos * this.cellWidth;
        const x2 = x1 + this.cellWidth;
        const y1 = domain.hiLineCompSeq * this.cellHeight;
        const y2 = y1;
        strokeDash += x1 === x2 ? Math.max(y1, y2) : Math.max(x1, x2);
        points += ` ${`${x1},${y1}`} ${`${x2},${y2}`}`;
        curBarPos++;
      }
    });
    d3.select('#gradeline-group')
      .append('polyline')
      .attr('points', points)
      .attr('class', 'skyline')
      .attr('stroke-dasharray', strokeDash)
      .attr('stroke-dashoffset', strokeDash);
    this.addGradelineBackshadow();
  }

  /**
   * @function clearDomains
   * Method to clear the expanded domain
   */
  public clearDomains(domain, isExpand) {
    const selectedDomain = this.skylinePoints.find((skylineDomain) => {
      return skylineDomain.domainSeq === domain.domainSeq;
    });
    if (selectedDomain) {
      selectedDomain.isExpanded = isExpand;
    }
    this.handleDomainBarTransition(domain, domain.domainSeq, isExpand);
  }

  /**
   * @function onExpandDomain
   * Method to expand the domain
   */
  public onExpandDomain(domain, isHighlightMasteredCompetency?) {
    this.isExpanding = true;
    domain.isExpanded = true;
    const activeDomains = this.chartData.filter((item) => {
      if (item.isExpanded && item.domainSeq !== domain.domainSeq) {
        item.isExpanded = false;
        return item;
      }
    });
    activeDomains.push(domain);
    activeDomains.forEach((item) => {
      if (item.isExpanded) {
        setTimeout(() => {
          this.hasNextActiveDomain = false;
          this.clearDomains(domain, domain.isExpanded);
          this.handleExpandedTopicChartHeight();
          this.highlightDomain(domain, domain.isExpanded);
          this.drawTopicChart(domain, domain.domainSeq);
          this.openDomainPullUp(domain);
        }, 30);
      } else {
        this.hasNextActiveDomain = true;
        item.isExpanded = true;
        this.clearDomains(item, false);
      }
    });
    if (this.highlightMasteredCompetencies) {
      this.highlightMasteredCompetencies.isExpanded = true;
      this.handleHighlightCompetency(this.highlightMasteredCompetencies);
    }
    this.isExpanding = false;
    this.parseService.trackEvent(EVENTS.CLICK_PROFICIENCY_CHARTS_DOMAIN_COMPTENCY);
  }

  /**
   * @function openDomainPullUp
   * Method to open the domain pull up
   */
  private openDomainPullUp(domain) {
    setTimeout(() => {
      this.selectDomain.emit(domain);
    }, 1300);
  }

  /**
   * @function handleExpandedTopicChartHeight
   * Method to handle the expanded topic height
   */
  public handleExpandedTopicChartHeight() {
    this.toggleChartSize(0);
    this.scrollToChartView();
  }

  /**
   * @function onCloseDomain
   * Method triggers when user click the domain close
   */
  public onCloseDomain(domain) {
    this.isExpanding = true;
    domain.isExpanded = false;
    if (domain && domain.domainSeq) {
      this.handleDomainBarTransition(domain, domain.domainSeq, domain.isExpanded);
    }
    if (this.isShowExpandedGraph) {
      this.drawExpandedDomainChart(domain, domain.domainSeq);
    }
    this.handleExpandedTopicChartHeight();
    this.isExpanding = false;
    this.highlightDomain(domain, domain.isExpanded);
    if (this.highlightMasteredCompetencies) {
      this.highlightMasteredCompetencies.isExpanded = false;
      this.handleHighlightCompetency(this.highlightMasteredCompetencies);
    }
  }

  /**
   * @function closeExpandedPopover
   * This method is used to close the expanded popover
   */
  public onCloseExpandedPopover() {
    this.closeExpandedPopover.emit();
  }

  /**
   * @function onSelectCategory
   * Method to set the selected category
   */
  public onSelectCategory(item) {
    const category = item.detail.value;
    if (this.selectedCategory.code !== category.code) {
      this.selectCategory.emit(category);
    }
  }

  /**
   * @function compareWithCode
   * This method is used to check the code
   */
  public compareWithCode(item1, item2) {
    return item1 && item2 ? item1.id === item2.id : false;
  }

  /**
   * @function onSelectSubject
   * Method to set the selected subjects
   */
  public onSelectSubject(item) {
    const subject = item.detail.value;
    if (this.selectedSubject.code !== subject.code) {
      this.selectSubject.emit(subject);
      this.domainBoundariesContainer = [];
    }
  }

  /**
   * @function selectGrade
   * Method to set the selected grade
   */
  public selectGrade(gradeData) {
    const component = this;
    component.activeGrade = gradeData.detail.value;
    this.drawHiLine(component.activeGrade);
  }

  /**
   * @function onClickLegend
   * Method to show the legend report
   */
  public onClickLegend(event) {
    event.stopPropagation();
    this.onCloseLegendInfoPopover();
    this.selectLegend.emit();
  }

  /**
   * @function onToggleGraphView
   * Method to toggle the graph view
   */
  public onToggleGraphView() {
    this.onCloseExpandedPopover();
    this.isSelectedCompetency = false;
    this.multiGradeActiveList.map((grade) => {
      this.drawGradeBoundaryLine();
    });
    if (this.activeDomainSeq) {
      this.toggleActiveDomainBar(this.activeDomainSeq, true);
    }
    const component = this;
    component.isShowExpandedGraph = !component.isShowExpandedGraph;
    component.isSelectedCompetency = false;
    this.skylinePoints.map((point: SkyLineCompetencyModel) => {
      point.isExpanded = component.isShowExpandedGraph ? true : false;
      return point;
    });
    this.chartData.map((domain: DomainTopicsModel) => {
      domain.isExpanded = component.isShowExpandedGraph ? true : false;
      return domain;
    });
    this.drawDomainTopicCompetencyChart();
    if (component.activeDomainSeq) {
      component.toggleActiveDomainBar(component.activeDomainSeq, true);
    }
    this.handleExpandedTopicChartHeight();
  }

  public ngOnDestroy() {
    this.trackProficiencyViewEvent.emit();
    this.chartData = null;
    this.domainCoordinates = null;
    this.domainTopicCompetencyMatrix = null;
    d3.select('svg#chart-graph').remove();
    this.highlightMasteredCompetencies = null;
  }

  /**
   * @function onSelectCompetency
   * Method to send the selected compentency data to parent
   */
  public onSelectCompetency(competency) {
    const component = this;
    this.activeCompetency = competency;
    this.selectedCompetency = competency;
    this.isCompetencyActive = true;
    component.competencyFocusIn(true);
    const domainCompetencyList = component.chartData.find((domain) => {
      return domain.domainCode === competency.domainCode;
    });
    const eventContent = { competency, activeGrade: this.activeGrade, selectedSubject: this.selectedSubject };
    this.trackInspectCompetencyEvent.emit(eventContent);
    this.selectCompetency.emit({
      competency,
      domainCompetencyList
    });
  }

  /**
   * @function onSelectDomain
   * Method will trigger when user select domain
   */
  public onSelectDomain(domain) {
    if (!domain.competencies) {
      domain = this.chartData.find((domainChart) => {
        return domainChart.domainCode === domain.domainCode;
      });
    }
    this.activeDomainSeq = domain.domainSeq;
    this.toggleActiveDomainBar(domain.domainSeq, true);
    this.selectDomain.emit(domain);
  }

  /**
   * @function toggleActiveDomainBar
   * Method will trigger when user toggle domain
   */
  private toggleActiveDomainBar(seq, isActive) {
    const component = this;
    component.domainCoordinates.forEach((domainCoordinate) => {
      const domainBar = this.elementRef.nativeElement.querySelector(
        `#domain-group-${domainCoordinate.domainSeq}`
      );
      domainBar.classList.remove('non-active', 'active');
      if (isActive) {
        domainBar.classList.add('non-active');
      }
    });
    if (seq > 0) {
      const activeDomainBar = this.elementRef.nativeElement.querySelector(
        `#domain-group-${seq}`
      );
      activeDomainBar.classList.add('active');
      activeDomainBar.classList.remove('non-active');
    }
  }

  /**
   * @function drawExpandedDomainChart
   * Method to draw the expanded domain chart
   */
  public drawExpandedDomainChart(domainChartData, domainSeq) {
    const component = this;
    const cellWidth = component.cellWidth;
    const cellHeight = component.expandedGraphCellHeight;
    const domainGroup = d3.select(`#domain-group-${domainSeq}`);
    let competencySeq = -1;
    const chartHeight = this.chartHeight;
    this.handleExpandedTopicChartHeight();
    d3.selectAll('.domain-highlight').attr('height', chartHeight);
    domainGroup.select('#competencies-group').remove();
    const domainCompetencyGroup = domainGroup.append('g').attr('id', 'competencies-group')
      .on('click', () => {
        this.isExpanding = true;
        this.handleDomainBarTransition(domainChartData, domainSeq);
        this.drawTopicChart(domainChartData, domainSeq);
        this.isExpanding = false;
      });
    const groupedDomainCompetencies = new Array(domainChartData.totalCompetencies).fill({});
    const competencyCells = domainCompetencyGroup.selectAll('.competency').data(groupedDomainCompetencies);
    competencyCells
      .enter()
      .append('rect')
      .attr('class', (competency: TopicsCompetencyModel, index: number) => {
        const curPos = index + 1;
        const statusNumber = curPos <= domainChartData.masteredCompetencies ? '4' : curPos <= domainChartData.masteredCompetencies + domainChartData.inprogressCompetencies ? '1' : '0';
        return `competency-cell competency-${index + 1} competency-status-fill-${statusNumber} ${competency.isSkylineCompetency ? 'skyline-competency' : ''}`;
      })
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('x', 0)
      .attr('y', (competency: TopicsCompetencyModel, index: number) => {
        competencySeq++;
        return competencySeq * cellHeight;
      });
    competencyCells.exit().remove();
  }

  /**
   * @function scrollToChartView
   * Method to scroll to the chart view
   */
  private scrollToChartView() {
    this.chartContainer.nativeElement.scrollTop = this.chartContainer.nativeElement.scrollHeight;
  }

  /**
   * @function highlightMasteredCompetency
   * Method is used to highlight the mastered competency
   */
  public highlightMasteredCompetency() {
    if (this.masteredCompetencies && this.masteredCompetencies.length) {
      const masteredCompetency = this.masteredCompetencies[0];
      const domainCode = getDomainCode(masteredCompetency);
      const domain = this.chartData.find((item) => item.domainCode === domainCode);
      const topics = domain.topics;
      let competencyData: TopicsCompetencyModel = null;
      const selectedTopic = topics.find((topic) => {
        return topic.competencies.some((competency) => {
          const isEarnedBadge = this.masteredCompetencies.includes(
            competency.competencyCode
          );
          if (isEarnedBadge) {
            competencyData = competency;
            return isEarnedBadge;
          }
        });
      });
      domain.isShowMasteredCompetency = true;
      competencyData.domainLevelCompetencySeq = domain.masteredCompetencies - 1;
      this.highlightMasteredCompetencies = competencyData;
      if (this.highlightMasteredCompetencies) {
        this.onSelectTopic(selectedTopic, domain, competencyData);
        this.onExpandDomain(domain, true);
      }
    }
  }

  /**
   * @function drawProficiencySkyline
   * Method to draw the skyline
   */
  private drawProficiencySkyline() {
    const component = this;
    const cellWidth = component.cellWidth;
    let points = '';
    d3.select('#skyline-group polyline').remove();
    let curBarPos = 0;
    let strokeDash = 0;
    let adjustableWidth = 10;
    this.skylinePoints.forEach((domain: SkyLineCompetencyModel) => {
      if (domain.isExpanded) {
        // Get topic bar competency pos
        adjustableWidth = 10;
        domain.topicSkylinePoints.map((topic: TopicSkylinePointsModel, index: number) => {
          let end = 0;
          if (index === domain.topicSkylinePoints.length - 1) {
            end = 10;
          }
          const x1 = curBarPos * cellWidth;
          const x2 = x1 + cellWidth;
          const y1 = topic.skylineCompetencySeq * this.topicCellHeight;
          const y2 = y1;
          points += ` ${x1 + ',' + y1} ${x2 + ',' + y2}`;
          curBarPos++;
          strokeDash += (x1 === x2
            ? Math.max(y1, y2)
            : Math.max(x1, x2));
        });
      } else {
        const x1 = curBarPos * cellWidth;
        const x2 = x1 + cellWidth;
        const y1 = domain.skylineCompetencySeq * this.cellHeight;
        const y2 = y1;
        strokeDash += (x1 === x2
          ? Math.max(y1, y2)
          : Math.max(x1, x2));
        points += ` ${x1 + ',' + y1} ${x2 + ',' + y2}`;
        curBarPos++;
      }
    });
    d3.select('#skyline-group')
      .append('polyline')
      .attr('points', points)
      .attr('class', 'skyline')
      .attr('stroke-dasharray', strokeDash)
      .attr('stroke-dashoffset', strokeDash);
    component.addPolylineBackshadow();
  }

  /**
   * @function addPolylineBackshadow
   * Method to show a drop shadow in skyline
   */
  public addPolylineBackshadow() {
    const basePath = window.location.href;
    const polylineContainer = this.skylineContainer;
    const filterContainer = polylineContainer
      .append('defs')
      .append('filter')
      .attr('id', 'skyline-back-shadow');
    filterContainer
      .append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '0')
      .attr('stdDeviation', '3');
    polylineContainer
      .append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', 0)
      .attr('class', 'skyline-back-shadow');
    polylineContainer.style('filter', `url(${basePath}#skyline-back-shadow)`);
  }

  /**
   * @function addGradelineBackshadow
   * Method to show a drop shadow in gradeline
   */
  public addGradelineBackshadow() {
    const basePath = window.location.href;
    const polylineContainer = this.gradeLineContainer;
    const filterContainer = polylineContainer
      .append('defs')
      .append('filter')
      .attr('id', 'gradeline-back-shadow');
    filterContainer
      .append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '0')
      .attr('stdDeviation', '4');
    polylineContainer
      .append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', 0)
      .attr('class', 'gradeline-back-shadow');
    polylineContainer.style('filter', `url(${basePath}#gradeline-back-shadow)`);
  }

  /**
   * @function drawDomainChart
   * Method to draw domain chart
   */
  public drawDomainChart(domainChartData: DomainTopicsModel) {
    const component = this;
    const domainSeq = domainChartData.domainSeq;
    const gradeBoundaries = component.domainBoundary;
    const isNoSkylineData = gradeBoundaries && this.isDefaultSkyline;
    let domainHiLineCompSeq = 0;
    let isHiLineTopicCovered = false;
    if (isNoSkylineData) {
      const domainGradeBoundariesList = gradeBoundaries.filter((domain) => {
        return domain.domainCode === domainChartData.domainCode;
      });
      domainChartData.topics.map((topic) => {
        let domainGradeBoundaries = gradeBoundaries.find((grade) => {
          return grade.domainCode === domainChartData.domainCode;
        });
        const topicBoundaries = domainGradeBoundariesList.find(item => item.topicCode && item.topicCode === topic.topicCode);
        if (topicBoundaries) {
          domainGradeBoundaries = topicBoundaries;
        }
        let skylineCompetencySeq = !isHiLineTopicCovered && domainGradeBoundaries && !domainGradeBoundaries.topicAverageComp && topic.competencies ? topic.competencies.length : 0;
        if ((domainGradeBoundaries && topic.topicCode === domainGradeBoundaries.topicCode) || (domainGradeBoundaries && topic.topicCode === domainGradeBoundaries.highlineTopic)) {
          isHiLineTopicCovered = true;
          skylineCompetencySeq = topic.competencies.findIndex((competency) => competency.competencyCode === (domainGradeBoundaries.topicAverageComp ? domainGradeBoundaries.topicAverageComp
            : domainGradeBoundaries.averageComp)) + 1;
        }
        domainHiLineCompSeq = domainHiLineCompSeq + skylineCompetencySeq;
      });
    }
    const svg = d3.select('#domains-group');
    const cellHeight = component.cellHeight;
    let domainCellWidth = this.cellWidth;
    let competencySeq = -1;
    const domainGroup = svg.append('g').attr('id', `domain-group-${domainSeq}`);
    let transformX = domainCellWidth * (domainSeq - 1);
    if (this.isShowExpandedGraph || this.expandedTopicChart) {
      const prevDomain = this.elementRef.nativeElement.querySelector(`#domain-group-${domainSeq - 1}`) as HTMLElement;
      if (prevDomain) {
        transformX =
          Number(component.getTranslation(prevDomain.getAttribute('transform'))[0]) +
          Number(prevDomain.getAttribute('width'));
      }
    }
    if (domainChartData.isExpanded) {
      domainCellWidth = domainChartData.topics.length * this.cellWidth;
    }
    domainGroup.attr('transform', `translate(${transformX}, 0)`);
    domainGroup.attr('width', domainCellWidth);
    domainGroup.attr('class', 'domain-group-item');
    const domainCompetencyGroup = domainGroup.append('g').attr('id', 'competencies-group')
      .on('click', () => {
        this.isExpanding = true;
        this.handleDomainBarTransition(domainChartData, domainSeq);
        this.drawTopicChart(domainChartData, domainSeq);
        this.isExpanding = false;
      });
    const groupedDomainCompetencies = new Array(domainChartData.totalCompetencies).fill({});
    const competencyCells = domainCompetencyGroup.selectAll('.competency').data(groupedDomainCompetencies);
    if (this.isSkeletonChart) {
      competencyCells
        .enter().append('foreignObject')
        .attr('class', 'active-competency highlight-mastered-competency')
        .attr('width', this.cellWidth)
        .attr('height', cellHeight)
        .attr('transform', (competency: TopicsCompetencyModel, index: number) => {
          competencySeq++;
          return `translate(0, ${competencySeq * cellHeight})`;
        })
        .append('xhtml:ion-skeleton-text')
        .attr('animated', 'true')
        .attr('width', this.cellWidth)
        .attr('height', cellHeight);
    } else {
      competencyCells
        .enter()
        .append('rect')
        .attr('class', (competency: TopicsCompetencyModel, index: number) => {
          const curPos = index + 1;
          let statusNumber = curPos <= domainChartData.masteredCompetencies ? '4' :
            curPos <= domainChartData.masteredCompetencies + domainChartData.inprogressCompetencies ? '1' : '0';
          if (this.isSkeletonChart) {
            statusNumber = '0';
          }
          if (isNoSkylineData) {
            statusNumber = curPos <= domainHiLineCompSeq ? '4' : '0';
          }
          const isSkeletonChart = this.isSkeletonChart ? 'skeleton-cell' : null;
          return `competency-cell competency-${index + 1} ${isSkeletonChart} competency-status-fill-${statusNumber} ${competency.isSkylineCompetency ? 'skyline-competency' : ''}`;
        })
        .attr('width', this.cellWidth)
        .attr('height', cellHeight)
        .attr('x', 0)
        .attr('y', (competency: TopicsCompetencyModel, index: number) => {
          competencySeq++;
          return competencySeq * cellHeight;
        });
    }
    competencyCells.exit().remove();
  }

  /**
   * @function toggleChartSize
   * Method to toggle the chart size
   */
  private toggleChartSize(numberOfColumns, isExpand: boolean = false, isAdjust: boolean = true) {
    const numberOfCompetenciesInExtendedDomain = this.numberOfCompetenciesInExtendedDomain;
    const numberOfCompetenciesInCompressedDomain = this.numberOfCompetenciesInCompressedDomain;
    let domainChartheight = 0;
    let topicChartHeight = 0;
    if (this.isShowExpandedGraph) {
      domainChartheight = numberOfCompetenciesInCompressedDomain * this.expandedGraphCellHeight;
    } else {
      domainChartheight = numberOfCompetenciesInCompressedDomain * this.cellHeight;
    }
    topicChartHeight = numberOfCompetenciesInExtendedDomain * this.expandedGraphCellHeight;
    if (topicChartHeight > domainChartheight) {
      d3.select('#chart-graph').attr('height', topicChartHeight);
    } else {
      d3.select('#chart-graph').attr('height', (domainChartheight + 6));
    }
    if (numberOfColumns > 1) {
      const chartWidth = parseFloat(d3.select('#chart-graph').attr('width'));
      const adjustableWidth = this.cellWidth * (numberOfColumns - 1);
      let updatedWidth = adjustableWidth;
      if (isAdjust) {
        updatedWidth = isExpand ? chartWidth + adjustableWidth : chartWidth - adjustableWidth;
      }
      if (updatedWidth > 0) {
        d3.select('#chart-graph').attr('width', updatedWidth);
      }
    }
  }

  /**
   * @function drawTopicChart
   * Method to draw the topic chart
   */
  private drawTopicChart(domain: DomainTopicsModel, domainSeq: number) {
    const domainGroup = d3.select(`#domain-group-${domainSeq}`);
    domainGroup.select('#topic-group').remove();
    const topicGroup = domainGroup.append('g').attr('id', `topic-group`);
    domain.topics.map((topic: TopicsModel, seq: number) => {
      const topicContainer = topicGroup.append('g').attr('id', `topic-${seq + 1}`)
        .attr('transform', `translate(${seq * this.cellWidth}, 0)`);
      if (topic.competencies) {
        const competencyCells = topicContainer.selectAll('.competency').data(topic.competencies);
        competencyCells.enter()
          .append('rect')
          .on('click', (competency: TopicsCompetencyModel) => {
            this.highlightCompetency(competency);
            this.onSelectCompetency(competency);
          })
          .transition()
          .duration(600)
          .delay(400)
          .attr('id', (competency: TopicsCompetencyModel) => {
            return `competency-cell-${competency.competencySeq}`;
          })
          .attr('width', this.cellWidth)
          .attr('height', this.topicCellHeight)
          .attr('x', 0)
          .attr('y', (d: TopicsCompetencyModel, i: number) => {
            return i * this.topicCellHeight;
          })
          .attr('class', (competency: TopicsCompetencyModel) => {
            return `competency-cell topic-competency-cell competency-status-fill-${competency.status}
            ${competency.isSkylineCompetency ? 'skyline-competency' : ''} ${!competency.isMappedWithFramework ? 'competency-status-fill-not-framework' : ''}`;
          });
        competencyCells.exit().remove();
      }
    });
    if (this.highlightMasteredCompetencies) {
      setTimeout(() => {
        this.handleHighlightCompetency(this.highlightMasteredCompetencies);
      }, 2000);
    }
  }

  /**
   * @function toggleDomainGroup
   * Method to toggle the domain group
   */
  private toggleDomainGroup(domainSeq: number, isExpand: boolean) {
    const domainGroup = d3.select(`#domain-group-${domainSeq}`);
    this.chartData.map((domain: DomainTopicsModel) => domain.isActive = false);
    if (isExpand) {
      domainGroup.select('#competencies-group').attr('class', 'hidden');
      domainGroup.select('#topic-group').attr('class', 'show');
      this.skylinePoints[domainSeq - 1].isExpanded = true;
      this.chartData[domainSeq - 1]['isExpanded'] = true;
      this.chartData[domainSeq - 1]['isActive'] = true;
    } else {
      domainGroup.select('#competencies-group').attr('class', 'show');
      domainGroup.select('#topic-group').attr('class', 'hidden');
      this.skylinePoints[domainSeq - 1].isExpanded = false;
      this.chartData[domainSeq - 1]['isExpanded'] = false;
    }
    if (!this.isShowExpandedGraph && !this.hasNextActiveDomain) {
      const nativeElement = this.elementRef.nativeElement;
      const element = nativeElement.querySelector(`.domain-${domainSeq}`);
      nativeElement.querySelector('.chart-view').scrollTo({
        left: element.offsetLeft,
        behavior: 'smooth'
      });
    }
  }

  /**
   * @function scrollToDomain
   * Method to scroll to the domain
   */
  public scrollToDomain(domainSeq, topicSeq?) {
    const nativeElement = this.elementRef.nativeElement;
    if (topicSeq && this.highlightMasteredCompetencies && this.highlightMasteredCompetencies.isExpanded) {
      const element = nativeElement.querySelector(`.domain-${domainSeq}-topic-${topicSeq}`);
      nativeElement.querySelector('.chart-view').scrollTo({
        left: element.offsetLeft - (this.cellWidth * 2),
        behavior: 'smooth'
      });
    } else {
      const element = nativeElement.querySelector(`.domain-${domainSeq}`);
      nativeElement.querySelector('.chart-view').scrollLeft = element.offsetLeft - this.cellWidth;
    }
  }

  /**
   * @function getTranslation
   * Method to get the traslation
   */
  public getTranslation(transform) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttributeNS(null, 'transform', transform);
    const matrix = g.transform.baseVal.consolidate().matrix;
    return [matrix.e, matrix.f];
  }

  /**
   * @function highlightDomain
   * Method to used to highlight domain
   */
  private highlightDomain(domain, isExpand) {
    const domainBar = d3.selectAll('.domain-group-item');
    if (isExpand) {
      domainBar.classed('mask', true);
      d3.select(`#domain-group-${domain.domainSeq}`).classed('mask', false);
    } else {
      domainBar.classed('mask', false);
    }
  }

  /**
   * @function handleDomainBarTransition
   * Method to handle the domain bar transition
   */
  private handleDomainBarTransition(domain: DomainTopicsModel, domainSeq: number, isExpand: boolean = true) {
    let lastMovingDomain = isExpand ? this.chartData.length : domainSeq + 1;
    const numberOfColumns = domain.topics.length > 1 ? domain.topics.length : 0;
    if (numberOfColumns > 1) {
      while ((lastMovingDomain > domainSeq && isExpand) || (!isExpand && lastMovingDomain <= this.chartData.length)) {
        const domainGroup = d3.select(`#domain-group-${lastMovingDomain}`);
        const traslation = this.getTranslation(domainGroup.attr('transform'));
        const xValue = isExpand ?
          traslation[0] + ((numberOfColumns - 1) * this.cellWidth) :
          traslation[0] - ((numberOfColumns - 1) * this.cellWidth);
        // Required while adding gap between domain panel
        domainGroup.transition()
          .duration(this.hasNextActiveDomain ? 0 : 800)
          .attr('transform', `translate(${xValue}, 0)`);
        isExpand ? lastMovingDomain-- : lastMovingDomain++;
      }
    }
    this.toggleChartSize(numberOfColumns, isExpand);
    this.toggleDomainGroup(domainSeq, isExpand);
    if (this.isDefaultSkyline) {
      this.drawDefaultSkyline();
    } else {
      this.drawProficiencySkyline();
    }
    this.populateGradeBoundaryLine();
  }

  /**
   * @function onSelectTopic
   * Method triggers when user click the topic
   */
  public onSelectTopic(topic, domain?, competency?) {
    this.selectTopic.emit({ topic, domain, competency });
  }

  /**
   * @function getCellheight
   * This method is used to get the cell height
   */
  private getCellheight(competency) {
    const masteredCompetencyCellHeight = 6;
    if (this.masteredCompetencies && !this.isShowExpandedGraph) {
      const isMasteredCompetency = this.masteredCompetencies.includes(
        competency.competencyCode
      );
      if (isMasteredCompetency) {
        return masteredCompetencyCellHeight;
      }
    }
    return this.cellHeight;
  }

  /**
   * @function highlightCompetency
   * Method to highlight the selected competncy
   */
  private highlightCompetency(competency: TopicsCompetencyModel) {
    const component = this;
    const height = this.getCellheight(competency);
    const domainSeq = competency.domainSeq;
    const competencySeq = competency.competencySeq;
    return {
      left: (domainSeq - 1) * component.cellWidth + 'px',
      top: (competencySeq - 1) * component.cellHeight + 'px',
      width: component.cellWidth + 'px',
      height: height + 'px',
    };
  }

  /**
   * @function showGutCompetencyColorGradient
   * Method to draw the competency gradient
   */
  public showGutCompetencyColorGradient() {
    const chartContainer = d3.select('#cells-group');
    const svgDefs = chartContainer.append('defs');
    const linearGradient = svgDefs
      .append('linearGradient')
      .attr('id', 'linearGradient')
      .attr('x2', '0%')
      .attr('y2', '100%');
    linearGradient
      .append('stop')
      .attr('class', 'stop-top')
      .attr('offset', '0');
    linearGradient
      .append('stop')
      .attr('class', 'stop-bottom')
      .attr('offset', '1');
  }
}
