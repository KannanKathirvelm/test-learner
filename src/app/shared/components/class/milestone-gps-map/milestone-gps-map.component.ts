import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { LessonListPullupComponent } from '@app/shared/components/lesson-list-pullup/lesson-list-pullup.component';
import { ClassModel } from '@app/shared/models/class/class';
import { TenantSettingsModel } from '@app/shared/models/tenant/tenant-settings';
import { environment } from '@environment/environment';
import { PopoverController } from '@ionic/angular';
import { settings } from '@shared/components/class/milestone-gps-map/gps-map.settings';
import { PublisherInfoPanelComponent } from '@shared/components/class/publisher-info-panel/publisher-info-panel.component';
import { TitlePopoverComponent } from '@shared/components/title-popover/title-popover.component';
import { ALTER_RESOURCE_CONTENT_KEYS, DATA_COLLECTIONS_KEYS, ERROR_TYPES, PATH_TYPES, RESOURCES_IMAGES, RESOURCES_LOADER_IMAGES } from '@shared/constants/helper-constants';
import { MAP_RESOURCE_STUB_DATA } from '@shared/constants/map-resource-constants';
import { CollectionModel } from '@shared/models/collection/collection';
import { LessonModel } from '@shared/models/lesson/lesson';
import { MilestoneLocationModel } from '@shared/models/location/location';
import { AlternativeLearningContentsModel, CompetencyAlternativeLearningContentsModel, DomainAlternativeLearningContentsModel, MilestoneDetailsModel, MilestoneModel, TopicAlternativeLearningContentsModel } from '@shared/models/milestone/milestone';
import { ClassService } from '@shared/providers/service/class/class.service';
import { CollectionService } from '@shared/providers/service/collection/collection.service';
import { LocationService } from '@shared/providers/service/location/location.service';
import { MilestoneService } from '@shared/providers/service/milestone/milestone.service';
import { ModalService } from '@shared/providers/service/modal.service';
import { ParseService } from '@shared/providers/service/parse/parse.service';
import { chunkArray, getDefaultImageXS, validateObject } from '@shared/utils/global';
import { Layer, Path, Point, PointText, Project, Raster, Shape, Size } from 'paper';

enum MAP_ZOOM_LEVELS {
  DEFAULT_LEVEL = 0,
  DOMAIN_LEVEL = 1,
  TOPIC_LEVEL = 2,
  COLLECTION_LEVEL = 3
}

@Component({
  selector: 'milestone-gps-map',
  templateUrl: './milestone-gps-map.component.html',
  styleUrls: ['./milestone-gps-map.component.scss'],
})
export class MilestoneGpsMapComponent implements OnInit, OnChanges, OnDestroy {

