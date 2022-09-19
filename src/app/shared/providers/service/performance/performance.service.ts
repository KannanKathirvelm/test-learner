import { Injectable } from '@angular/core';
import { ASSESSMENT, COLLECTION, PATH_TYPES, SUGGESTION_SCOPE } from '@shared/constants/helper-constants';
import { PerformanceProvider } from '@shared/providers/apis/performance/performance';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {

  constructor(
    private performanceProvider: PerformanceProvider
  ) {
  }

  /**
   * @function combineSuggestionIntoPerformance
   * This Method is used to merge suggestions into their collections
   */
  public getSuggestionPerformance(classId, source, suggestions, params) {
    const caContents = suggestions.filter((item) => item.suggestionArea === SUGGESTION_SCOPE.CLASS_ACTIVITY);
    const courseMapContents = suggestions.filter((item) => item.suggestionArea === SUGGESTION_SCOPE.COURSE_MAP);
    const proficiencyContents = suggestions.filter((item) => item.suggestionArea === SUGGESTION_SCOPE.PROFICIENCY);
    /* --- class Activity --- */
    const caCollections = caContents.filter((item) => item.suggestedContentType === COLLECTION);
    const caAssessments = caContents.filter((item) => item.suggestedContentType === ASSESSMENT);
    const caCollectionsPathId = caCollections.map((item) => item.id);
    const caAssessmentPathId = caAssessments.map((item) => item.id);
    /* --- course map --- */
    let courseMapCollections = courseMapContents.filter((item) => item.suggestedContentType === COLLECTION);
    let courseMapAssessments = courseMapContents.filter((item) => item.suggestedContentType === ASSESSMENT);
    if (params.suggestionOrigin === PATH_TYPES.SYSTEM) {
      courseMapCollections = courseMapCollections.filter((item) => item.accepted);
      courseMapAssessments = courseMapAssessments.filter((item) => item.accepted);
    }
    const courseMapCollectionsPathId = courseMapCollections.map((item) => item.pathId);
    const courseMapAssessmentPathId = courseMapAssessments.map((item) => item.pathId);
    /* --- proficiency --- */
    const proficiencyCollections = proficiencyContents.filter((item) => item.suggestedContentType === COLLECTION);
    const proficiencyAssessments = proficiencyContents.filter((item) => item.suggestedContentType === ASSESSMENT);
    const proficiencyCollectionsPathId = proficiencyCollections.map((item) => item.id);
    const proficiencyAssessmentPathId = proficiencyAssessments.map((item) => item.id);
    return new Promise((resolve, reject) => {
      if (caCollectionsPathId.length) {
        this.performanceProvider.fetchSuggestionCollectionPerformance(caCollectionsPathId, COLLECTION, source, classId).then((collectionPerformance) => {
          this.normalizeSuggestionPerformanceList(suggestions, collectionPerformance, 'id');
        }, reject);
      }
      if (caAssessmentPathId.length) {
        this.performanceProvider.fetchSuggestionCollectionPerformance(caAssessmentPathId, ASSESSMENT, source, classId).then((collectionPerformance) => {
          this.normalizeSuggestionPerformanceList(suggestions, collectionPerformance, 'id');
        }, reject);
      }
      if (courseMapCollectionsPathId.length) {
        this.performanceProvider.fetchSuggestionCollectionPerformance(courseMapCollectionsPathId, COLLECTION, source, classId).then((collectionPerformance) => {
          this.normalizeSuggestionPerformanceList(suggestions, collectionPerformance, 'pathId');
        }, reject);
      }
      if (courseMapAssessmentPathId.length) {
        this.performanceProvider.fetchSuggestionCollectionPerformance(courseMapAssessmentPathId, ASSESSMENT, source, classId).then((collectionPerformance) => {
          this.normalizeSuggestionPerformanceList(suggestions, collectionPerformance, 'pathId');
        }, reject);
      }
      if (proficiencyCollectionsPathId.length) {
        this.performanceProvider.fetchSuggestionCollectionPerformance(proficiencyCollectionsPathId, COLLECTION, source, classId).then((collectionPerformance) => {
          this.normalizeSuggestionPerformanceList(suggestions, collectionPerformance, 'id');
        }, reject);
      }
      if (proficiencyAssessmentPathId.length) {
        this.performanceProvider.fetchSuggestionCollectionPerformance(proficiencyAssessmentPathId, ASSESSMENT, source, classId).then((collectionPerformance) => {
          this.normalizeSuggestionPerformanceList(suggestions, collectionPerformance, 'id');
        }, reject);
      }
      resolve(suggestions);
    });
  }

  /**
   * @function fetchMilestonePerformance
   * Method to used to fetch milestone performance
   */
  public fetchMilestonePerformance(classId, courseId, fwCode, milestones) {
    return axios
      .all([
        this.performanceProvider.fetchMilestonePerformance(classId, courseId, fwCode, ASSESSMENT),
        this.performanceProvider.fetchMilestonePerformance(classId, courseId, fwCode, COLLECTION)
      ])
      .then(
        axios.spread((
          milestoneAssessmentPerformance,
          milestoneCollectionPerformance
        ) => {
          this.normalizeMilestoneAssessmentPerformance(milestones, milestoneAssessmentPerformance);
          this.normalizeMilestoneCollectionPerformance(milestones, milestoneCollectionPerformance);
          return milestones;
        }));
  }

  /**
   * @function normalizeMilestoneCollectionPerformance
   * Method to used to set performance summary for milestone
   */
  private normalizeMilestoneCollectionPerformance(milestoneList, performanceList) {
    return milestoneList.map((milestone) => {
      const milestonePerformance = performanceList.find((item) => milestone.milestoneId === item.milestoneId);
      const performanceData = milestonePerformance ? milestonePerformance.usageData : [];
      if (performanceData.length && milestone.performance) {
        milestone.performance.timeSpent = performanceData[0].timeSpent;
      } else {
        if (performanceData.length) {
          const performance = performanceData[0];
          milestone.performance = {
            scoreInPercentage: null,
            timeSpent: performance.timeSpent,
            totalCount: performance.totalCount
          };
        }
      }
      return milestone;
    });
  }

  /**
   * @function normalizeMilestoneAssessmentPerformance
   * Method to used to set performance summary for milestone
   */
  private normalizeMilestoneAssessmentPerformance(milestoneList, performanceList) {
    return milestoneList.map((milestone) => {
      const milestonePerformance = performanceList.find((item) => milestone.milestoneId === item.milestoneId);
      const performanceData = milestonePerformance ? milestonePerformance.usageData : [];
      if (performanceData.length) {
        const performance = performanceData[0];
        milestone.performance = performance;
      }
      return milestone;
    });
  }

  /**
   * @function normalizeSuggestionPerformanceList
   * This method is used to normalize suggestion performance list
   */
  private normalizeSuggestionPerformanceList(suggestions, performanceData, lookupKey) {
    if (performanceData.length) {
      return suggestions.map((suggestion) => {
        const performance = performanceData[0].usageData.find((item) => {
          return item.pathId === suggestion[lookupKey];
        });
        if (performance) {
          suggestion.performance = performance;
        }
        return suggestion;
      });
    }
  }

  /**
   * @function fetchUserSessionIds
   * This Method is used to get list of session ids
   */
  public fetchUserSessionIds(contentType, assessmentId, context, openSession?) {
    return this.performanceProvider.fetchUserSessionIds(contentType, assessmentId, context, openSession);
  }

  /**
   * @function fetchUnitPerformance
   * This method is used to fetch unit performance
   */
  public fetchUnitPerformance(classId, courseId, unitList?) {
    return this.performanceProvider.fetchUnitPerformance(classId, courseId).then((response) => {
      const unitPerformances = response;
      if (unitList) {
        return unitList.map((unit) => {
          const performance = unitPerformances.find((performanceItem) => performanceItem.unitId === unit.unitId);
          if (performance) {
            unit.performance = performance;
          }
        });
      } else {
        return unitPerformances;
      }
    });
  }

  /**
   * @function fetchUnitLessonPerformance
   * This method is used to fetch unit lesson performance
   */
  public fetchUnitLessonPerformance(classId, courseId, unitId, lessons?) {
    return this.performanceProvider.fetchUnitLessonPerformance(classId, courseId, unitId).then((response) => {
      const unitLessonsPerformance = response;
      if (lessons) {
        return lessons.map((lesson) => {
          const performance = unitLessonsPerformance.find((performanceItem) => performanceItem.lessonId === lesson.lessonId);
          if (performance) {
            lesson.performance = performance;
          }
        });
      } else {
        return unitLessonsPerformance;
      }
    });
  }

  /**
   * @function fetchCASuggestionPerformance
   * This method is used to fetch ca suggestion performance
   */
  public fetchCASuggestionPerformance(suggestions, classId) {
    const collectionPathIds = [];
    const assessmentPathIds = [];
    const assessmentSuggestions = suggestions.filter((item) => item.suggestedContentType === ASSESSMENT);
    const collectionSuggestions = suggestions.filter((item) => item.suggestedContentType === COLLECTION);
    assessmentSuggestions.forEach((assessmentSuggestion) => {
      const suggestedToContext = assessmentSuggestion.suggestedToContext;
      if (suggestedToContext) {
        suggestedToContext.forEach(context => {
          assessmentPathIds.push(context.id);
        });
      }
    });
    collectionSuggestions.forEach((collectionSuggestion) => {
      const suggestedToContext = collectionSuggestion.suggestedToContext;
      if (suggestedToContext) {
        suggestedToContext.forEach(context => {
          collectionPathIds.push(context.id);
        });
      }
    });
    return new Promise((resolve, reject) => {
      if (collectionPathIds.length) {
        this.performanceProvider.fetchSuggestionCollectionPerformance(collectionPathIds, COLLECTION, 'dca', classId).then((collectionPerformance) => {
          this.normalizeCASuggestionPerformanceList(suggestions, collectionPerformance, 'id');
        }, reject);
      }
      if (assessmentPathIds.length) {
        this.performanceProvider.fetchSuggestionCollectionPerformance(assessmentPathIds, ASSESSMENT, 'dca', classId).then((assessmentPerformance) => {
          this.normalizeCASuggestionPerformanceList(suggestions, assessmentPerformance, 'id');
        }, reject);
      }
    });
  }

  /**
   * @function normalizeCASuggestionPerformanceList
   * This method is used to normalize ca suggestion performance list
   */
  public normalizeCASuggestionPerformanceList(suggestions, performance, lookupKey) {
    if (performance && performance.length) {
      suggestions.map((suggestion) => {
        const suggestedToContext = suggestion.suggestedToContext;
        if (suggestedToContext) {
          suggestedToContext.forEach((context) => {
            const suggestionPerformance = performance[0].usageData.find((item) => item.pathId === context[lookupKey]);
            if (suggestionPerformance) {
              suggestion.performance = suggestionPerformance;
            }
          });
        } else {
          const suggestionPerformance = performance[0].usageData.find((item) => item.pathId === suggestion[lookupKey]);
          if (suggestionPerformance) {
            suggestion.performance = suggestionPerformance;
          }
        }
      });
    }
  }

  /**
   * @function getStudentProgressReport
   * This method is used to get student progress report
   */
  public getStudentProgressReport(params: any ) {
    const {timespentParams, summaryParams, statsParams, timespentDatewiseParams} = this.requestParam(params);
    return axios.all([
      this.performanceProvider.fetchStudentCompetencies(timespentParams),
      this.performanceProvider.fetchStudentsSummaryReport(params.classId, summaryParams) as any,
      this.performanceProvider.fetchStudentsTimespentSummaryreport(timespentParams),
      this.performanceProvider.getSuggestionStats(statsParams),
      this.performanceProvider.getStreakStats(statsParams),
      this.performanceProvider.fetchMasteredStats(statsParams),
      this.performanceProvider.fetchStudentDatewiseTimespent(timespentDatewiseParams)
    ]).then(axios.spread((studentReport, summaryData, classMembersTimespent, suggestionStats,
                          streakStats, masteredStats, timespentDatewiseData) => {
      return {
        studentReport,
        summaryData,
        classMembersTimespent,
        suggestionStats,
        streakStats,
        masteredStats,
        timespentDatewiseData
      };
    }));
  }

  /**
   * @function requestParam
   * This method is used to get the params
   */
  public requestParam(params) {
    return {
      timespentParams: {
        classId: params.classId,
        userId: params.userId,
        to: params.endDate,
        from: params.startDate ? params.startDate : params.endDate,
        subjectCode: params.subjectCode
      },
      timespentDatewiseParams: {
        classId: params.classId,
        userId: params.userId,
        to: params.endDate,
        from: params.startDate ? params.startDate : params.endDate
      },
      summaryParams: {
        fromDate: params.startDate ? params.startDate : params.endDate,
        toDate: params.endDate,
        subjectCode: params.subjectCode,
        userId: params.userId
      },
      statsParams: {
        userId: params.userId,
        classIds: [params.classId],
        to: params.endDate,
        from: params.startDate ? params.startDate : params.endDate,
      }
    };
  }
}
