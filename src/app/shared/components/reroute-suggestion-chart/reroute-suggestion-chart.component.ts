import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ASSESSMENT, COLLECTION, CONTENT_TYPES } from '@app/shared/constants/helper-constants';
import { MilestoneModel } from '@app/shared/models/milestone/milestone';
import { RerouteSuggestionsModel } from '@app/shared/models/suggestion/suggestion';
import { CollectionService } from '@app/shared/providers/service/collection/collection.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-reroute-suggestion-chart',
  templateUrl: './reroute-suggestion-chart.component.html',
  styleUrls: ['./reroute-suggestion-chart.component.scss'],
})
export class RerouteSuggestionChartComponent implements OnInit, OnChanges, AfterViewChecked {

  @Input() public rerouteContent;
  @Input() public selectedLesson;
  @Input() public classId: string;
  @Input() public courseId: string;
  @Input() public milestone: MilestoneModel;
  @Output() public playContent = new EventEmitter();
  @Output() public showContentReport = new EventEmitter();
  @ViewChild('chartEl', {read: ElementRef, static: false}) public chartEl: ElementRef;
  public lineGroups: d3.Selection<SVGGElement, unknown, null, undefined>;
  public suggestedContent: Array<RerouteSuggestionsModel>;
  public totalRows: Array<{}> = [];
  public isZoom: boolean;
  public isRoute: boolean;
  public get standards() {
    return Object.values(this.selectedLesson.aggregatedTaxonomy || {});
  }

  constructor(
    private collectionService: CollectionService
  ) {
    this.suggestedContent = [];
    this.totalRows = [];
    this.isZoom = false;
    this.isRoute = false;
   }

  public ngOnInit() {
    this.parseSuggestionList();
  }

