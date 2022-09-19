import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import {
  PLAYER_EVENT_SOURCE,
  RUBRIC
} from '@shared/constants/helper-constants';
import { GradeDetailsModel, TabsModel } from '@shared/models/offline-activity/offline-activity';
import { CategoriesModel, RubricModel } from '@shared/models/rubric/rubric';
import { ClassActivityProvider } from '@shared/providers/apis/class-activity/class-activity';
import { ClassActivityService } from '@shared/providers/service/class-activity/class-activity.service';
import { LoadingService } from '@shared/providers/service/loader.service';

@Component({
  selector: 'oa-grading-report',
  templateUrl: './oa-grading-report.component.html',
  styleUrls: ['./oa-grading-report.component.scss']
})
export class OaGradingReportComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public gradeDetails: GradeDetailsModel;
  public tabs: Array<TabsModel>;
  public studentRubric: RubricModel;
  public teacherRubric: RubricModel;
  public categories: Array<CategoriesModel>;
  public classId: string;
  public studentScore: number;
  public showStudentTab: boolean;
  public showTeacherTab: boolean;
  public userId: string;
  public overallComments: string;
  public isCanceled: boolean;
  public showOaAnswerTab: boolean;
  private isGraded: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private loader: LoadingService,
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private classActivityService: ClassActivityService,
    private classActivityProvider: ClassActivityProvider
  ) {
    this.tabs = [{
      title: 'RUBRIC',
      isActive: true
    }, {
      title: 'ANSWER',
      isActive: false
    }, {
      title: 'TEACHER_RUBRIC',
      isActive: false
    }];
    this.classId = this.navParams.get('classId');
    this.userId = this.navParams.get('userId');
    this.studentScore = 0;
    this.showStudentTab = true;
    this.isGraded = false;
  }


  // -------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    const grade = this.navParams.get('grade');
    this.fetchGradeDetails(grade);
  }

  /**
   * @function selectCategoryEvent
   * This method is used to get the selected category
   */
  public selectCategoryEvent(category) {
    this.isCanceled = false;
    const selectedLevelIndex = category.selectedLevelIndex;
    const selectCategoryIndex = category.selectCategoryIndex;
    const selectCategory = this.categories.find((item, categoryIndex) => {
      return categoryIndex === selectCategoryIndex;
    });
    if (selectCategory.levels.length) {
      selectCategory.levels.map((level, levelIndex) => {
        level.isSelected = levelIndex === selectedLevelIndex;
        level.comments = category.levelComments;
      });
      // Creates a default level with given comments when there is no levels in category
      if (!category.selectedLevel) {
        this.setDefaultLevels(selectCategory, category);
      }
    } else {
      this.setDefaultLevels(selectCategory, category);
    }
    this.getStudeRubricScore();
  }

  /**
   * @function setDefaultLevels
   * This method is used to set the default level with given comments
   */
  private setDefaultLevels(selectCategory, category) {
    const defaultSelectedLevel = {
      name: null,
      score: null,
      comments: category.levelComments,
      isSelected: true
    };
    selectCategory.levels.push(defaultSelectedLevel);
  }

  /**
   * @function fetchGradeDetails
   * This method is used to fetch grade details
   */
  private fetchGradeDetails(grade) {
    this.loader.displayLoader();
    this.classActivityService.fetchGradeDetails(grade, this.classId, this.userId).then(content => {
      this.gradeDetails = content;
      this.teacherRubric = this.gradeDetails.content.teacherRubric;
      this.studentRubric = this.gradeDetails.content.studentRubric;
      this.parseRubricCategories(this.studentRubric.categories);
      this.parseRubricCategories(this.teacherRubric.categories);
      this.categories = this.studentRubric.categories;
      this.fetchOaSubmissions();
      this.setDefaultCategoryLevels();
    }).finally(() => {
      this.loader.dismissLoader();
    });
  }

  /**
   * @function fetchOaSubmissions
   * This method is used to fetch oa submissions and tasks
   */
  private fetchOaSubmissions() {
    this.classActivityService.fetchOaSubmissions(this.classId, this.gradeDetails.dcaContentId, this.userId).then(content => {
      this.normalizeTasks(content, this.gradeDetails.content.tasks);
    });
  }

  /**
   * @function normalizeTasks
   * This method is used to normalize the tasks
   */
  private normalizeTasks(content, tasks) {
    if (content && content.tasks.length) {
      tasks.map((task) => {
        const submittedTask = content.tasks.find((submission) => {
          return submission.taskId === task.id;
        });
        return task.oaTaskSubmissions = submittedTask;
      });
    }
  }

  /**
   * @function parseRubricCategories
   * This method is used to set the total points for each category
   */
  private parseRubricCategories(categories) {
    categories.map(category => {
      const levels = category.levels;
      levels.map((level, index) => {
        const score =
          index > 0 ? index * Math.floor(100 / (levels.length - 1)) : 10;
        level.scoreInPrecentage = score;
      });
      category.levels = levels;
    });
  }

  /**
   * @function setDefaultCategoryLevels
   * This method is used to set the default state of levels
   */
  private setDefaultCategoryLevels() {
    this.categories.map((category) => {
      return category.levels.map((level) => {
        return level.isSelected = false;
      });
    });
  }

  // -------------------------------------------------------------------------
  // Actions

  /**
   * @function closeRubric
   * This method is used to close the pullup
   */
  public closeRubric() {
    this.modalCtrl.dismiss({
      isGraded: this.isGraded
    });
  }

  /**
   * @function onEnterGeneralComments
   * This method is used to get the grade overall comments
   */
  public onEnterGeneralComments(comments) {
    this.overallComments = comments;
  }

  /**
   * @function onCancel
   * This method is used to cancel the graded values
   */
  public onCancel() {
    this.isCanceled = true;
    this.studentScore = 0;
    this.setDefaultCategoryLevels();
  }

  /**
   * @function submitOAGrade
   * This method is used to submit the oa grade values
   */
  public submitOAGrade() {
    const selectedLevels = this.parseCategoryLevel();
    const oaGradeModel = this.parseOaGrade(selectedLevels);
    this.classActivityProvider.submitOAGrade(oaGradeModel);
    this.isGraded = true;
    this.closeRubric();
  }


  /**
   * @function parseOaGrade
   * This method is used to parse the oa grade
   */
  private parseOaGrade(selectedLevels) {
    return {
      category_score: selectedLevels,
      class_id: this.classId,
      collection_id: this.gradeDetails.collectionId,
      collection_type: this.gradeDetails.contentType,
      content_source: PLAYER_EVENT_SOURCE.DAILY_CLASS,
      dca_content_id: this.gradeDetails.dcaContentId,
      grader: RUBRIC.STUDENT.toLowerCase(),
      max_score: this.studentRubric.maxScore,
      overall_comment: this.overallComments,
      rubric_id: this.studentRubric.id,
      student_id: this.userId,
      student_score: this.studentScore
    };
  }


  /**
   * @function parseCategoryLevel
   * This method is used to normalize the category and levels
   */
  private parseCategoryLevel() {
    const filteredCategories = [];
    this.categories.forEach((category) => {
      const selectedLevel = category.levels.find((level) => {
        return level.isSelected;
      });
      if (selectedLevel) {
        const filteredLevel = {
          category_title: category.title,
          level_max_score: category.allowsScoring ? this.studentRubric.maxScore : 0,
          level_obtained: selectedLevel.name,
          level_score: category.allowsScoring ? selectedLevel.score : 0,
          level_comment: selectedLevel.comments ? selectedLevel.comments : null,
        };
        filteredCategories.push(filteredLevel);
      }
    });
    return filteredCategories;
  }


  /**
   * @function getStudeRubricScore
   * This method is used to get the student rubric score
   */
  public getStudeRubricScore() {
    let score = 0;
    this.categories.forEach((category) => {
      category.levels.forEach((level) => {
        if (category.allowsScoring && level.isSelected) {
          score += level.score;
        }
      });
    });
    this.studentScore = score;
  }

  /**
   * @function showTab
   * This method is used to active tab
   */
  public showTab(tab, selectedTabIndex) {
    this.tabs.map((rubricTab, tabIndex) => {
      rubricTab.isActive = tabIndex === selectedTabIndex;
    });
    this.showTeacherTab = tab.title === 'TEACHER_RUBRIC';
    this.showStudentTab = tab.title === 'RUBRIC';
    this.showOaAnswerTab = tab.title === 'ANSWER';
  }
}