  // -------------------------------------------------------------------------
  // Properties
  private readonly START_POINT_OFFSET = 25;
  private readonly END_POINT_OFFSET = 50;
  private readonly MAX_RESOURCES_IN_PATH = 4;
  private readonly CURRENT_LOCATION_OFFSET_WIDTH = 40;
  private readonly DEFAULT_COMPETENCY_COUNT = 10;
  private readonly MINIMUM_COMPETENCY_COUNT = 5;
  private readonly ALTERNATE_PATH = 'alternate_path';
  private readonly MILESTONE_PATH = 'milestone_path';
  private alternatePaths = [];
  private project: any;
  private blankRouteProject: any;
  private milestoneMainPath: any;
  private milestoneBlankRoutePath: any;
  private domainLevelPath: any;
  private topicLevelPath: any;
  public stubResourceJson: {
    contents: Array<{
      contentSubtype: string;
    }>
  };
  private classId: string;
  public fwCode: string;
  private componentLoaded: boolean;
  public isSkeletonResource: boolean;
  public isShowCurrentLocation: boolean;
  public isToggleSkeletonResource: boolean;
  public isLoadingContent: boolean;
  public lessons: Array<LessonModel>;
  public currentLesson: LessonModel;
  public collection: CollectionModel;
  public currentLocation: MilestoneLocationModel;
  public milestonesPoints: any;
  public domainPoints: any;
  public topicPoints: any;
  public domainCodes = [];
  public topicCodes = [];
  public competencyCodes = [];
  public collectionList = [];
  public framework: string;
  public courseId: string;
  public collectionPoints: any;
  public selectedDataList = [];
  public lessonSequence: number;
  public alternatePath = [];
  public plottedResourcePoint = [];
  public selectedMilestoneId: string;
  private milestonesResourceContents: Array<AlternativeLearningContentsModel>;
  private domainResourceContents: Array<DomainAlternativeLearningContentsModel>;
  private topicResourceContents: Array<TopicAlternativeLearningContentsModel>;
  private competencyResourceContents: Array<CompetencyAlternativeLearningContentsModel>;
  public currentLocationPosition: { left: number, top: number };
  public isShowCurrentLocationAnimation: boolean;
  public resourceDefaultImages: Array<{ id: string, url: string }>;
  public resourceLoaderImages: Array<{ id: string, url: string }>;
  @Input() public contentWidth: number;
  @Input() public contentHeight: number;
  @Input() public isPageRefresh: boolean;
  @Input() public milestones: Array<MilestoneModel> = [];
  @Input() public class: ClassModel;
  @Input() public tenantSettings: TenantSettingsModel;
  @Input() public milestoneDetails: Array<MilestoneDetailsModel>;
  @Output() public playCollection = new EventEmitter();
  @Output() public openMilestoneReport: EventEmitter<number> = new EventEmitter();
  @Output() public gpsMapLoaded = new EventEmitter();
  @ViewChild('mapElement', { read: ElementRef, static: true }) public mapElement: ElementRef;
  @ViewChild('mapElementBlankRoute', { read: ElementRef, static: true }) public mapElementBlankRoute: ElementRef;
  @ViewChild('milestoneIconElement', { read: ElementRef, static: true }) public milestoneIconElement: ElementRef;
  @ViewChild('destinationIconElement', { read: ElementRef, static: true }) public destinationIconElement: ElementRef;
  @ViewChild('startPointIconElement', { read: ElementRef, static: true }) public startPointIconElement: ElementRef;
  @ViewChild('domainIconElement', { read: ElementRef, static: true }) public domainIconElement: ElementRef;
  @ViewChild('topicIconElement', { read: ElementRef, static: true }) public topicIconElement: ElementRef;
  @ViewChild('competencyIconElement', { read: ElementRef, static: true }) public competencyIconElement: ElementRef;
  @ViewChild('publisherIconElement', { read: ElementRef, static: true }) public publisherIconElement: ElementRef;
  @ViewChild('locationIconElement', { read: ElementRef, static: true }) public locationIconElement: ElementRef;
  @ViewChild('skeletonResourceIcon', { read: ElementRef, static: true }) public skeletonResourceIcon: ElementRef;
  @ViewChild('popoverElement', { read: ElementRef, static: true }) public popoverElement: ElementRef;
  public currentZoomLevel: number;
  private skeletonResourceInterval: any;

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private elementRef: ElementRef,
    private collectionService: CollectionService,
    private parseService: ParseService,
    private locationService: LocationService,
    private milestoneService: MilestoneService,
    private classService: ClassService,
    private modalService: ModalService,
    private popoverController: PopoverController,
    private ref: ChangeDetectorRef
  ) {
    this.currentZoomLevel = MAP_ZOOM_LEVELS.DEFAULT_LEVEL;
    this.componentLoaded = false;
    this.isSkeletonResource = false;
    this.isToggleSkeletonResource = false;
  }

  // --------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    this.lessonSequence = 1;
    this.isShowCurrentLocation = false;
    this.isShowCurrentLocationAnimation = false;
    this.resourceDefaultImages = RESOURCES_IMAGES;
    this.resourceLoaderImages = RESOURCES_LOADER_IMAGES;
    this.loadData();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.milestones && changes.milestones.currentValue && !this.componentLoaded) {
      this.isSkeletonResource = false;
      clearInterval(this.skeletonResourceInterval);
      this.loadContents();
      this.componentLoaded = true;
      this.gpsMapLoaded.emit();
    }
    if (changes.isPageRefresh && changes.isPageRefresh.currentValue) {
      this.reInitializeProject();
    }
  }

  public ngOnDestroy() {
    clearInterval(this.skeletonResourceInterval);
    this.componentLoaded = false;
  }

  // --------------------------------------------------------------------------
  // Methods


  /**
   * @function reInitializeProject
   * This method is used to reinitialize the project
   */
  private reInitializeProject() {
    clearInterval(this.skeletonResourceInterval);
    this.currentZoomLevel = MAP_ZOOM_LEVELS.DEFAULT_LEVEL;
    this.currentLesson = null;
    this.currentLocation = null;
    this.collection = null;
    this.componentLoaded = false;
    this.lessonSequence = 1;
    this.isShowCurrentLocation = false;
    this.project.remove();
    this.blankRouteProject.remove();
    this.loadData();
  }

  /**
   * @function loadContents
   * This method is used to load the contents data
   */
  private async loadContents() {
    this.milestonesPoints = [];
    this.domainPoints = [];
    this.topicPoints = [];
    this.collectionPoints = [];
    const classDetails = this.classService.class;
    this.framework = classDetails.preference && classDetails.preference.framework ? classDetails.preference.framework : null;
    this.courseId = classDetails.course_id ? classDetails.course_id : null;
    this.classId = classDetails.id;
    this.milestonesResourceContents = await this.milestoneService.fetchMilestoneLearningContents(this.courseId, this.classId, this.framework);
    if (!this.milestoneMainPath) {
      await this.drawMilestonePath(true);
    }
    this.plotDataPointsInPath(this.milestoneMainPath, this.milestones, this.milestonesPoints);
    this.plotCurrentLocationPoint();
    this.plotResourcesInAlternatePath();
    this.isLoadingContent = false;
  }

  /**
   * @function loadData
   * This method is used to load the data
   */
  public async loadData() {
    this.stubResourceJson = MAP_RESOURCE_STUB_DATA;
    const classDetails = this.classService.class;
    this.classId = classDetails.id;
    const subjectCode = classDetails.preference ? classDetails.preference.subject : null;
    const milestonesRoutes = await this.milestoneService.fetchMilestoneRoutes(this.classId, false, subjectCode);
    const pathCoordinates: any = milestonesRoutes['milestone_route_path_coordinates'];
    if (!pathCoordinates) {
      const errorMessage = `Coordinates are empty for given class ${this.classId}`;
      // tslint:disable-next-line
      console.error(errorMessage);
      this.trackErrorLog(errorMessage);
      return;
    }
    this.handleAlternatePaths(pathCoordinates);
    this.project = new Project(this.mapElement.nativeElement);
    this.blankRouteProject = new Project(this.mapElementBlankRoute.nativeElement);
    this.blankRouteProject.importJSON(pathCoordinates);
    this.project.importJSON(pathCoordinates);
    this.drawMilestonePath(true);
    this.removeAlterPaths();
    this.isLoadingContent = true;
    this.playSkeletonResources();
  }

  /**
   * @function trackErrorLog
   * This method is used to track the error log
   */
  private trackErrorLog(errorMessage) {
    this.parseService.trackErrorLog(ERROR_TYPES.FATAL, errorMessage);
  }

  /**
   * @function drawMilestonePath
   * This method is used to draw milestone path
   */
  private drawMilestonePath(isBlankRoute?) {
    const milestoneMainPath = this.getPath(this.MILESTONE_PATH, isBlankRoute);
    if (milestoneMainPath) {
      if (isBlankRoute) {
        this.applySettings(milestoneMainPath, settings.milestonePathAlter);
        milestoneMainPath.fitBounds(this.blankRouteProject.view.bounds);
        this.milestoneBlankRoutePath = milestoneMainPath;
      } else {
        this.applySettings(milestoneMainPath, settings.milestonePath);
        milestoneMainPath.fitBounds(this.project.view.bounds);
        this.milestoneMainPath = milestoneMainPath;
        if (this.milestoneMainPath && !environment.DISABLE_GPS_MAP_ZOOM) {
          this.milestoneMainPath.onClick = (milestoneEvent) => {
            this.domainLevelPath = this.HandlePathPlot(milestoneEvent, this.milestoneDetails, this.milestoneMainPath, this.milestoneBlankRoutePath, this.domainPoints);
            if (this.domainLevelPath.nextLevelMainPath) {
              this.domainLevelPath.nextLevelMainPath.onClick = (domainEvent) => {
                this.topicLevelPath = this.HandlePathPlot(domainEvent, this.domainLevelPath.nextDataList, this.domainLevelPath.nextLevelMainPath, this.domainLevelPath.nextAlterPath, this.topicPoints);
                if (this.topicLevelPath.nextLevelMainPath) {
                  this.topicLevelPath.nextLevelMainPath.onClick = (topicEvent) => {
                    this.HandlePathPlot(topicEvent, this.topicLevelPath.nextDataList, this.topicLevelPath.nextLevelMainPath, this.topicLevelPath.nextAlterPath, this.collectionPoints);
                  };
                }
              };
            }
          };
        }
      }
    } else {
      const errorMessage = `Cannot able to render milestone path for given class ${this.classId}`;
      // tslint:disable-next-line
      console.error(errorMessage);
      this.trackErrorLog(errorMessage);
    }
  }

  /**
   * @function HandlePathPlot
   * This method is used to handle the plotting in the path
   */
  private HandlePathPlot(pathEvent, dataCollections, mainPath, alterPath, dataPoints) {
    this.isLoadingContent = true;
    const neartestPoints = this.findNearestDataPoints(pathEvent.point);
    const selectedId = validateObject(neartestPoints) && (this.currentZoomLevel > 0 ? neartestPoints.start.id : neartestPoints.end.id);
    if (this.currentZoomLevel < MAP_ZOOM_LEVELS.DOMAIN_LEVEL) {
      this.selectedMilestoneId = selectedId;
    }
    const selectedData = dataCollections && dataCollections.find((data) => data[ALTER_RESOURCE_CONTENT_KEYS[this.currentZoomLevel]] === selectedId);
    if (!selectedData) {
      this.isLoadingContent = false;
      return {};  // return empty json if the user clicks the wrong path
    }
    this.selectedDataList = selectedData[DATA_COLLECTIONS_KEYS[this.currentZoomLevel]] || [];
    this.currentZoomLevel++;
    const currentPlotKey = ALTER_RESOURCE_CONTENT_KEYS[this.currentZoomLevel];
    this[`${currentPlotKey}s`] = this.selectedDataList.map((item) => item[currentPlotKey]);
    this.collectionList = this.currentZoomLevel === MAP_ZOOM_LEVELS.COLLECTION_LEVEL ? this.selectedDataList : [];
    this.getAlterResourceContent();
    const nextLevelData = this.onZoomIn(neartestPoints, mainPath, alterPath, this.selectedDataList, dataPoints);
    return {
      nextLevelMainPath: nextLevelData && nextLevelData.nextLevelMainPath,
      nextAlterPath: nextLevelData && nextLevelData.nextAlterPath,
      nextDataList: this.selectedDataList
    };
  }

  /**
   * @function getAlterResourceContent
   * This method is used to get alter resource contents
   */
  private async getAlterResourceContent() {
    const currentPlotKey = ALTER_RESOURCE_CONTENT_KEYS[this.currentZoomLevel];
    const currentDataCodes = this[`${currentPlotKey}s`] || [];
    if (currentDataCodes.length) {
      this.playSkeletonResources();
      switch (this.currentZoomLevel) {
        case MAP_ZOOM_LEVELS.DOMAIN_LEVEL:
          this.domainResourceContents = await this.milestoneService.fetchDomainLearningContents(this.courseId, this.classId, this.framework, currentDataCodes);
          break;
        case MAP_ZOOM_LEVELS.TOPIC_LEVEL:
          this.topicResourceContents = await this.milestoneService.fetchTopicLearningContents(this.courseId, this.classId, this.framework, currentDataCodes);
          break;
        case MAP_ZOOM_LEVELS.COLLECTION_LEVEL:
          this.competencyResourceContents = await this.milestoneService.fetchCompetencyLearningContents(this.courseId, this.classId, this.framework, currentDataCodes);
          break;
      }
      this.plotResourcesInAlternatePath();
    }
  }

  /**
   * @function onZoomIn
   * This method is used to zoom in to the clicked path
   */
  private onZoomIn(neartestPoints, mainPath, alterPath, dataList, dataPoints) {
    this.ref.detectChanges();
    const startPoint = neartestPoints['start'].point;
    const endPoint = neartestPoints['end'].point;
    const nextLevelMainPath = this.findSelectedPath(mainPath, startPoint, endPoint);
    const nextAlterPath = this.findSelectedPath(alterPath, startPoint, endPoint);
    const newSelectedLayer = this.project.addLayer(new Layer({
      children: [nextAlterPath, nextLevelMainPath]
    }));
    this.hideBlankPath();
    this.hideActiveLayer();
    this.activateLayer(newSelectedLayer);
    this.plotDataPointsInPath(nextLevelMainPath, dataList, dataPoints, neartestPoints);
    return {
      nextLevelMainPath,
      nextAlterPath
    };
  }

  /**
   * @function findSelectedPath
   * This method is used to find out the selected path
   */
  private findSelectedPath(routePath, startPoint, endPoint) {
    const routeStartClonePath = routePath.clone({ insert: false });
    const routeEndClonePath = routePath.clone({ insert: false });
    const startLocationPath = routeStartClonePath.getLocationOf(startPoint);
    const endLocationPath = routeEndClonePath.getLocationOf(endPoint);
    const selectedStartPath = routeStartClonePath.splitAt(startLocationPath);
    const selectedEndPath = routeEndClonePath.splitAt(endLocationPath);
    const intersections = selectedStartPath.getIntersections(selectedEndPath);
    const targets = [];
    intersections.forEach((location) => {
      let newTarget = selectedStartPath.splitAt(location);
      const isNew = newTarget !== selectedStartPath;
      if (!newTarget) {
        newTarget = location._path;
      }
      if (isNew) {
        targets.push(newTarget);
      }
    });
    const intersectionPath = targets.find((target) => !target._curves);
    intersectionPath.fitBounds(this.project.view.bounds);
    return intersectionPath;
  }

  /**
   * @function zoomOut
   * This method is used to zoom out and show the last active layer
   */
  public zoomOut() {
    this.currentZoomLevel--;
    this.ref.detectChanges();
    this.removeActiveLayer();
    const lastActiveLayer = this.getLastActiveLayer();
    this.showActiveLayer(lastActiveLayer);
    if (this.currentZoomLevel === MAP_ZOOM_LEVELS.DEFAULT_LEVEL) {
      this.showMilestonePathInBlankLayer();
    }
  }

  private removeActiveLayer() {
    const lastActiveLayer = this.getLastActiveLayer();
    lastActiveLayer.remove();
  }

  private hideActiveLayer() {
    const activeLayer = this.project.activeLayer;
    activeLayer.visible = false;
  }

  private hideBlankPath() {
    const milestonePathLayer = this.getPath(this.MILESTONE_PATH, true);
    milestonePathLayer.visible = false;
  }

  private showMilestonePathInBlankLayer() {
    const milestonePathLayer = this.getPath(this.MILESTONE_PATH, true);
    milestonePathLayer.visible = true;
  }

  private showActiveLayer(layer) {
    layer.visible = true;
  }

  private activateLayer(layer) {
    layer.activate();
  }

  private getLastActiveLayer() {
    const childrens = this.project._children;
    return childrens[childrens.length - 1];
  }

  /**
   * @function findNearestDataPoints
   * This method is used to find nearest data points
   */
  private findNearestDataPoints(point): any {
    let nearestPoints = {};
    let dataPoints = [];
    switch (this.currentZoomLevel) {
      case MAP_ZOOM_LEVELS.DOMAIN_LEVEL:
        dataPoints = this.domainPoints;
        break;
      case MAP_ZOOM_LEVELS.TOPIC_LEVEL:
        dataPoints = this.topicPoints;
        break;
      case MAP_ZOOM_LEVELS.COLLECTION_LEVEL:
        dataPoints = this.collectionPoints;
        break;
      default:
        dataPoints = this.milestonesPoints;
    }
    dataPoints.reduce((previousItem, currentItem) => {
      if (currentItem.point.y <= point.y && previousItem.point.y >= point.y) {
        nearestPoints = {
          start: previousItem,
          end: currentItem
        };
      }
      return currentItem;
    });
    return nearestPoints;
  }

  /**
   * @function getSkeletonResources
   * This method is used to get all the skeleton resources
   */
  private getSkeletonResources() {
    return this.project.getItems({
      data(item) {
        return item.isSkeletonResource;
      }
    });
  }

  /**
   * @function drawAlternatePaths
   * This method is used to draw alternate paths
   */
  private drawAlternatePaths() {
    const milestoneMainPath = this.milestoneMainPath;
    const alternatePaths = this.getPaths(this.ALTERNATE_PATH);
    alternatePaths.forEach((alternatePath) => {
      this.applySettings(alternatePath, settings.alternatePath);
      alternatePath.insertBelow(milestoneMainPath);
      alternatePath.insertBelow(this.milestoneBlankRoutePath);
      const intersections = milestoneMainPath.getIntersections(alternatePath);
      if (intersections.length) {
        this.alternatePaths.push(intersections[0]);
      }
    });
  }

  /**
   * @function removeAlterPaths
   * This method is used to remove alternate paths
   */
  private removeAlterPaths() {
    const alternatePaths = this.getPaths(this.ALTERNATE_PATH, true);
    alternatePaths.forEach((alternatePath) => {
      alternatePath.remove();
    });
  }

  /**
   * @function plotDataPointsInPath
   * This method is used to plot data points in path
   */
  private plotDataPointsInPath(mainPath, dataList, dataPointCollections, nearestPoints = null) {
    const dataCollections: any = this.currentZoomLevel < 1 ? [{}].concat(dataList) : dataList.concat({}); // adding empty json to plot start and destination point
    const pathLength = mainPath.length;
    const lastIndex = (dataCollections.length - 1);
    const mainPathLength = pathLength - this.END_POINT_OFFSET;
    let lastDataPosition = this.START_POINT_OFFSET;
    const competencyList = dataCollections.map((dataItem) => dataItem && this.currentZoomLevel === MAP_ZOOM_LEVELS.COLLECTION_LEVEL ? dataItem.competencyCount = this.DEFAULT_COMPETENCY_COUNT :
      (dataItem.competencyCount > this.MINIMUM_COMPETENCY_COUNT ? dataItem.competencyCount : dataItem.competencyCount = this.MINIMUM_COMPETENCY_COUNT));
    const totalCompetencies = competencyList.reduce((a, b) => a + b, 0);
    const emptyCompetencies = dataCollections.filter((dataItem) => !dataItem.competencyCount);
    const lastDataPointPercentage = ((emptyCompetencies.length + 2) * this.START_POINT_OFFSET);
    const innerDataPointPathLength = mainPathLength - lastDataPointPercentage;
    dataCollections.forEach((dataItem, index) => {
      const isLastIndex = index === lastIndex;
      const offset = ((mainPathLength / lastIndex) * index);
      const point = mainPath.getPointAt((offset) || this.START_POINT_OFFSET);
      const id = dataItem.milestoneId || dataItem.domainCode || dataItem.topicCode || dataItem.collectionCode;
      const title = dataItem.domainName || dataItem.topicName || dataItem.collectionName || `Milestone ${index}`;
      if (point) {
        const competencyCount = dataItem && dataItem.competencyCount;
        const competencyPercentage = (competencyCount / totalCompetencies) * 100;
        const offsetCompetencyPercentage = this.currentZoomLevel > 0 ? (innerDataPointPathLength / dataList.length) : ((innerDataPointPathLength / 100) * competencyPercentage);
        if (!index) {
          const currentDataPoint = {
            dataIndex: 0,
            position: lastDataPosition,
            point,
            id,
            title,
            zoomLevel: this.currentZoomLevel
          };
          dataPointCollections.push(currentDataPoint);
          // If it is milestone level show start point otherwise show the data point.
          if (this.currentZoomLevel > 0) {
            this.plotDataPoint(currentDataPoint);
          } else {
            this.plotStartPoint(currentDataPoint);
          }
        } else if (isLastIndex) {
          lastDataPosition = this.currentZoomLevel > 0 ? mainPathLength : mainPathLength - 30; // - 30 to Add extra space above destination marker
          const lastDataPoint = mainPath.getPointAt(lastDataPosition);
          const currentDataPoint = {
            dataIndex: index,
            position: lastDataPosition,
            point: lastDataPoint,
            id,
            title,
            zoomLevel: MAP_ZOOM_LEVELS.DEFAULT_LEVEL // Set default zoom level
          };
          const milestoneLength = this.milestones.length;
          const lastMilestone = this.milestones[milestoneLength - 1];
          const nearestPoint = nearestPoints && (this.currentZoomLevel < 1 ? nearestPoints.start : nearestPoints.end);
          if (nearestPoint && nearestPoint.dataIndex && nearestPoint.title !== `Milestone ${milestoneLength}`) {
            currentDataPoint.title = nearestPoint.title;
            currentDataPoint.id = nearestPoint.id;
            const isMilestone = this.milestones.find((milestone) => milestone.milestoneId === nearestPoint.id);
            if (isMilestone) {
              currentDataPoint.zoomLevel = MAP_ZOOM_LEVELS.DEFAULT_LEVEL; // If it's milestone set milestone zoom level
            } else {
              // Get selected milestone domains for check data point is domain or not
              const selectedMilestone = this.milestoneDetails.find((item) => item.milestoneId === this.selectedMilestoneId);
              const isDomain = selectedMilestone && selectedMilestone.domains.find((domain) => domain.domainCode === currentDataPoint.id);
              // If current data point is domain set domain zoom level otherwise just decrese one level
              currentDataPoint.zoomLevel = isDomain ? MAP_ZOOM_LEVELS.DOMAIN_LEVEL : (this.currentZoomLevel - 1);
            }
            this.plotDataPoint(currentDataPoint);
          } else {
            // This is destionation marker part
            currentDataPoint.title = nearestPoint && nearestPoint.title || `Milestone ${milestoneLength}`;
            currentDataPoint.id = nearestPoint && nearestPoint.id || lastMilestone.milestoneId;
            currentDataPoint.zoomLevel = MAP_ZOOM_LEVELS.DEFAULT_LEVEL; // If last milestone so set miestone zoom level
            currentDataPoint.point = lastDataPoint;
            this.plotDestination(currentDataPoint, mainPath);
          }
          dataPointCollections.push(currentDataPoint);
        } else {
          lastDataPosition += (offsetCompetencyPercentage > this.START_POINT_OFFSET ? offsetCompetencyPercentage : this.START_POINT_OFFSET);
          const dataPoint = mainPath.getPointAt((lastDataPosition));
          const currentDataPoint = {
            dataIndex: index,
            position: lastDataPosition,
            point: dataPoint,
            id,
            title,
            zoomLevel: this.currentZoomLevel
          };
          dataPointCollections.push(currentDataPoint);
          this.plotDataPoint(currentDataPoint);
        }
      }
    });
  }

  /**
   * @function handleCurrentLocation
   * This method is used to plot current location in milestone path
   */
  private handleCurrentLocation() {
    const currentLesson = this.currentLesson;
    const lessons = this.lessons;
    const currentLessonIndex = lessons.indexOf(currentLesson);
    const milestones = [{}].concat(this.milestones); // adding empty json to plot start point
    let currentLocationIndex = 0;
    let totalCompetencies = 0;
    let defaultCurrentLocationPosition = this.START_POINT_OFFSET;
    const milestoneMainPath = this.milestoneMainPath;
    const pathLength = milestoneMainPath.length;
    const milestonePathLength = pathLength - this.END_POINT_OFFSET;
    const currentMilestone: any = milestones.find((milestone: MilestoneModel) => {
      return milestone && this.currentLocation.milestoneId === milestone.milestoneId;
    });
    const dataIndex = milestones.indexOf(currentMilestone);
    this.milestones.forEach((milestoneObj) => {
      if (milestoneObj.competencyCount) {
        totalCompetencies += milestoneObj.competencyCount;
      }
    });
    this.milestones.forEach((milestoneObj: MilestoneModel) => {
      if (milestoneObj && milestoneObj.competencyCount && milestoneObj.sequenceId < currentMilestone.sequenceId) {
        currentLocationIndex += milestoneObj.competencyCount;
      }
    });
    currentLocationIndex += (currentLessonIndex + 1);
    const noCompetenciesMilestone = this.milestones.filter((milestoneObj) => {
      return !milestoneObj.competencyCount;
    });
    const noCompetenciesMilestoneCount = noCompetenciesMilestone && noCompetenciesMilestone.length ? noCompetenciesMilestone.length : 0;
    const lastDataPosition = ((noCompetenciesMilestoneCount + 2) * this.START_POINT_OFFSET);
    const innerDataPointPathLength = milestonePathLength - lastDataPosition;
    const currentLocationCompetencyPercentage = (currentLocationIndex / totalCompetencies) * 100;
    const offsetPercentage = ((innerDataPointPathLength / 100) * currentLocationCompetencyPercentage);
    defaultCurrentLocationPosition += isFinite(offsetPercentage) ? (offsetPercentage > this.START_POINT_OFFSET ? offsetPercentage : this.START_POINT_OFFSET) : this.START_POINT_OFFSET;
    const currentLocationPosition = this.handleCurrentLocationPosition(defaultCurrentLocationPosition, dataIndex);
    const locationPoint = milestoneMainPath.getPointAt((currentLocationPosition));
    const segmentPointX = locationPoint.x;
    const segmentPointY = locationPoint.y;
    const rasterEle = new Raster(this.locationIconElement.nativeElement);
    rasterEle.scale(0.6);
    rasterEle.rotate(280);
    rasterEle.position = new Point(segmentPointX, segmentPointY);
    rasterEle.onClick = (event) => {
      this.handleCurrentLocationPopOver(event);
    };
    const position = rasterEle.position;
    const left = Math.round(position.x - this.CURRENT_LOCATION_OFFSET_WIDTH);
    const top = Math.round(position.y - this.CURRENT_LOCATION_OFFSET_WIDTH);
    this.currentLocationPosition = { left, top };
    this.isShowCurrentLocationAnimation = true;
  }

  /**
   * @function handleCurrentLocationPopOver
   * This method is used to handle the current location popover
   */
  public handleCurrentLocationPopOver(event) {
    const point = event.point;
    const popoverWidth = 240;
    const popoverHeight = 90;
    const currentLocationGap = 10;
    const xPoint = this.currentLocationPosition ? (this.currentLocationPosition.left + this.CURRENT_LOCATION_OFFSET_WIDTH) : point.x;
    const yPoint = this.currentLocationPosition ? (this.currentLocationPosition.top + this.CURRENT_LOCATION_OFFSET_WIDTH) : point.y;
    const element = this.popoverElement.nativeElement;
    const elementStyle = element.style;
    const popoverHalfWidth = (popoverWidth / 2);
    const isElementInViewPortWidth = (xPoint + (popoverHalfWidth)) <= window.innerWidth;
    if (isElementInViewPortWidth) {
      const elementLeft = this.getElementLeft(xPoint, popoverHalfWidth);
      elementStyle.left = elementLeft + 'px';
    } else {
      const elementLeft = this.getElementLeft(xPoint, popoverWidth);
      elementStyle.left = elementLeft + 'px';
    }
    const isElementInViewPortHeight = (yPoint - popoverHeight) >= 0;
    if (isElementInViewPortHeight) {
      elementStyle.top = (yPoint - (popoverHeight + currentLocationGap)) + 'px';
    } else {
      elementStyle.top = (yPoint + currentLocationGap) + 'px';
    }
    elementStyle.display = 'block';
    this.isShowCurrentLocation = true;
  }

  /**
   * @function plotDestination
   * This method is used to plot destination milestone in milestone path
   */
  public plotDestination(data, milestoneMainPath) {
    let xPoint = data.point && data.point.x;
    let yPoint = data.point && data.point.y;
    if (!xPoint) {
      const offset = (this.contentHeight + this.END_POINT_OFFSET);
      const point = milestoneMainPath.getPointAt(offset);
      xPoint = point.x;
      yPoint = point.y;
    }
    const dataPointCircle = new Shape.Circle({
      center: new Point(xPoint, yPoint),
      data: {
        dataIndex: data.dataIndex,
        id: data.id,
        dataPointCircle: true
      }
    });
    this.applySettings(dataPointCircle, settings.dataPointCircle);
    const innerCircle = dataPointCircle.clone();
    innerCircle.data = null;
    this.applySettings(innerCircle, settings.innerDataPointCircle);
    innerCircle.scale(0.8);
    this.plotDestinationIcon(xPoint, yPoint, data);
    this.addDataPointTitle(data, xPoint, yPoint);
    innerCircle.onClick = () => {
      const milestoneIndex = this.milestones.findIndex((milestone) => milestone.milestoneId === data.id);
      this.openMilestoneReport.emit(milestoneIndex);
    };
  }

  /**
   * @function plotCurrentLocationPoint
   * This method is used to plot current location in milestone path
   */
  private async plotCurrentLocationPoint() {
    const classDetails = this.classService.class;
    const courseId = classDetails.course_id;
    const classPerference = classDetails.preference;
    this.fwCode = classPerference && classPerference.framework ? classPerference.framework : null;
    this.currentLocation = this.fwCode ? await this.locationService.fetchCurrentLocation(this.classId, courseId, this.fwCode) : null;
    this.fetchLessons();
  }

  /**
   * @function handleCurrentLocationPosition
   * This method is used to handle the current location position
   */
  private handleCurrentLocationPosition(currentLocationPosition, dataIndex) {
    const adjustPoint = 15;
    const currentMilestonePosition = this.milestonesPoints.find((point) => {
      return point.dataIndex === dataIndex;
    });
    if (currentMilestonePosition) {
      if (currentLocationPosition <= (currentMilestonePosition.position + adjustPoint) && currentLocationPosition > (currentMilestonePosition.position - this.START_POINT_OFFSET)) {
        return currentLocationPosition - this.START_POINT_OFFSET;
      }
      if (dataIndex > 1) {
        const previousMilestonePosition = this.milestonesPoints.find((point) => {
          return point.dataIndex === (dataIndex - 1);
        });
        if (currentLocationPosition >= previousMilestonePosition.position && currentLocationPosition < (previousMilestonePosition.position + this.START_POINT_OFFSET)) {
          return currentLocationPosition + adjustPoint;
        }
      }
    }
    return currentLocationPosition;
  }

  /**
   * @function getElementLeft
   * This method is used to get the left value of location popover
   */
  private getElementLeft(xPoint, width) {
    const initialWidth = 0;
    const elementLeft = (xPoint - width);
    if (elementLeft >= initialWidth) {
      return elementLeft;
    } else {
      return initialWidth;
    }
  }

  /**
   * @function toggleCurrentLocationPopOver
   * This method is used to toggle the location popover
   */
  public toggleCurrentLocationPopOver() {
    this.popoverElement.nativeElement.style.display = 'none';
    this.isShowCurrentLocation = false;
  }

  /**
   * @function fetchLessons
   * This method is used to fetch the lessons
   */
  public async fetchLessons() {
    const isMilestonesAvailable = this.milestones && this.milestones.length;
    const milestoneId = this.currentLocation ? this.currentLocation.milestoneId :
      isMilestonesAvailable ? this.milestones[0].milestoneId : null;
    let milestone = null;
    if (isMilestonesAvailable) {
      const currentItemIsRoute0 = this.currentLocation && this.currentLocation.pathType === PATH_TYPES.ROUTE;
      const location = this.currentLocation;
      milestone = currentItemIsRoute0 ? this.findRoute0CurrentMilestone(location.unitId, location.lessonId) :
        this.milestones.find((milestoneModel) => {
          return milestoneModel.milestoneId === milestoneId;
        });
    }
    if (milestone && milestone.isRoute0) {
      this.lessons = milestone.lessons;
    } else {
      if (milestoneId) {
        this.lessons = await this.milestoneService.fetchLessonList(
          this.classService.class.id,
          milestoneId,
          this.classService.class.course_id,
          this.fwCode
        );
      }
    }
    if (!this.currentLocation) {
      this.fetchCurrentLocation();
    } else {
      if (milestone && milestone.isRoute0) {
        this.getCollectionFromLessons(milestone);
      } else {
        this.fetchCurrentCollection();
      }
      this.getCurrentLesson();
    }
  }

  /**
   * @function findRoute0CurrentMilestone
   * This method is used to find out milestone based on unit and lesson ids
   */
  private findRoute0CurrentMilestone(unitId, lessonId) {
    const currentMilestone = this.milestones.find((milestone) => {
      const lesson = milestone.lessons.find((lessonItem) => {
        return lessonItem.unitId === unitId && lessonItem.lessonId === lessonId;
      });
      return lesson !== null;
    });
    this.currentLocation.milestoneId = currentMilestone.milestoneId;
    return currentMilestone;
  }

  /**
   * @function getCollectionFromLessons
   * This method is used to get the collection from lessons
   */
  private getCollectionFromLessons(milestone) {
    const location = this.currentLocation;
    const lessons = milestone.lessons.find((lesson) => {
      return lesson.lessonId === location.lessonId;
    });
    if (lessons) {
      this.collection = lessons.collections.find((collection) => {
        return collection.id === location.collectionId;
      });
    }
  }

  /**
   * @function fetchCurrentCollection
   * This method is used to get the current collection
   */
  private async fetchCurrentCollection() {
    const location = this.currentLocation;
    const unit0Milestone = this.milestones.find(milestone => milestone.milestoneId === location.milestoneId);
    if (unit0Milestone && unit0Milestone.lessons) {
      const unit0Lesson = unit0Milestone.lessons.find(lesson => lesson.lessonId === location.lessonId);
      const unit0Collection = unit0Lesson.collections || [];
      const collectionList = await this.collectionService.fetchCollectionList(
        this.classId,
        location.courseId,
        location.lessonId,
        location.unitId,
        unit0Collection
      );
      if (collectionList && collectionList.length) {
        this.collection = collectionList.find((collection) => {
          return collection.id === location.collectionId;
        });
      }
    }
  }

  /**
   * @function getCurrentLesson
   * This method is used to get the currentLesson
   */
  private getCurrentLesson() {
    if (this.lessons && this.currentLocation) {
      this.currentLesson = this.lessons.find((lesson: LessonModel) => {
        return this.currentLocation.lessonId === lesson.lessonId;
      });
      const lessonSequence = this.lessons.indexOf(this.currentLesson);
      this.lessonSequence = (lessonSequence + 1);
      this.handleCurrentLocation();
    }
  }

  /**
   * @function fetchCurrentLocation
   * This method is used to get the currentLocation
   */
  private fetchCurrentLocation() {
    const isLessonsAvailable = this.lessons && this.lessons.length;
    if (isLessonsAvailable) {
      const lesson = this.lessons[0];
      const collection = lesson && lesson.collections ? lesson.collections[0] : null;
      this.collection = collection;
      this.getCurrentLocation(lesson, collection);
    }
  }

  /**
   * @function getCurrentLocation
   * This method is used to get the currentLocation
   */
  private async getCurrentLocation(lesson, collection) {
    const lessonId = lesson.lessonId;
    const unitId = lesson.unitId;
    const classDetails = this.classService.class;
    const courseId = classDetails.course_id;
    const milestoneId = this.milestones && this.milestones.length ? this.milestones[0].milestoneId : null;
    let currentCollection = null;
    if (collection) {
      currentCollection = collection;
    } else {
      const collections = lesson.collections || await this.collectionService.fetchCollectionList(this.classId, courseId, lessonId, unitId);
      currentCollection = collections && collections.length ? collections[0] : null;
    }
    const collectionType = currentCollection.format;
    const thumbnail = getDefaultImageXS(collectionType);
    this.currentLocation = {
      classId: this.classId,
      collectionId: currentCollection.id,
      collectionTitle: currentCollection.title,
      collectionType,
      courseId,
      lessonId,
      milestoneId,
      unitId,
      thumbnail
    };
    this.getCurrentLesson();
  }

  /**
   * @function onPlayCollection
   * This method is used to trigger the play event
   */
  public onPlayCollection() {
    this.playCollection.emit();
  }

  /**
   * @function playSkeletonResources
   * This method is used to play the skeleton resources
   */
  private playSkeletonResources() {
    this.isSkeletonResource = true;
    this.drawMilestonePath();
    this.drawAlternatePaths();
    this.plotSkeletonResources();
    this.skeletonResourceInterval = setInterval(() => {
      const items = this.getSkeletonResources();
      items.forEach((item) => {
        item.remove();
      });
      this.isToggleSkeletonResource = !this.isToggleSkeletonResource;
      this.plotSkeletonResources();
    }, 300);
  }

  /**
   * @function plotSkeletonResources
   * This method is used to plot resources in alternate path
   */
  private plotSkeletonResources() {
    const milestonesResourceContent = this.stubResourceJson;
    let alternateIntersectPaths = [];
    alternateIntersectPaths = this.alternatePaths;
    const alternatePathCount = alternateIntersectPaths.length;
    if (milestonesResourceContent) {
      const resourceContents = milestonesResourceContent.contents;
      const resourceLists = chunkArray(resourceContents, this.MAX_RESOURCES_IN_PATH);
      resourceLists.forEach((resource, resourceIndex) => {
        if (resourceIndex < alternatePathCount) {
          const alternateIntersectPath = alternateIntersectPaths[resourceIndex];
          this.handleResourceIcon(alternateIntersectPath, resource, null);
        }
      });
    }
  }

  /**
   * @function plotResourcesInAlternatePath
   * This method is used to plot resources in alternate path
   */
  private plotResourcesInAlternatePath() {
    const items = this.getSkeletonResources();
    items.forEach((item) => {
      item.remove();
    });
    this.isSkeletonResource = false;
    clearInterval(this.skeletonResourceInterval);
    const dataPointCircles = this.getDataPointCircles();
    const currentResourceContents = this.getCurrentResourceContents();
    const alternateIntersectPaths = this.alternatePaths;
    let alterPathIndex = 0;
    this.plottedResourcePoint = [];
    dataPointCircles.forEach((dataPointCircle) => {
      const alternatePathCount = alternateIntersectPaths.length;
      const dataPointId = dataPointCircle.data.id;
      const dataPointIndex = dataPointCircle.data.dataIndex;
      if (dataPointId && alternatePathCount && currentResourceContents) {
        const contentId = this.getCurrentContentId(dataPointId);
        const contentKey = ALTER_RESOURCE_CONTENT_KEYS[this.currentZoomLevel];
        const currentResourceContent = currentResourceContents.find((content) => content[contentKey] === contentId);
        if (currentResourceContent && currentResourceContent.contents) {
          const dataIndex = this.currentZoomLevel > 0 ? (dataPointIndex + 1) : (dataPointIndex - 1);
          const resourceContents = currentResourceContent.contents;
          const resourceLists = chunkArray(resourceContents, this.MAX_RESOURCES_IN_PATH);
          resourceLists.forEach((resource) => {
            const resourceIndex = dataPointCircles.length > 1 ? dataIndex : alterPathIndex;
            if (resourceIndex < alternatePathCount) {
              // const alternateIntersectPath = resourceIndex === 0 ? alternateIntersectPaths[1] : (resourceIndex === 1 ? alternateIntersectPaths[0] : alternateIntersectPaths[resourceIndex]);
              const alternateIntersectPath = alternateIntersectPaths[resourceIndex];
              this.handleResourceIcon(alternateIntersectPath, resource, currentResourceContent[contentKey]);
              alterPathIndex = alterPathIndex < (alternatePathCount - 1) ? (alterPathIndex + 1) : 0;
            }
          });
        }
      }
    });
    this.isLoadingContent = false;
    this.ref.detectChanges();
  }

  /**
   * @function getCurrentResourceContents
   * This method is used to get current resource contents
   */
  private getCurrentResourceContents() {
    let resourceContents;
    switch (this.currentZoomLevel) {
      case MAP_ZOOM_LEVELS.DOMAIN_LEVEL:
        resourceContents = this.domainResourceContents;
        break;
      case MAP_ZOOM_LEVELS.TOPIC_LEVEL:
        resourceContents = this.topicResourceContents;
        break;
      case MAP_ZOOM_LEVELS.COLLECTION_LEVEL:
        resourceContents = this.competencyResourceContents;
        break;
      default:
        resourceContents = this.milestonesResourceContents;
    }
    return resourceContents;
  }

  /**
   * @function getCurrentContentId
   * This method is used to get current content id
   */
  private getCurrentContentId(id) {
    let contentId;
    switch (this.currentZoomLevel) {
      case MAP_ZOOM_LEVELS.DOMAIN_LEVEL:
        contentId = this.domainCodes.includes(id) ? id : null;
        break;
      case MAP_ZOOM_LEVELS.TOPIC_LEVEL:
        contentId = this.topicCodes.includes(id) ? id : null;
        break;
      case MAP_ZOOM_LEVELS.COLLECTION_LEVEL:
        const collection = this.collectionList.find((selectedCollection) => selectedCollection.collectionCode === id);
        contentId = this.competencyCodes.includes(collection && collection.competencyCode) ? collection.competencyCode : null;
        break;
      default:
        contentId = id;
    }
    return contentId;
  }

  /**
   * @function handleResourceIcon
   * This method is used to plot the resource icon
   */
  private handleResourceIcon(alternatePath, resources, contentId) {
    const path = alternatePath.intersection.path;
    const intersectOffset = alternatePath.intersection.offset;
    const resourceIconSize = 24;
    const defaultStartPoint = 20;
    const gapBetweenResource = 80;
    let prevResourceOffset = 0;
    resources.forEach((content, contentIndex) => {
      const offset = (path.length / resources.length) * contentIndex;
      const point = path.getPointAt(offset || defaultStartPoint);
      const calcPoint = Math.abs(offset - intersectOffset);
      const gapPoint = (offset - prevResourceOffset);
      if (point && calcPoint > resourceIconSize && (gapPoint > gapBetweenResource || gapPoint === 0)) {
        prevResourceOffset = offset;
        const xPoint = point.x;
        const yPoint = point.y;
        if (this.isSkeletonResource) {
          if (this.isToggleSkeletonResource) {
            if (this.isOdd(contentIndex)) {
              this.drawResourceCircle(xPoint, yPoint, content, contentId);
            }
          } else {
            if (!this.isOdd(contentIndex)) {
              this.drawResourceCircle(xPoint, yPoint, content, contentId);
            }
          }
        } else {
          this.drawResourceCircle(xPoint, yPoint, content, contentId);
        }
      }
    });
  }

  /**
   * @function isOdd
   * This method is used to find the given number is odd or not
   */
  private isOdd(num) { return num % 2; }

  /**
   * @function getPath
   * This method is used to get path
   */
  private getPath(pathName, isBlankRoute?) {
    if (isBlankRoute) {
      return this.blankRouteProject.getItem({
        class: Path,
        name(item) {
          return item === pathName;
        }
      });
    }
    return this.project.getItem({
      class: Path,
      name(item) {
        return item === pathName;
      }
    });
  }

  /**
   * @function getPaths
   * This method is used to get paths
   */
  private getPaths(pathName, isBlankRoute?) {
    if (isBlankRoute) {
      return this.blankRouteProject.getItems({
        class: Path,
        name(item) {
          return item === pathName;
        }
      });
    }
    return this.project.getItems({
      class: Path,
      name(item) {
        return item === pathName;
      }
    });
  }

  /**
   * @function getDataPointCircles
   * This method is used to get all the data point circles
   */
  private getDataPointCircles() {
    return this.project.getItems({
      data(item) {
        return item.dataPointCircle;
      }
    });
  }

  /**
   * @function getApplySettings
   * This method is used to apply settings for given path item
   */
  private applySettings(pathItem, settingsObject) {
    Object.keys(settingsObject).forEach((key) => {
      const settingValue = settingsObject[key];
      pathItem[key] = settingValue;
    });
  }

  /**
   * @function plotStartPoint
   * This method is used to plot the start point of the path
   */
  public plotStartPoint(data) {
    const segmentPointX = data.point.x;
    const segmentPointY = data.point.y;
    const startPointCircle = new Shape.Circle({
      center: new Point(segmentPointX, segmentPointY),
      data: {
        dataIndex: 0,
        id: data.id,
        dataPointCircle: false
      }
    });
    this.applySettings(startPointCircle, settings.startPointCircle);
    const rasterEle = new Raster(this.startPointIconElement.nativeElement);
    rasterEle.scale(0.6);
    rasterEle.position = new Point(segmentPointX, segmentPointY);
  }

  /**
   * @function plotDataPoint
   * This method is used to plot the data point in the path
   */
  private plotDataPoint(data) {
    const segmentPointX = data.point.x;
    const segmentPointY = data.point.y;
    const dataPointCircle = new Shape.Circle({
      center: new Point(segmentPointX, segmentPointY),
      data: {
        dataIndex: data.dataIndex,
        id: data.id,
        dataPointCircle: true
      }
    });
    this.applySettings(dataPointCircle, settings.dataPointCircle);
    const innerCircle = dataPointCircle.clone();
    innerCircle.data = null;
    this.applySettings(innerCircle, settings.innerDataPointCircle);
    innerCircle.scale(0.8);
    this.plotDataPointIcon(segmentPointX, segmentPointY, data);
    this.addDataPointTitle(data, segmentPointX, segmentPointY);
  }

  /**
   * @function handleAlternatePaths
   * This method is used to handle the alternate path
   */
  public handleAlternatePaths(routeData) {
    const childrenData = routeData[0][1].children[0][1].children;
    const size = childrenData[0][1].size;
    const xSize = size[0];
    const ySize = size[1];
    const alternatePaths = childrenData.filter((child) => {
      return child[0] === 'Path' && child[1].name === this.ALTERNATE_PATH;
    });
    alternatePaths.forEach((path) => {
      const segments = path[1].segments;
      segments.forEach((segmentCoordinate, index) => {
        if (segmentCoordinate[0]) {
          const xAxis = (segmentCoordinate[0][0] / xSize) * this.contentWidth;
          const yAxis = (segmentCoordinate[0][1] / ySize) * this.contentHeight;
          segments[index][0] = [xAxis, yAxis];
        }
        if (segmentCoordinate[1]) {
          const handleInXAxis = (segmentCoordinate[1][0] / xSize) * this.contentWidth;
          const handleInYAxis = (segmentCoordinate[1][1] / ySize) * this.contentHeight;
          segments[index][1] = [handleInXAxis, handleInYAxis];
        }
        if (segmentCoordinate[2]) {
          const handleOutXAxis = (segmentCoordinate[2][0] / xSize) * this.contentWidth;
          const handleOutYAxis = (segmentCoordinate[2][1] / ySize) * this.contentHeight;
          segments[index][2] = [handleOutXAxis, handleOutYAxis];
        }
      });
    });
  }

  /**
   * @function plotDataPointIcon
   * This method is used to plot the milestone icon
   */
  public plotDataPointIcon(segmentPointX, segmentPointY, dataPoint) {
    let nativeElement;
    const id = dataPoint.id;
    let scale = 1.0;
    switch (dataPoint.zoomLevel) {
      case MAP_ZOOM_LEVELS.DOMAIN_LEVEL:
        scale = 0.5;
        nativeElement = this.domainIconElement.nativeElement;
        break;
      case MAP_ZOOM_LEVELS.TOPIC_LEVEL:
        scale = 0.5;
        nativeElement = this.topicIconElement.nativeElement;
        break;
      case MAP_ZOOM_LEVELS.COLLECTION_LEVEL:
        scale = 0.5;
        nativeElement = this.competencyIconElement.nativeElement;
        break;
      default:
        nativeElement = this.milestoneIconElement.nativeElement;
    }
    const dataPointRaster = new Raster(nativeElement);
    dataPointRaster.scale(scale);
    dataPointRaster.position = new Point(segmentPointX, segmentPointY);
    dataPointRaster.data = {
      id
    };
    dataPointRaster.onClick = (event) => {
      event.stopPropagation();
      const selectedId = dataPointRaster.data.id;
      if (dataPoint.zoomLevel === MAP_ZOOM_LEVELS.DEFAULT_LEVEL) {
        const milestoneIndex = this.milestones.findIndex((content) => content.milestoneId === selectedId);
        this.openMilestoneReport.emit(milestoneIndex);
      } else if (dataPoint.zoomLevel === MAP_ZOOM_LEVELS.COLLECTION_LEVEL) {
        this.onOpenLessonList(selectedId);
      } else {
        const neartestPoints = this.findNearestDataPoints(event.point);
        const isDomain = validateObject(neartestPoints) && (neartestPoints.start.zoomLevel < MAP_ZOOM_LEVELS.TOPIC_LEVEL ? true : neartestPoints.start.zoomLevel === MAP_ZOOM_LEVELS.TOPIC_LEVEL ? false : null);
        if (isDomain != null) {
          const selectedPath = isDomain ? this.domainLevelPath : this.topicLevelPath;
          const selectedDataPoint = isDomain ? this.topicPoints : this.collectionPoints;
          if (selectedPath) {
            const selectedLevelPath = this.HandlePathPlot(event, selectedPath.nextDataList, selectedPath.nextLevelMainPath, selectedPath.nextAlterPath, selectedDataPoint);
            if (isDomain) {
              this.topicLevelPath = selectedLevelPath;
            }
          }
        }
      }
    };
  }

  /**
   * @function onOpenLessonList
   * This method is used to open the lesson lists
   */
  public onOpenLessonList(selectedCollectionId) {
    const collection = this.collectionList.find((selectedCollection) => selectedCollection.collectionCode === selectedCollectionId);
    if (collection) {
      const currentLocation = {
        classId: this.classId,
        courseId: this.courseId,
        milestoneId: this.selectedMilestoneId,
        lessonId: collection.lessonId,
        unitId: collection.unitId,
        collectionId: selectedCollectionId
      };
      this.modalService.open(LessonListPullupComponent, {
        milestones: this.milestones,
        isPublicClass: this.class.isPublic,
        class: this.class,
        tenantSettings: this.tenantSettings,
        classTitle: this.class.title,
        milestoneCount: this.milestones.length,
        currentLocation,
      }, 'lesson-list-modal');
    }
  }

  /**
   * @function plotDestinationIcon
   * This method is used to plot the destination icon
   */
  public plotDestinationIcon(segmentPointX, segmentPointY, data) {
    const adjustPoint = 15;
    const destinationEle = new Raster(this.destinationIconElement.nativeElement);
    destinationEle.scale(2);
    destinationEle.position = new Point(segmentPointX, (segmentPointY - adjustPoint));
    destinationEle.onClick = () => {
      const milestoneIndex = this.milestones.findIndex((content) => content.milestoneId === data.id);
      this.openMilestoneReport.emit(milestoneIndex);
    };
  }

  /**
   * @function drawResourceCircle
   * This method is used to draw the resource Circle
   */
  private drawResourceCircle(segmentPointX, segmentPointY, resource, id) {
    const resourceCircle = new Shape.Circle({
      center: new Point(segmentPointX, segmentPointY)
    });
    this.applySettings(resourceCircle, settings.resourceCircle);
    resourceCircle.scale(1.35);
    resourceCircle.data = {
      isSkeletonResource: this.isSkeletonResource
    };
    const element = this.elementRef.nativeElement;
    let nativeElement = element.querySelector(`.${resource.contentSubtype}`);
    if (this.isSkeletonResource) {
      nativeElement = element.querySelector(`.${resource.contentSubtype}.resource-loader`);
    } else {
      // This part is used to avoid altered resource content appending to other altered resources.
      const plottedResource = this.plottedResourcePoint.find((item) => item.segmentPointX === segmentPointX && item.segmentPointY === segmentPointY);
      if (plottedResource) {
        resourceCircle.remove();
        return;
      }
      this.plottedResourcePoint.push({ segmentPointX, segmentPointY });
    }
    if (resource.defaultThumbnail) {
      nativeElement = resource.defaultThumbnail;
    }
    const resourceImg = new Raster(nativeElement);
    resourceImg.visible = false;
    resourceImg.position = new Point(segmentPointX, segmentPointY);
    resourceImg.onLoad = () => {
      resourceImg.size = new Size(24, 24);
      resourceImg.visible = true;
    };
    const resourceDefaultThumbnail = resource && resource.defaultThumbnail ? resource.defaultThumbnail : null;
    resourceImg.data = {
      id,
      contentId: resource.contentId,
      resourceDefaultThumbnail,
      isSkeletonResource: this.isSkeletonResource
    };
    resourceImg.onClick = () => {
      if (!this.isSkeletonResource) {
        const selectedMilestoneId = resourceImg.data.id;
        const selectedContentId = resourceImg.data.contentId;
        const resourceThumbnail = resourceImg.data.resourceDefaultThumbnail;
        const contentKey = ALTER_RESOURCE_CONTENT_KEYS[this.currentZoomLevel];
        const currentResourceContent = this.getCurrentResourceContents().find((content) => {
          return content[contentKey] === selectedMilestoneId;
        });
        const resourceContent = currentResourceContent.contents.find((content) => content.contentId === selectedContentId);
        this.openPublisherInfoPanel(resourceContent, resourceThumbnail);
      }
    };
  }

  /**
   * @function addDataPointTitle
   * This method is used to add the data point title
   */
  public addDataPointTitle(dataPoint, segmentPointX, segmentPointY) {
    const titleName = dataPoint.title;
    let titleData;
    let xPosition;
    let yPosition;
    let justification;
    const isMilestone = this.currentZoomLevel === MAP_ZOOM_LEVELS.DEFAULT_LEVEL;
    const dataLength = isMilestone ? this.milestoneDetails.length : (this.selectedDataList && this.selectedDataList.length);
    const dataIndex = isMilestone && dataLength > dataPoint.dataIndex ? (dataPoint.dataIndex - 1) : dataPoint.dataIndex;
    const isLastIndex = dataIndex === dataLength;
    if (dataIndex > 0 && (isLastIndex || (dataIndex % 2 !== 0))) {
      xPosition = segmentPointX - 25;
      yPosition = segmentPointY + 5;
      justification = 'right';
      titleData = this.handleDataPointTitle(xPosition, titleName);
    } else {
      xPosition = segmentPointX + 25;
      yPosition = segmentPointY + 5;
      justification = 'left';
      titleData = this.handleDataPointTitle((this.contentWidth - xPosition), titleName);
    }
    const title = new PointText({
      point: [(xPosition), (yPosition)],
      content: `${titleData.title}`,
      style: {
        justification
      }
    });
    this.applySettings(title, settings.dataPointTitle);
    title.onClick = async (titleEvent) => {
      if (titleData.isWrap) {
        titleEvent.event.stopPropagation();
        this.showDataPointTitlePopover(titleEvent.event, titleName);
      }
    };
  }

  /**
   * @function handleDataPointTitle
   * This method used to handle the data point title based on thr length
   */
  public handleDataPointTitle(maxPoint, title) {
    const pointTextSize = 7; // Define text size per point
    const maxLength = (maxPoint - this.START_POINT_OFFSET) / pointTextSize;
    const isWrap = title.length > maxLength;
    return {
      isWrap,
      title: isWrap ? `${title.substring(0, maxLength)}..` : title
    };
  }

  /**
   * @function showDataPointTitlePopover
   * This method used to show the full data point title
   */
  public async showDataPointTitlePopover(event, text) {
    const popover = await this.popoverController.create({
      component: TitlePopoverComponent,
      event,
      componentProps: { text },
      cssClass: 'taxonomy-popover'
    });
    const element = popover.getElementsByClassName('popover-content')[0] as HTMLElement;
    element.style.display = 'none'; // Initially hide the popover to prevent default popover show
    await popover.present();
    // Set the top left based on selected point
    const offset = 10;
    const maxWidth = 250;
    const elementStyle = element.style;
    elementStyle.display = 'block';
    const elementClient = event.changedTouches && event.changedTouches[0] || event;
    const xPoint = elementClient.clientX;
    const yPoint = elementClient.clientY;
    const popoverWidth = text.length > 30 ? maxWidth : element.clientWidth;
    const popoverHeight = element.clientHeight;
    const popoverHalfWidth = (popoverWidth / 2);
    elementStyle.width = popoverWidth + 'px';
    const isElementInViewPortWidth = (xPoint + (popoverHalfWidth)) <= window.innerWidth;
    if (isElementInViewPortWidth) {
      const elementLeft = this.getElementLeft(xPoint, popoverHalfWidth);
      elementStyle.left = elementLeft + 'px';
    } else {
      const elementLeft = this.getElementLeft(xPoint, popoverWidth);
      elementStyle.left = elementLeft + 'px';
    }
    const top = popoverWidth === maxWidth ? (yPoint - (popoverHeight / 2)) : (yPoint - (popoverHeight + offset));
    elementStyle.top = top + 'px';
  }

  /**
   * @function openPublisherInfoPanel
   * This method is used to open publisher info panel
   */
  public openPublisherInfoPanel(publisherInfoContent, resourceThumbnail) {
    this.modalService.open(PublisherInfoPanelComponent, { publisherInfoContent, resourceThumbnail }, 'publisher-info-panel');
  }
}
