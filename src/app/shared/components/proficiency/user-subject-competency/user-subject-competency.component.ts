import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { COMPETENCY_STATUS_VALUE } from '@shared/constants/helper-constants';
import { SubjectCompetencyMatrixModel, UserSubjectCompetencySkylinePointsModel } from '@shared/models/competency/competency';
import { CompetencyService } from '@shared/providers/service/competency/competency.service';
import { LookupService } from '@shared/providers/service/lookup/lookup.service';
import { NavigatorService } from '@shared/providers/service/navigator/navigator.service';
import * as d3 from 'd3';

@Component({
  selector: 'user-subject-competency',
  templateUrl: './user-subject-competency.component.html',
  styleUrls: ['./user-subject-competency.component.scss']
})
export class UserSubjectCompetencyComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties
  public subjectCompetencyMatrixData: Array<SubjectCompetencyMatrixModel>;
  private maxUserSubjectCompetenciesCount: number;
  private skylinePoints: Array<UserSubjectCompetencySkylinePointsModel>;
  public userSubjectWidth: number;
  private cellHeight: number;
  private cellSpace: number;
  @Input() private subjectCode: string;

  // -------------------------------------------------------------------------
  // Dependency Injection

  public constructor(
    private navigatorService: NavigatorService,
    private router: Router,
    private competencyService: CompetencyService,
    private elementRef: ElementRef,
    private modalCtrl: ModalController,
    private lookupService: LookupService
  ) { }

  // -------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    this.subjectCompetencyMatrixData = null;
    this.skylinePoints = [];
    this.maxUserSubjectCompetenciesCount = 0;
    this.userSubjectWidth = 60;
    this.cellHeight = 4;
    this.cellSpace = 3;
    this.loadData();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadData
   * Method to load the competency matrix data
   */
  public async loadData() {
    const tenantSettings: any = await this.lookupService.fetchTenantSettings();
    const subjectCompetencyMatrixData = await this.competencyService.getUserSubjectCompetencyMatrix();
    const sortedSubjects = this.sortSubjectFacetBasedOnTenant(tenantSettings.preferredFacetSubjectCodes, subjectCompetencyMatrixData || []);
    if (sortedSubjects) {
      this.parseSubjectCompetencyMatrix(sortedSubjects);
    }
    const userSelectedSubject = this.navigatorService.getUserSelectedSubject;
    const subjectCode = userSelectedSubject ? userSelectedSubject.subjectCode : this.subjectCode;
    if (subjectCode) {
      this.setActiveUserSubject(subjectCode);
    }
  }

  /**
   * @function sortSubjectFacetBasedOnTenant
   * Method to sort the subject facets based on tenant settings
   */
  private sortSubjectFacetBasedOnTenant(preferredFacetSubjects, subjectCompetencyMatrixData) {
    if (preferredFacetSubjects) {
      return preferredFacetSubjects.map((preferredFacetSubject) => {
        return subjectCompetencyMatrixData.find((item) => item.subjectCode === preferredFacetSubject);
      });
    }
    return subjectCompetencyMatrixData;
  }

  /**
   * @function parseSubjectCompetencyMatrix
   * Method to parse the subject competency matrix
   */
  private parseSubjectCompetencyMatrix(subjectsCompetencyMatrix) {
    const component = this;
    this.subjectCompetencyMatrixData = subjectsCompetencyMatrix.map
      ((subjectCompetencyMatrix: SubjectCompetencyMatrixModel) => {
        if (subjectCompetencyMatrix) {
          const competencyStats = subjectCompetencyMatrix.competencyStats;
          let totalCompetenciesCount = 0;
          let masteredCompetenciesCount = 0;
          let inprogressCompetenciescount = 0;
          let notstartedCompetenciescount = 0;
          competencyStats.map((competencyStat) => {
            const competencyStatus = competencyStat.competencyStatus;
            const competenciesCount = competencyStat.competencyCount;
            if (competencyStatus >= COMPETENCY_STATUS_VALUE.INFERRED
              && competencyStatus <= COMPETENCY_STATUS_VALUE.DEMONSTRATED) {
              masteredCompetenciesCount += competenciesCount;
            } else if (competencyStatus === COMPETENCY_STATUS_VALUE.IN_PROGRESS) {
              inprogressCompetenciescount += competenciesCount;
            } else {
              notstartedCompetenciescount += competenciesCount;
            }
          });
          const userSubjectCompetenciesCount = [
            {
              status: COMPETENCY_STATUS_VALUE.DEMONSTRATED,
              count: masteredCompetenciesCount,
            },
            {
              status: COMPETENCY_STATUS_VALUE.IN_PROGRESS,
              count: inprogressCompetenciescount,
            },
            {
              status: COMPETENCY_STATUS_VALUE.NOT_STARTED,
              count: notstartedCompetenciescount,
            },
          ];
          subjectCompetencyMatrix.masteredCompetenciesCount = masteredCompetenciesCount;
          totalCompetenciesCount = (masteredCompetenciesCount +
            inprogressCompetenciescount + notstartedCompetenciescount);
          subjectCompetencyMatrix.competenciesCount = userSubjectCompetenciesCount;
          subjectCompetencyMatrix.totalCompetenciesCount = totalCompetenciesCount;
        }
        return subjectCompetencyMatrix;
      });
    component.loadChartData();
  }

  /**
   * @function onClose
   * Method to close the modal
   */
  public onClose() {
    this.modalCtrl.dismiss();
  }

  /**
   * @function onChooseUserSubject
   * Method triggers when user choose the location
   */
  public onChooseUserSubject(subject) {
    const subjectCode = subject.subjectCode;
    const userSelectedSubject = this.navigatorService.getUserSelectedSubject;
    const selectedSubjectCode = userSelectedSubject ? userSelectedSubject.subjectCode : null;
    if (subjectCode !== selectedSubjectCode) {
      this.setActiveUserSubject(subjectCode);
      this.navigatorService.setDestinationClass(null);
      this.navigatorService.setUserSelectedSubject(subject);
      this.onClose();
      this.navigate(subjectCode);
    } else {
      this.onClose();
    }
  }

  /**
   * @function navigate
   * This method is used to navigate to the navigator page
   */
  private navigate(subjectCode) {
    this.router.navigate(['/navigator'], { queryParams: { subjectCode } });
  }

  /**
   * @function setActiveUserSubject
   * Method calls when user click the user subject
   */
  public setActiveUserSubject(subjectCode) {
    this.subjectCompetencyMatrixData.map((userSubject) => {
      return userSubject.isActive = userSubject.subjectCode === subjectCode;
    });
  }

  /**
   * @function loadChartData
   * Method to load the chart data
   */
  private loadChartData() {
    const subjectCompetencyMatrixData = this.subjectCompetencyMatrixData;
    let maxUserSubjectCompetenciesCount = 0;
    subjectCompetencyMatrixData.map((activeUserSubjectMatrix: SubjectCompetencyMatrixModel) => {
      if (activeUserSubjectMatrix) {
        maxUserSubjectCompetenciesCount = (activeUserSubjectMatrix.totalCompetenciesCount > maxUserSubjectCompetenciesCount)
          ? activeUserSubjectMatrix.totalCompetenciesCount : maxUserSubjectCompetenciesCount;
      }
    });
    this.maxUserSubjectCompetenciesCount = maxUserSubjectCompetenciesCount;
    // this time out is used to get the chart element after rendering
    setTimeout(() => {
      this.drawUserSubjectChart(subjectCompetencyMatrixData);
    }, 100);
  }

  /**
   * @function drawUserSubjectChart
   * Method to draw the userSubject chart
   */
  private drawUserSubjectChart(userSubjectsMatrix: Array<SubjectCompetencyMatrixModel>) {
    const component = this;
    d3.select('#chart-container').remove();
    const chartViewElement = this.elementRef.nativeElement.querySelector('#user-subject-chart-view') as HTMLElement;
    let chartWidth = chartViewElement.offsetWidth;
    const chartHeight = chartViewElement.offsetHeight;
    const totalUserSubject = userSubjectsMatrix.length || 0;
    let highestUserSubjectCount = 0;
    let totalCompetencies = 0;
    let highestMasteredCount = 0;
    userSubjectsMatrix.map((userSubject: SubjectCompetencyMatrixModel) => {
      if (userSubject) {
        const userSubjectMasteredCount = userSubject.competenciesCount.find((competencyCount) => Number(competencyCount.status) === COMPETENCY_STATUS_VALUE.DEMONSTRATED);
        highestMasteredCount = highestMasteredCount < userSubjectMasteredCount.count ? userSubjectMasteredCount.count : highestMasteredCount;
        totalCompetencies += userSubject.totalCompetenciesCount;
        highestUserSubjectCount = highestUserSubjectCount < userSubject.totalCompetenciesCount ? userSubject.totalCompetenciesCount : highestUserSubjectCount;
      }
    });
    let userSubjectColumnWidth = component.userSubjectWidth;
    if (totalUserSubject <= 3) {
      if (totalUserSubject === 1) {
        userSubjectColumnWidth = chartWidth / 2;
      } else {
        const spaceAround = chartWidth / totalUserSubject;
        userSubjectColumnWidth = (chartWidth - spaceAround) / totalUserSubject;
      }
    }
    // cellSpace is used to add a space between each competency cell
    chartWidth = (userSubjectColumnWidth * totalUserSubject) + (this.cellSpace * totalUserSubject);
    const svg = d3.select('#user-subject-chart-view')
      .append('svg').attr('id', 'chart-container')
      .attr('width', chartWidth).attr('height', chartHeight);
    svg.append('g').attr('id', 'user-subject-group');
    svg.append('g').attr('id', 'user-subject-skyline-group');
    userSubjectsMatrix.forEach((userSubjectMatrix, seq) => {
      if (userSubjectMatrix) {
        component.drawUserSubjectColumn(userSubjectMatrix, chartHeight, userSubjectColumnWidth, seq);
      }
    });
    component.drawSkyline();
    chartViewElement.scrollTop = chartViewElement.scrollHeight;
  }

  /**
   * @function drawUserSubjectColumn
   * Method to draw the userSubject column
   */
  private drawUserSubjectColumn(userSubjectMatrix, chartHeight, width, seq) {
    const component = this;
    let competencySeq = -1;
    const chartHeightLevel = component.maxUserSubjectCompetenciesCount * this.cellHeight;
    const userSubjectGroup = d3.select('#user-subject-group').append('g');
    chartHeight = chartHeight - 5;
    userSubjectMatrix.competenciesCount.forEach((competency) => {
      let height = competency.count / chartHeightLevel * 100;
      height = Number((height * chartHeight) / 100);
      // cellSpace is used to add a space between each competency cell
      this.userSubjectWidth = (width + this.cellSpace);
      const hasHighMaster = ((height * this.cellHeight) / competency.count) > this.cellHeight;
      const expandedCell = hasHighMaster ? ((height * this.cellHeight) / competency.count) : this.cellHeight;
      userSubjectGroup
        .selectAll('.competency')
        .data(() => {
          const competencyList = [];
          for (let i = 0; i < (hasHighMaster ? (competency.count) : height); i++) {
            competencyList.push(i);
          }
          return competencyList;
        })
        .enter()
        .append('rect')
        .attr('class', `status-${competency.status}`)
        .attr('x', ((this.userSubjectWidth) * seq))
        .attr('y', () => {
          competencySeq++;
          return competencySeq * expandedCell;
        })
        .attr('width', width)
        .attr('height', expandedCell);
      if (competency.status === COMPETENCY_STATUS_VALUE.DEMONSTRATED) {
        component.skylinePoints.push({
          x1: (this.userSubjectWidth * seq),
          y1: expandedCell ? (competencySeq + 1) * expandedCell : 0,
          x2: (this.userSubjectWidth * seq + this.userSubjectWidth),
          y2: expandedCell ? (competencySeq + 1) * expandedCell : 0,
        });
      }
    });
  }

  /**
   * @function drawSkyline
   * Method to draw the skyline
   */
  private drawSkyline() {
    const component = this;
    const basePath = window.location.href;
    const skylineGroup = d3.select('#user-subject-skyline-group');
    const skylinePoints = component.skylinePoints;
    let points = '';
    skylinePoints.map((skylinePoint: UserSubjectCompetencySkylinePointsModel) => {
      points += ` ${skylinePoint.x1},${skylinePoint.y1} ${skylinePoint.x2},${skylinePoint.y2}`;
    });
    skylineGroup.append('polyline')
      .attr('points', points)
      .attr('class', 'user-subject-skyline');
    const filterContainer = skylineGroup
      .append('defs')
      .append('filter')
      .attr('id', 'subject-skyline-back-shadow');
    filterContainer
      .append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '0')
      .attr('stdDeviation', '2');
    skylineGroup
      .append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', 0)
      .attr('class', 'subject-skyline-shadow');
    skylineGroup.style('filter', `url(${basePath}#subject-skyline-back-shadow`);
  }
}
