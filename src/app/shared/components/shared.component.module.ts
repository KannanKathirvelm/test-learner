import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SharedApplicationDirectivesModule } from '@shared/directives/shared-application-directives.module';
import { DragulaModule } from 'ng2-dragula';
import { AvatarModule } from 'ngx-avatar';
import { CalendarModule } from 'primeng/calendar';

import { ClassActivitiesPanelComponent } from '@shared/components/class/class-activities-panel/class-activities-panel.component';
import { ClassCompetencyPanelComponent } from '@shared/components/class/class-competency-panel/class-competency-panel.component';
import { ClassHeaderComponent } from '@shared/components/class/class-header/class-header.component';
import { ClassJourneyPanelComponent } from '@shared/components/class/class-journey-panel/class-journey-panel.component';
import { ClassSetupNotCompletedComponent } from '@shared/components/class/class-setup-not-completed/class-setup-not-completed.component';
import { SharedApplicationPipesModule } from '@shared/pipes/shared-application-pipes.module';

import { CaCalendarComponent } from '@shared/components/class/class-activity/ca-calendar/ca-calendar.component';
import { ClassActivityPanelComponent } from '@shared/components/class/class-activity/class-activity-panel/class-activity-panel.component';
import { ItemsToGradePanelComponent } from '@shared/components/class/class-activity/items-to-grade-panel/items-to-grade-panel.component';
import { PageRefresherComponent } from '@shared/components/UI/page-refresher/page-refresher.component';
import { SocialShareComponent } from '@shared/components/UI/social-share/social-share.component';

import { DiagnosisOfKnowledgeComponent } from '@shared/components/class/diagnosis-of-knowledge/diagnosis-of-knowledge.component';
import { JourneyReportComponent } from '@shared/components/class/journey-report/journey-report.component';
import { MilestoneReportComponent } from '@shared/components/class/milestone-report/milestone-report.component';
import { MilestoneAccordionComponent } from '@shared/components/class/milestone/milestone-accordion/milestone-accordion.component';
import { ShowAttemptComponent } from '@shared/components/class/milestone/milestone-accordion/show-attempt/show-attempt.component';
import { MilestoneComponent } from '@shared/components/class/milestone/milestone.component';
import { NotificationComponent } from '@shared/components/class/notification/notification.component';
import { ProficiencyDirectionComponent } from '@shared/components/class/proficiency-direction/proficiency-direction.component';
import { SuggestionComponent } from '@shared/components/class/suggestion/suggestion.component';
import { PortfolioContentCardComponent } from '@shared/components/portfolio/portfolio-content-card/portfolio-content-card.component';
import { PortfolioComponent } from '@shared/components/portfolio/portfolio/portfolio.component';
import { CompetencyInfoComponent } from '@shared/components/proficiency/competency-info-pull-up/competency-info-pull-up.component';
import { DomainInfoComponent } from '@shared/components/proficiency/domain-info/domain-info.component';
import { LearningMapComponent } from '@shared/components/proficiency/learning-map/learning-map.component';
import { LegendPullUpComponent } from '@shared/components/proficiency/legend-pull-up/legend-pull-up.component';
import { MetaDataComponent } from '@shared/components/proficiency/metadata/metadata.component';
import { ProficiencyChartComponent } from '@shared/components/proficiency/proficiency-chart/proficiency-chart.component';
import { TopicInfoComponent } from '@shared/components/proficiency/topic-info/topic-info.component';
import { SuggestionCollectionPanelComponent } from '@shared/components/suggestion/suggestion-collection-panel/suggestion-collection-panel.component';
import { SuggestionPanelComponent } from '@shared/components/suggestion/suggestion-panel/suggestion-panel.component';

