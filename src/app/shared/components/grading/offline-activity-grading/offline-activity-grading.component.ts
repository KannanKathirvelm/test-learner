import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CONTENT_TYPES, PLAYER_EVENT_SOURCE, RUBRIC } from '@shared/constants/helper-constants';
import { GradeItemDeatilsModel, SubmissionsModel } from '@shared/models/offline-activity/offline-activity';
import { CategoriesModel, RubricModel } from '@shared/models/rubric/rubric';
import { ClassActivityProvider } from '@shared/providers/apis/class-activity/class-activity';
import { SessionService } from '@shared/providers/service/session/session.service';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'offline-activity-grading',
  templateUrl: './offline-activity-grading.component.html',
  styleUrls: ['./offline-activity-grading.component.scss'],
  animations: [collapseAnimation({ duration: 1000, delay: 0 })]
})
export class OfflineActivityGradingComponent implements OnInit {
  public displayAchievement = false;

  // -------------------------------------------------------------------------
  // Dependencies
  constructor(
    private session: SessionService,
    private classActivityProvider: ClassActivityProvider
  ) { }
  /**
   * @property {string} userId
   * Property for currently logged in user id
   */
  get userId(): string {
    return this.session.userSession.user_id;
  }

  // -------------------------------------------------------------------------
  // Properties
  public offlineActivityRubric: GradeItemDeatilsModel;
  /**
   * @property {GradeItemDeatilsModel} offlineActivity
   * Property for offile activity object
   */
  @Input() public offlineActivity: GradeItemDeatilsModel;

  /**
   * @property {string} offlineActivityId
   * Property for offline activiity id
   */
  @Input() public offlineActivityId: string;

  /**
   * @property {number} activityId
   * Property for CA id
   */
  @Input() public activityId: number;

  /**
   * @property {string} classId
   * Property for class id
   */
  @Input() public classId: string;

  /**
   * @property {boolean} isTeacherGraded
   * Property to check whether the rubric is graded by teacher or not
   */
  @Input() public isTeacherGraded: boolean;

  /**
   * @property {SubmissionsModel} submissions
   * Property for offline activity submissions
   */
  @Input() public submissions: SubmissionsModel;
  @Input() public isReportViewMode: boolean;
  @Input() public isPreview: boolean;
  @Output() public showAlert = new EventEmitter();
  public showStudentRubric = true;
  public showTeacherRubric = true;

  /**
   * @property {RubricModel} studentRubric
   * Property for student rubric object
   */
  public studentRubric: RubricModel;

  /**
   * @property {RubricModel} teacherRubric
   * Property for teacher rubric object
   */
  public teacherRubric: RubricModel;

  /**
   * @property {CategoriesModel[]} categories
   * Property for student rubric categories
   */
  public categories: CategoriesModel[];

  /**
   * @property {string} activeTab
   * Property for active tab context
   */
  public activeTab = 'self';

  /**
   * @property {number} studentScore
   * Property for submitted student score
   */
  public studentScore = 0;

  /**
   * @property {string} overallComments
   * Property for overall comment submitted by student
   */
  public overallComments = '';

  /**
   * @property {string[]} tabs
   * Property for list of tabs
   */
  public tabs: string[] = ['self', 'teacher'];


  // -------------------------------------------------------------------------
  // Events
  public ngOnInit() {
    this.offlineActivityRubric = { ...this.offlineActivity };
    this.studentRubric = this.offlineActivityRubric.studentRubric;
    this.teacherRubric = this.offlineActivityRubric.teacherRubric;
    this.categories = this.studentRubric ? this.studentRubric.categories : [];
    this.loadGradingData();
  }

  // -------------------------------------------------------------------------
  // Actions

  // Action triggered when typing overall comments
  public onEnterGeneralComments(comments) {
    this.overallComments = comments;
  }