  public ngAfterViewChecked() {
    this.drawChartLine();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.rerouteContent && changes.rerouteContent.currentValue) {
      this.parseSuggestionList();
    }
  }

  // ------------------------------------------------------------------
  // Actions

  /**
   * @function onSelectLesson
   * Action will trigger when click lesson icon
   */
  public async onSelectLesson(content) {
    if (content.format === CONTENT_TYPES.LESSON) {
      this.loadSuggestionLessonPerformance(content);
      this.loadLessonCollections(content);
    }
  }

  /**
   * @function onPlaySuggestion
   * Action will trigger when click play button from card
   */
  public onPlaySuggestion(content) {
    const isLesson  = content.format === CONTENT_TYPES.LESSON;
    this.playContent.emit({
      collection: !isLesson ? content.contextContext : null,
      lesson: isLesson ? content.contextContext :  content.lessonContent,
      milestone: this.milestone
    });
  }

  /**
   * @function toggleZoom
   * Action will trigger when click zoom icon on top right to expand the route
   */
  public toggleZoom() {
    this.isZoom = !this.isZoom;
    setTimeout(() => {
      this.drawChartLine();
    }, 100);
  }

  /**
   * @function showReport
   * Action will trigger when click performance score / timespent
   */
  public showReport(content) {
    const isLesson  = content.format === CONTENT_TYPES.LESSON;
    if (isLesson) {
      this.loadSuggestionLessonPerformance(content.contextContext);
    }
    this.showContentReport.emit({
      collection: !isLesson ? content.contextContext : null,
      lesson: isLesson ? content.contextContext :  content.lessonContent,
      milestone: this.milestone
    });
  }


  // ------------------------------------------------------------------
  // Methods

  /**
   * @method drawChartLine
   * Help to generate svg component for the route line
   */
  public drawChartLine() {
    const chartEl = this.chartEl.nativeElement;
    const container = d3.select(chartEl).select('.route-line-chart');
    container.select('svg').remove();
    const svg = container.append('svg');
    const clientRect = chartEl.getClientRects()[0];
    if (clientRect) {
      const width = clientRect.width;
      svg.attr('width', width).attr('height', clientRect.height);
      this.lineGroups = svg.append('g');
      this.shuffleElementPosition();
    }
  }

  /**
   * @method shuffleElementPosition
   * help to render the path line in between the content icon
   */
  public shuffleElementPosition() {
    const lineGroups = this.lineGroups;
    const rowItems = this.chartEl.nativeElement.querySelectorAll('.reroute-path-panel');
    let startPointX = 25;
    let startPointY = 0;
    let isRightBend = true;
    Array.from(rowItems).forEach((rowItem: HTMLElement, rowIndex) => {
      let rowContents: any = rowItem.querySelectorAll('.collection-panel-sections');
      rowContents = Array.from(rowContents);
      if (rowContents) {
        rowContents.forEach((el: any, elIndex: number) => {
          const childEl = el.querySelector('.collection-icon');
          const midHeight = childEl.offsetHeight / 2;
          let x = el.offsetLeft + childEl.offsetLeft + 15;
          let y = childEl.offsetTop + midHeight + el.offsetTop;
          let curveX1 = startPointX;
          let curveY1 = y;
          let curveX2 = x;
          let curveY2 = y;
          // Help to identify the curve is to be right bend or left bend
          if (x === startPointX) {
            const arcPoint = y - startPointY;
            curveX1 = isRightBend
              ? startPointX + arcPoint
              : startPointX - (this.isZoom ? arcPoint / 2.3  : arcPoint);
            curveX2 = isRightBend ? x + arcPoint : x - (this.isZoom ? arcPoint / 2.3  : arcPoint);
            curveY1 = startPointY;
            isRightBend = !isRightBend;
          }
          // Draw the connector path between two content / lesson
          lineGroups
            .append('path')
            .attr(
              'd',
              `M ${startPointX} ${startPointY} C ${curveX1} ${curveY1} ${curveX2} ${curveY2} ${x} ${y}`,
            );
          startPointX = x;
          startPointY = y;
          if (
            rowItems.length - 1 === rowIndex &&
            rowContents.length - 1 === elIndex
          ) {
            if (rowIndex % 2 === 0) {
              y = startPointY + 50;
              curveX1 = startPointX + 50;
              curveY1 = startPointY;
              curveX2 = curveX1;
              curveY2 = y;
              lineGroups
                .append('path')
                .attr(
                  'd',
                  `M ${startPointX} ${startPointY} C ${curveX1} ${curveY1} ${curveX2} ${curveY2} ${x} ${y}`,
                );
            }
            // End curve to join the next lesson
            startPointY = y;
            x = 25;
            y = this.chartEl.nativeElement.clientHeight;
            curveX1 = x;
            curveY1 = startPointY;
            curveX2 = x;
            curveY2 = startPointY;
            lineGroups
              .append('path')
              .attr(
                'd',
                `M ${startPointX} ${startPointY} C ${curveX1} ${curveY1} ${curveX2} ${curveY2} ${x} ${y}`,
                );
              }
            });
          }
        });
      }

  /**
   * @method parseSuggestionList
   * Help to serialize the content for the route
   */
  public parseSuggestionList() {
    const rerouteContents = this.rerouteContent;
    const suggestionList = [];
    const activeLesson = this.selectedLesson;
    rerouteContents.forEach(content => {
        const routeContent = !content.format
          ? this.buildSuggestionList(content)
          : this.createCollection(content, activeLesson);
        suggestionList.push(routeContent);
      });
    this.suggestedContent =  suggestionList;
    this.calculateTotalRows();
  }

  /**
   * @method buildSuggestionList
   * Help to serialize the lesson level content
   */
  public buildSuggestionList(content) {
    const collectionSet = [...content.collections].map(collection => {
      return this.createCollection(collection, content);
    });
    const standards = this.standards;
    const competencyObj: any = standards[0] || {};
    return {
      title: content.lessonTitle,
      format: CONTENT_TYPES.LESSON,
      performance: content.performance,
      collections: collectionSet,
      competencyDisplayCode: competencyObj.code,
      lessonId: content.lessonId,
      unitId: content.unitId,
      contextContext: content
    };
  }

  /**
   * @method createCollection
   * Help to serialize the collection level data
   */
  public createCollection(content, lessonContent = null) {
    const standards = this.standards;
    const competencyObj: any = standards[0] || {};
    content.lessonId = lessonContent.lessonId;
    return {
      title: content.title,
      format: content.format,
      performance: content.performance,
      id: content.id,
      competencyDisplayCode: competencyObj.code,
      parentId: lessonContent.lessonId,
      isSuggested: content.isSuggested,
      contextContext: content,
      lessonContent
    };
  }

  /**
   * @method loadLessonCollections
   * Help to load the collection from selected lesson
   */
  public async loadLessonCollections(content) {
    let routeContents = this.suggestedContent;
    content.isExpanded = !content.isExpanded;
    if (content.isExpanded) {
      routeContents.splice(
        routeContents.indexOf(content) + 1,
        0,
        ...content.collections
      );
    } else {
      routeContents = routeContents.filter(
        item => content.lessonId !== item.parentId
      );
    }
    this.suggestedContent = routeContents;
    this.calculateTotalRows();
  }

  /**
   * @method loadSuggestionLessonPerformance
   * Help to load the collection content performance
   */
  public async loadSuggestionLessonPerformance(lesson) {
    const collections = lesson.collections;
    await this.collectionService.fetchCollectionPerformance(this.classId, this.courseId, lesson.lessonId, lesson.unitId, ASSESSMENT, collections);
    await this.collectionService.fetchCollectionPerformance(this.classId, this.courseId, lesson.lessonId, lesson.unitId, COLLECTION, collections);
    collections.forEach(collection => {
      if (collection.performance) {
        collection.contextContext.performance = collection.performance;
      }
    });
  }

  /**
   * @method calculateTotalRows
   * Help to calculate the list for rows to render the path
   */
  public calculateTotalRows() {
    let avgCount = 0;
    for (let i = 0; i < this.suggestedContent.length; i++) {
      if (i % 3 === 0) {
        avgCount++;
      }
    }
    this.totalRows = new Array(avgCount).fill({});
    this.isRoute = this.totalRows &&  this.totalRows.length <= 3 ? true : false;
  }
}