import { AccountExistsPullupComponent } from '@shared/components/account-exists-pull-up/account-exists-pull-up.component';
import { CalenderComponent } from '@shared/components/calender/calender.component';
import { CourseMapAccordionComponent } from '@shared/components/class/course-map-accordion/course-map-accordion.component';
import { MilestoneGpsMapComponent } from '@shared/components/class/milestone-gps-map/milestone-gps-map.component';
import { MilestoneInfoPanelComponent } from '@shared/components/class/milestone-info-panel/milestone-info-panel.component';
import { MilestoneModalComponent } from '@shared/components/class/milestone-modal/milestone-modal.component';
import { MilestoneReportProgressBarComponent } from '@shared/components/class/milestone-report-progress-bar/milestone-report-progress-bar.component';
import { PublisherInfoPanelComponent } from '@shared/components/class/publisher-info-panel/publisher-info-panel.component';
import { YourLocationPopoverComponent } from '@shared/components/class/your-location-popover/your-location-popover.component';
import { CourseMapLessonReportComponent } from '@shared/components/course-map-lesson-report/course-map-lesson-report.component';
import { CourseMapComponent } from '@shared/components/course-map/course-map.component';
import { EvidenceFileComponent } from '@shared/components/evidence-file/evidence-file.component';
import { FeedbackComponent } from '@shared/components/feedback/feedback.component';
import { OfflineActivityGradingComponent } from '@shared/components/grading/offline-activity-grading/offline-activity-grading.component';
import { LessonListPullupComponent } from '@shared/components/lesson-list-pullup/lesson-list-pullup.component';
import { MilestoneInfoComponent } from '@shared/components/milestone-info/milestone-info.component';
import { MilestoneLessonReportComponent } from '@shared/components/milestone-lesson-report/milestone-lesson-report.component';
import { MilestonePanelPopUpComponent } from '@shared/components/milestone-panel-popup/milestone-panel-popup.component';
import { MilestonePanelComponent } from '@shared/components/milestone-panel/milestone-panel.component';
import { MilestoneWithPerformanceReportComponent } from '@shared/components/milestone-with-performance-report/milestone-with-performance-report.component';
import { NavigationBarComponent } from '@shared/components/navigation-bar/navigation-bar.component';
import { OptionMenuPopoverComponent } from '@shared/components/navigation-bar/option-menu-popover/option-menu-popover.component';
import { OaGradingReportComponent } from '@shared/components/offline-activity/oa-grading-report/oa-grading-report.component';
import { OaTaskSubmissionsComponent } from '@shared/components/offline-activity/oa-task-submissions/oa-task-submissions.component';
import { CollectionContentComponent } from '@shared/components/player/collection-content/collection-content.component';
import { CollectionInfoPanelComponent } from '@shared/components/player/collection-info-panel/collection-info-panel.component';
import { COLLECTIONS } from '@shared/components/player/collections.import';
import { CompetencyCompletionStatsComponent } from '@shared/components/player/competency-completion-stats/competency-completion-stats.component';
import { OfflineActivityTaskComponent } from '@shared/components/player/offline-activity-task/offline-activity-task.component';
import { OfflineActivityComponent } from '@shared/components/player/offline-activity/offline-activity.component';
import { QUESTIONS } from '@shared/components/player/questions/questions.import';
import { RelatedContentComponent } from '@shared/components/player/related-content/related-content.component';
import { RESOURCES } from '@shared/components/player/resources/resources.import';
import { CollectionPortfolioPanelComponent } from '@shared/components/portfolio/collection-portfolio-panel/collection-portfolio-panel.component';
import { PortfolioCalendarComponent } from '@shared/components/portfolio/portfolio-calendar/portfolio-calendar.component';
import { UserSubjectCompetencyComponent } from '@shared/components/proficiency/user-subject-competency/user-subject-competency.component';
import { ProgramCardComponent } from '@shared/components/program-card/program-card.component';
import { ProgramNavigateCardComponent } from '@shared/components/program-navigate-card/program-navigate-card.component';
import { PullUpWithDynamicHeightComponent } from '@shared/components/pullup-with-dynamic-height/pullup-with-dynamic-height.component';
import { ReadMoreComponent } from '@shared/components/read-more/read-more.component';
import { ReefComponent } from '@shared/components/reef/reef.component';
import { AssessmentReportComponent } from '@shared/components/reports/assessment-report/assessment-report.component';
import { AssessmentSummaryReportComponent } from '@shared/components/reports/assessment-summary-report/assessment-summary-report.component';
import { CollectionReportComponent } from '@shared/components/reports/collection-report/collection-report.component';
import { CollectionSummaryReportComponent } from '@shared/components/reports/collection-summary-report/collection-summary-report.component';
import { ContentReportComponent } from '@shared/components/reports/content-report/content-report.component';
import { CourseMapReportComponent } from '@shared/components/reports/course-map-report/course-map-report.component';
import { OfflineActivityContentReportComponent } from '@shared/components/reports/offline-activity-content-report/offline-activity-content-report.component';
import { OfflineActivityReportComponent } from '@shared/components/reports/offline-activity-report/offline-activity-report.component';
import { OfflineActivitySummaryReportComponent } from '@shared/components/reports/offline-activity-summary-report/offline-activity-summary-report.component';
import { RerouteSuggestionChartComponent } from '@shared/components/reroute-suggestion-chart/reroute-suggestion-chart.component';
import { RerouteSuggestionComponent } from '@shared/components/reroute-suggestion/reroute-suggestion.component';
import { RouteContentPopoverComponent } from '@shared/components/route-content-popover/route-content-popover.component';
import { RoutePathViewCardComponent } from '@shared/components/route-path-view-card/route-path-view-card.component';
import { GradeLevelCategoryComponent } from '@shared/components/rubric/grade-level-category/grade-level-category.component';
import { GradeRubricCategoryComponent } from '@shared/components/rubric/grade-rubric-category/grade-rubric-category.component';
import { RubricComponent } from '@shared/components/rubric/rubric-report/rubric-report.component';
import { ScorePointComponent } from '@shared/components/score-point/score-point.component';
import { SearchDestinationComponent } from '@shared/components/search-destination/search-destination.component';
import { StudentClassProgressReportComponent } from '@shared/components/student-class-progress-report/student-class-progress-report.component';
import { SubProgramComponent } from '@shared/components/sub-program/sub-program.component';
import { TaxonomyListComponent } from '@shared/components/taxonomy-list/taxonomy-list.component';
import { TitlePopoverComponent } from '@shared/components/title-popover/title-popover.component';
import { AudioPlayerComponent } from '@shared/components/UI/audio-player/audio-player.component';
import { AudioRecorderComponent } from '@shared/components/UI/audio-recorder/audio-recorder.component';
import { ConfettiComponent } from '@shared/components/UI/confetti/confetti.component';
import { CustomAlertComponent } from '@shared/components/UI/custom-alert/custom-alert.component';
import { NavFilePickerComponent } from '@shared/components/UI/inputs/nav-file-picker/nav-file-picker.component';
import { NavInputNumberComponent } from '@shared/components/UI/inputs/nav-input-number/nav-input-number.component';
import { MathjaxComponent } from '@shared/components/UI/mathjax/mathjax.component';
import { TaxonomyPopoverComponent } from '@shared/components/UI/popover/taxonomy-popover/taxonomy-popover.component';
import { RatingComponent } from '@shared/components/UI/rating/rating.component';
import { ReactionComponent } from '@shared/components/UI/reaction/reaction.component';
import { YouTubePlayerFullscreenComponent } from '@shared/components/UI/youtube-player-fullscreen/youtube-player-fullscreen.component';
import { YouTubePlayerComponent } from '@shared/components/UI/youtube-player/youtube-player.component';
import { VideoConferenceComponent } from '@shared/components/video-conference/video-conference.component';
import { PlayerPage } from '@shared/pages/player/player.page';