  // Action triggered when selecting a category
  public selectCategoryEvent(category) {
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

  // Action triggered when submitting grading
  public submitGrade() {
    let categoryLevels = null;
    if (this.studentRubric) {
      categoryLevels = this.parseCategoryLevel();
    }
    this.classActivityProvider.submitOAGrade(this.getGradingPayload(categoryLevels));
    this.showAlert.emit();
  }


  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadGradingData
   * Method to load garding data
   */
  private loadGradingData() {
    this.parseRubricCategories();
    if (this.submissions.oaRubrics) {
      this.parseSubmissionGrade();
    } else {
      this.setDefaultCategoryLevels();
    }
  }

  /**
   * @function parseSubmissionGrade
   * This method is used to parse the submission grade
   */
  public parseSubmissionGrade() {
    const studentRubric = this.studentRubric;
    const teacherRubric = this.teacherRubric;
    if (this.submissions.oaRubrics.studentGrades) {
      this.parseSubmissionGradeCategories(this.submissions.oaRubrics.studentGrades, studentRubric);
    }
    if (this.submissions.oaRubrics.teacherGrades) {
      this.parseSubmissionGradeCategories(this.submissions.oaRubrics.teacherGrades, teacherRubric);
    }
  }

  /**
   * @function parseSubmissionGradeCategories
   * This method is used to parse the submission categories
   */
  public parseSubmissionGradeCategories(grade, rubric) {
    const categories = rubric ? rubric.categories : [];
    const gradedCategories = grade.categoryScore
      ? grade.categoryScore
      : [];
    if (grade && gradedCategories.length > 0) {
      categories.map((category, index) => {
        const gradedCategory = gradedCategories[index];
        if (gradedCategory) {
          const levels = category.levels;
          if (levels) {
            levels.map((level, levelIndex) => {
              const levelScore =
                levelIndex > 0 ? levelIndex * Math.floor(100 / (levels.length - 1)) : 10;
              level.scoreInPrecentage = levelScore;
              if (
                level.name === gradedCategory.level_obtained
              ) {
                category.scoreInPrecentage = levelScore;
                level.isSelected = true;
              } else {
                level.isSelected = false;
              }
            });
            category.comment = gradedCategory.level_comment;
            category.levels = levels;
            category.maxScore = gradedCategory.level_max_score;
          }
        }
      });
    }
    const score = grade.studentScore ? grade.studentScore : 0;
    if (rubric) {
      rubric.comment = grade.overallComment;
      rubric.studentScore = score;
      this.studentScore = score;
    }
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
   * @function parseRubricCategories
   * This method is used to set the total points for each category
   */
  private parseRubricCategories() {
    if (this.studentRubric) {
      this.studentRubric.categories.map(category => {
        const levels = category.levels;
        levels.map((level, index) => {
          const score =
            index > 0 ? index * Math.floor(100 / (levels.length - 1)) : 10;
          level.scoreInPrecentage = score;
        });
        category.levels = levels;
      });
    }
    if (this.teacherRubric) {
      this.teacherRubric.categories.map(category => {
        const levels = category.levels;
        levels.map((level, index) => {
          const score =
            index > 0 ? index * Math.floor(100 / (levels.length - 1)) : 10;
          level.scoreInPrecentage = score;
        });
        category.levels = levels;
      });
    }
  }

  /**
   * @function parseCategoryLevel
   * This method is used to normalize the category and levels
   */
  private parseCategoryLevel() {
    const filteredCategories = [];
    this.categories.forEach((category) => {
      const rubricCategory = {
        category_title: category.title,
        level_max_score: 0,
        level_score: 0,
        level_obtained: null,
        level_comment: null
      };
      if (category.allowsLevels) {
        const selectedLevel = category.levels.find((levelItem) => {
          return levelItem.isSelected;
        });
        if (selectedLevel) {
          rubricCategory.level_obtained = selectedLevel.name;
          rubricCategory.level_comment = selectedLevel.comments;
          if (category.allowsLevels && category.allowsScoring) {
            rubricCategory.level_score = selectedLevel.score;
            rubricCategory.level_max_score = category.maxScore ? category.maxScore : null;
          }
        }
      }
      filteredCategories.push(rubricCategory);
    });
    return filteredCategories;
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
   * @function getGradingPayload
   * This method is used to get grading payload
   */
  private getGradingPayload(selectedLevels) {
    return {
      category_score: selectedLevels,
      class_id: this.classId,
      collection_id: this.offlineActivity.id,
      collection_type: CONTENT_TYPES.OFFLINE_ACTIVITY,
      content_source: PLAYER_EVENT_SOURCE.DAILY_CLASS,
      dca_content_id: this.activityId,
      grader: RUBRIC.STUDENT.toLowerCase(),
      max_score: this.studentRubric ? this.studentRubric.maxScore : null,
      overall_comment: this.overallComments,
      rubric_id: this.studentRubric ? this.studentRubric.id : null,
      student_id: this.userId,
      student_score: this.studentScore || null
    };
  }

  public toggleStudentRubric() {
    this.showStudentRubric = !this.showStudentRubric;
  }

  public toggleTeacherRubric() {
    this.showTeacherRubric = !this.showTeacherRubric;
  }

}
