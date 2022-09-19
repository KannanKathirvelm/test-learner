import { Injectable } from '@angular/core';
import { ASSESSMENT, COLLECTION } from '@shared/constants/helper-constants';
import { CollectionProvider } from '@shared/providers/apis/collection/collection';
import { PerformanceProvider } from '@shared/providers/apis/performance/performance';
import { MilestoneService } from '@shared/providers/service/milestone/milestone.service';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {

  constructor(
    private collectionProvider: CollectionProvider,
    private performanceProvider: PerformanceProvider,
    private milestoneService: MilestoneService
  ) { }

  /**
   * @function fetchCollectionList
   * This Method is used to get collections
   */
  public fetchCollectionList(classId: string, courseId: string, lessonId: string, unitId: string, collections = [], lesson = null) {
    const collectionPromise: any = collections.length ? Promise.resolve(collections) : this.collectionProvider.fetchCollectionList(classId, courseId, lessonId, unitId);
    return collectionPromise
      .then(async (collectionResult) => {
        let collectionSummary = [];
        if (!collections.length) {
          const teacherSuggestions = collectionResult.alternatePaths.teacherSuggestions;
          const systemSuggestions = collectionResult.alternatePaths.systemSuggestions;
          const suggestions = teacherSuggestions.concat(systemSuggestions);
          const skippedContents = await this.milestoneService.getSkippedContents(classId, courseId);
          const skippedCollection = skippedContents && skippedContents['collections'] ? skippedContents['collections'] : [];
          const skippedAssessment = skippedContents && skippedContents['assessments'] ? skippedContents['assessments'] : [];
          const skippedCollections = skippedCollection.concat(skippedAssessment);
          collectionSummary = collectionResult.coursePath.collectionSummary;
          const lessonContent = collectionResult.coursePath;
          if (lesson) {
            lesson.aggregatedTaxonomy = lessonContent.aggregatedTaxonomy;
          }
          if (suggestions && suggestions.length) {
            suggestions.reverse().forEach((suggestion) => {
              const collectionIndex = collectionSummary.findIndex((collection) => {
                return collection.id === suggestion.collectionId;
              });
              collectionSummary.splice(collectionIndex + 1, 0, suggestion);
            });
          }
          collectionSummary.map((collection) => {
            collection.isRescoped = skippedCollections.includes(collection.id);
            return collection;
          });
        } else {
          collectionSummary = collections;
        }

        this.fetchCollectionPerformance(classId, courseId, lessonId, unitId, ASSESSMENT, collectionSummary);
        this.fetchCollectionPerformance(classId, courseId, lessonId, unitId, COLLECTION, collectionSummary);
        return collectionSummary;
      });
  }

  /**
   * @function fetchUnitCollection
   * This Method is used to get unit collection
   */
  public fetchUnitCollection(classId, courseId, lessonId, unitId, collections = []) {
    const collectionPromise: any = collections.length ? Promise.resolve(collections) : this.collectionProvider.fetchCollectionList(classId, courseId, lessonId, unitId);
    return collectionPromise.then((collectionResult) => {
      let collectionSummary = [];
      if (!collections.length) {
        const teacherSuggestions = collectionResult.alternatePaths.teacherSuggestions
        ? collectionResult.alternatePaths.teacherSuggestions
        : [];
        const systemSuggestions = collectionResult.alternatePaths.systemSuggestions
        ? collectionResult.alternatePaths.systemSuggestions
        : [];
        const suggestions = teacherSuggestions.concat(systemSuggestions);
        collectionSummary = collectionResult.coursePath.collectionSummary;
        if (suggestions && suggestions.length) {
        suggestions.forEach((suggestion) => {
          const collectionIndex = collectionSummary.findIndex((collection) => {
            return collection.id === suggestion.collectionId;
          });
          collectionSummary.splice(collectionIndex + 1, 0, suggestion);
        });
      }
      } else {
        collectionSummary = collections;
      }
      if (collectionSummary.length) {
        this.fetchCollectionPerformance(classId, courseId, lessonId, unitId, ASSESSMENT, collectionSummary);
        this.fetchCollectionPerformance(classId, courseId, lessonId, unitId, COLLECTION, collectionSummary);
      }
      return collectionSummary;
    });
  }

  /**
   * @function fetchCollectionPerformance
   * This Method is used to fetch collection performance
   */
  public fetchCollectionPerformance(classId, courseId, lessonId, unitId, collectionType, collections) {
    return this.performanceProvider.fetchCollectionPerformance(classId, courseId, lessonId, unitId, collectionType)
      .then((assessmentPerformance) => {
        const performances = assessmentPerformance.usageData;
        performances.map((performance) => {
          const collection = collections.find((item) => {
            return (item.id || item.collectionId) === performance.collectionId;
          });
          if (collection) {
            collection.performance = performance;
          }
        });
      });
  }
}