const PAGES_COMPONENTS = [
  AudioPlayerComponent,
  AudioRecorderComponent,
  PullUpWithDynamicHeightComponent,
  AccountExistsPullupComponent,
  MilestoneWithPerformanceReportComponent,
  MilestoneReportProgressBarComponent,
  PageRefresherComponent,
  CourseMapComponent,
  MilestoneModalComponent,
  ClassActivitiesPanelComponent,
  ClassCompetencyPanelComponent,
  ClassJourneyPanelComponent,
  CaCalendarComponent,
  ClassActivityPanelComponent,
  ClassHeaderComponent,
  ItemsToGradePanelComponent,
  SocialShareComponent,
  CourseMapAccordionComponent,
  DiagnosisOfKnowledgeComponent,
  MilestoneComponent,
  MilestoneAccordionComponent,
  ShowAttemptComponent,
  NavigationBarComponent,
  ProficiencyDirectionComponent,
  CompetencyInfoComponent,
  DomainInfoComponent,
  LearningMapComponent,
  LegendPullUpComponent,
  MetaDataComponent,
  ProficiencyChartComponent,
  TopicInfoComponent,
  SuggestionCollectionPanelComponent,
  SuggestionPanelComponent,
  PortfolioContentCardComponent,
  PortfolioComponent,
  NotificationComponent,
  JourneyReportComponent,
  MilestoneReportComponent,
  SuggestionComponent,
  OaGradingReportComponent,
  OaTaskSubmissionsComponent,
  RubricComponent,
  GradeRubricCategoryComponent,
  GradeLevelCategoryComponent,
  AssessmentReportComponent,
  AssessmentSummaryReportComponent,
  CollectionReportComponent,
  CollectionSummaryReportComponent,
  ContentReportComponent,
  OfflineActivityContentReportComponent,
  OfflineActivityReportComponent,
  OfflineActivitySummaryReportComponent,
  TaxonomyListComponent,
  OfflineActivityTaskComponent,
  OfflineActivityGradingComponent,
  MathjaxComponent,
  NavFilePickerComponent,
  CourseMapReportComponent,
  CollectionContentComponent,
  CollectionInfoPanelComponent,
  RESOURCES,
  QUESTIONS,
  COLLECTIONS,
  CompetencyCompletionStatsComponent,
  OfflineActivityComponent,
  RelatedContentComponent,
  FeedbackComponent,
  RerouteSuggestionComponent,
  ReefComponent,
  ReadMoreComponent,
  ConfettiComponent,
  ReactionComponent,
  YouTubePlayerComponent,
  NavInputNumberComponent,
  CustomAlertComponent,
  RatingComponent,
  YouTubePlayerFullscreenComponent,
  CollectionPortfolioPanelComponent,
  PortfolioCalendarComponent,
  UserSubjectCompetencyComponent,
  SearchDestinationComponent,
  MilestonePanelComponent,
  MilestonePanelPopUpComponent,
  MilestoneInfoComponent,
  MilestoneGpsMapComponent,
  YourLocationPopoverComponent,
  ClassSetupNotCompletedComponent,
  PublisherInfoPanelComponent,
  MilestoneInfoPanelComponent,
  TitlePopoverComponent,
  TaxonomyPopoverComponent,
  PlayerPage,
  VideoConferenceComponent,
  EvidenceFileComponent,
  StudentClassProgressReportComponent,
  CalenderComponent,
  MilestoneLessonReportComponent,
  CourseMapLessonReportComponent,
  ScorePointComponent,
  RerouteSuggestionChartComponent,
  RoutePathViewCardComponent,
  RouteContentPopoverComponent,
  ProgramCardComponent,
  ProgramNavigateCardComponent,
  SubProgramComponent,
  OptionMenuPopoverComponent,
  LessonListPullupComponent
];

@NgModule({
  declarations: [PAGES_COMPONENTS],
  entryComponents: [
    TopicInfoComponent,
    CompetencyInfoComponent,
    DomainInfoComponent,
    LegendPullUpComponent,
    MilestoneWithPerformanceReportComponent,
    MilestoneModalComponent,
    CourseMapComponent,
    DiagnosisOfKnowledgeComponent,
    ProficiencyDirectionComponent,
    NotificationComponent,
    JourneyReportComponent,
    MilestoneReportComponent,
    SuggestionComponent,
    OaGradingReportComponent,
    AssessmentReportComponent,
    CollectionReportComponent,
    OfflineActivityReportComponent,
    CourseMapReportComponent,
    ScorePointComponent,
    RESOURCES,
    QUESTIONS,
    COLLECTIONS,
    RerouteSuggestionComponent,
    MilestonePanelPopUpComponent,
    YouTubePlayerFullscreenComponent,
    PortfolioCalendarComponent,
    UserSubjectCompetencyComponent,
    SearchDestinationComponent,
    MilestoneInfoComponent,
    PublisherInfoPanelComponent,
    MilestoneInfoPanelComponent,
    TaxonomyPopoverComponent,
    PlayerPage,
    TitlePopoverComponent,
    YourLocationPopoverComponent,
    VideoConferenceComponent,
    StudentClassProgressReportComponent,
    CalenderComponent,
    MilestoneLessonReportComponent,
    CourseMapLessonReportComponent,
    RoutePathViewCardComponent,
    RouteContentPopoverComponent,
    SubProgramComponent,
    OptionMenuPopoverComponent,
    LessonListPullupComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    SharedApplicationPipesModule,
    RouterModule,
    CalendarModule,
    MatExpansionModule,
    SharedApplicationDirectivesModule,
    AvatarModule,
    DragulaModule
  ],
  exports: [
    PAGES_COMPONENTS
  ],
})

export class SharedComponentModule { }
