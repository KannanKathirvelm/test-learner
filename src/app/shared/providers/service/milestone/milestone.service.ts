import { Injectable } from '@angular/core';
import { Unit0Model } from '@app/shared/models/unit0/unit0';
import { setCompetencyLearningContents, setDomainLearningContents, setMilestoneDetails, setTopicLearningContents } from '@app/shared/stores/actions/gps-milestone.action';
import { setMilestoneLearningContents, setMilestonesRoutes } from '@app/shared/stores/actions/milestone-routes.action';
import { getCompetenciesLearningContentsByClassId, getDomainsLearningContentsByDomainId, getMilestoneDetailsByCourseId, getTopicsLearningContentsByClassId } from '@app/shared/stores/reducers/gps-milestone-reducer';
import { Storage } from '@ionic/storage';
import { Store } from '@ngrx/store';
import { ASSESSMENT, COLLECTION } from '@shared/constants/helper-constants';
import { ClassMembersGrade } from '@shared/models/class/class';
import { LessonModel } from '@shared/models/lesson/lesson';
import {
  AlternativeLearningContentsModel, CompetencyAlternativeLearningContentsModel, DomainAlternativeLearningContentsModel,
  MilestoneDetailsModel, MilestoneModel, SkippedContents, TopicAlternativeLearningContentsModel
} from '@shared/models/milestone/milestone';
import { Route0ContentModel } from '@shared/models/route0/route0';
import { TaxonomyGrades } from '@shared/models/taxonomy/taxonomy';
import { TenantSettingsModel } from '@shared/models/tenant/tenant-settings';
import { MilestoneProvider } from '@shared/providers/apis/milestone/milestone';
import { PerformanceProvider } from '@shared/providers/apis/performance/performance';
import { ClassService } from '@shared/providers/service/class/class.service';
import { LookupService } from '@shared/providers/service/lookup/lookup.service';
import { PerformanceService } from '@shared/providers/service/performance/performance.service';
import { Route0Service } from '@shared/providers/service/route0/route0.service';
import { SessionService } from '@shared/providers/service/session/session.service';
import { TaxonomyService } from '@shared/providers/service/taxonomy/taxonomy.service';
import { Unit0Service } from '@shared/providers/service/unit0/unit0.service';
import { setMilestone, setMilestoneLesson, setSkippedContent } from '@shared/stores/actions/milestone.action';
import { getMilestonesLearningContentsByClassId, getMilestonesRoutesByClassId } from '@shared/stores/reducers/milestone-routes.reducer';
import { getLessonByMilestoneId, getMilestoneByClassId, getSkippedContentsByClassId } from '@shared/stores/reducers/milestone.reducer';
import { cloneObject, removeDuplicateValues } from '@shared/utils/global';
import axios from 'axios';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Injectable({
  providedIn: 'root'
})
export class MilestoneService {

  public lessonStoreSubscription: AnonymousSubscription;
  public milestoneStoreSubscription: Array<AnonymousSubscription>;
  public milestonesRoutesStoreSubscription: Array<AnonymousSubscription>;
  public learningContentStoreSubscriptions: Array<AnonymousSubscription>;
  public skippedContentStoreSubscription: AnonymousSubscription;

  constructor(
    private lookupService: LookupService,
    private storage: Storage,
    private performanceProvider: PerformanceProvider,
    private classService: ClassService,
    private store: Store,
    private milestoneProvider: MilestoneProvider,
    private performanceService: PerformanceService,
    private session: SessionService,
    private taxonomyService: TaxonomyService,
    private route0Service: Route0Service,
    private unit0Service: Unit0Service
  ) {
    this.milestoneStoreSubscription = [];
    this.milestonesRoutesStoreSubscription = [];
    this.learningContentStoreSubscriptions = [];
  }

  /**
   * @function fetchTenantSettings
   * This method is used to fetch tenant settings
   */
  private fetchTenantSettings() {
    return this.lookupService.fetchTenantSettings().then((tenantSettings: TenantSettingsModel) => {
      return tenantSettings;
    });
  }

  /**
   * @function fetchMilestones
   * This Method is used to get the milestone from the store
   */
  public fetchMilestones(courseId: string, fwCode: string, classId: string, showFullCourse: boolean, isForceReload) {
    return new Promise((resolve, reject) => {
      const classIdParam = !showFullCourse ? classId : null;
      const suffix = showFullCourse ? 'full_course' : 'milestone_course';
      const keyName = `${classId}_${suffix}`;
      if (isForceReload) {
        return this.milestoneProvider.fetchMilestones(courseId, fwCode, classIdParam).then((result) => {
          const milestones = result.milestones;
          this.store.dispatch(setMilestone({ key: keyName, data: milestones }));
          resolve(cloneObject(milestones));
        });
      } else {
        const milestoneStoreSubscription = this.store.select(getMilestoneByClassId(keyName))
          .subscribe((milestoneData) => {
            if (!milestoneData) {
              this.milestoneProvider.fetchMilestones(courseId, fwCode, classIdParam).then((result) => {
                const milestones = result.milestones;
                this.store.dispatch(setMilestone({ key: keyName, data: milestones }));
              });
            } else {
              resolve(cloneObject(milestoneData));
            }
          }, (error) => {
            reject(error);
          });
        this.milestoneStoreSubscription.push(milestoneStoreSubscription);
      }
    });
  }

  /**
   * @function setFullCourseState
   * This Method is used to set the full course state
   */
  public setFullCourseState(id, state) {
    const key = `${id}_show_full_course`;
    this.storage.set(key, state);
  }

  /**
   * @function getFullCourseState
   * This Method is used to get the full course state
   */
  public getFullCourseState(id) {
    const key = `${id}_show_full_course`;
    return this.storage.get(key);
  }

  /**
   * @function getMilestone
   * Method to used to get milestone
   */
  public getMilestone(classId: string, courseId: string, fwCode: string, showFullCourse: boolean, hasPerformance, isForceReload) {
    return this.fetchMilestones(courseId, fwCode, classId, showFullCourse, isForceReload).then((milestones: Array<MilestoneModel>) => {
      if (showFullCourse && hasPerformance) {
        this.performanceService.fetchMilestonePerformance(classId, courseId, fwCode, milestones);
      }
      return milestones;
    });
  }

  /**
   * @function fetchMilestoneStats
   * This Method is used to fetch milestone stats
   */
  public fetchMilestoneStats(milestoneIds, classId) {
    return this.milestoneProvider.fetchMilestoneStats(milestoneIds, classId);
  }

  /**
   * @function fetchMilestoneRoutes
   * Method to used to fetch milestone routes
   */
  public async fetchMilestoneRoutes(classId, isForceReload = false, subject) {
    const tenantSettings = await this.fetchTenantSettings();
    const navigatorRouteMapViewApplicable = tenantSettings ? tenantSettings.navigatorRouteMapViewApplicable : null;
    const routeMapViewApplicable = navigatorRouteMapViewApplicable ? navigatorRouteMapViewApplicable[`${subject}`] : null;
    if (!navigatorRouteMapViewApplicable) {
      // tslint:disable-next-line
      console.error(`Milestone route is empty for the class ${classId} and subject ${subject}`);
    }
    if (routeMapViewApplicable) {
      return new Promise((resolve, reject) => {
        if (isForceReload) {
          return this.milestoneProvider.fetchMilestoneRoutes(classId).then((milestonesRoutes) => {
            this.store.dispatch(setMilestonesRoutes({ key: classId, data: milestonesRoutes }));
            resolve(cloneObject(milestonesRoutes));
          });
        } else {
          const milestonesRoutesStoreSubscription = this.store.select(getMilestonesRoutesByClassId(classId)).subscribe((milestonesRoutesData) => {
            if (!milestonesRoutesData) {
              return this.milestoneProvider.fetchMilestoneRoutes(classId).then((milestonesRoutes) => {
                this.store.dispatch(setMilestonesRoutes({ key: classId, data: milestonesRoutes }));
              });
            } else {
              resolve(cloneObject(milestonesRoutesData));
            }
          });
          this.milestonesRoutesStoreSubscription.push(milestonesRoutesStoreSubscription);
        }
      });
    }
    return;
  }

  /**
   * @function fetchMilestoneDetails
   * Method to used to fetch milestone details
   */
  public fetchMilestoneDetails(courseId, classId, milestoneIds, route0MilestoneIds): Promise<Array<MilestoneDetailsModel>> {
    return new Promise((resolve) => {
      const milestoneDetailsStoreSubscriptions = this.store.select(getMilestoneDetailsByCourseId(classId + courseId)).subscribe((milestoneDetails) => {
        if (!milestoneDetails) {
          return this.milestoneProvider.fetchMilestoneDetails(courseId, classId, milestoneIds, route0MilestoneIds).then((milestoneDetail) => {
            this.store.dispatch(setMilestoneDetails({ key: classId + courseId, data: milestoneDetail }));
          }).catch((err) => {
            resolve([]);
          });
        } else {
          resolve(cloneObject(milestoneDetails));
        }
      });
      this.learningContentStoreSubscriptions.push(milestoneDetailsStoreSubscriptions);
    });
  }

  /**
   * @function fetchMilestoneLearningContents
   * Method to used to fetch milestone learning contents
   */
  public fetchMilestoneLearningContents(courseId, classId, framework): Promise<Array<AlternativeLearningContentsModel>> {
    return new Promise((resolve, reject) => {
      const learningContentStoreSubscriptions = this.store.select(getMilestonesLearningContentsByClassId(classId + courseId)).subscribe((milestonesLearningContentsData) => {
        if (!milestonesLearningContentsData) {
          return this.milestoneProvider.fetchMilestoneLearningContents(courseId, classId, framework).then((milestonesLearningContents) => {
            this.store.dispatch(setMilestoneLearningContents({ key: classId + courseId, data: milestonesLearningContents }));
          }).catch((err) => {
            resolve([]);
          });
        } else {
          resolve(cloneObject(milestonesLearningContentsData));
        }
      });
      this.learningContentStoreSubscriptions.push(learningContentStoreSubscriptions);
    });
  }

  /**
   * @function fetchDomainLearningContents
   * Method to used to fetch domain learning contents
   */
  public fetchDomainLearningContents(courseId, classId, framework, domainCode): Promise<Array<DomainAlternativeLearningContentsModel>> {
    return new Promise((resolve, reject) => {
      const learningContentStoreSubscriptions = this.store.select(getDomainsLearningContentsByDomainId(classId + courseId + domainCode.toString())).subscribe((domainLearningContentsData) => {
        if (!domainLearningContentsData) {
          return this.milestoneProvider.fetchDomainLearningContents(courseId, classId, framework, domainCode).then((domainLearningContents) => {
            this.store.dispatch(setDomainLearningContents({ key: classId + courseId + domainCode.toString(), data: domainLearningContents }));
          }).catch((err) => {
            resolve([]);
          });
        } else {
          resolve(cloneObject(domainLearningContentsData));
        }
      });
      this.learningContentStoreSubscriptions.push(learningContentStoreSubscriptions);
    });
  }

  /**
   * @function fetchTopicLearningContents
   * Method to used to fetch topic learning contents
   */
  public fetchTopicLearningContents(courseId, classId, framework, topicCode): Promise<Array<TopicAlternativeLearningContentsModel>> {
    return new Promise((resolve, reject) => {
      const learningContentStoreSubscriptions = this.store.select(getTopicsLearningContentsByClassId(classId + courseId + topicCode.toString())).subscribe((topicsLearningContentsData) => {
        if (!topicsLearningContentsData) {
          return this.milestoneProvider.fetchTopicLearningContents(courseId, classId, framework, topicCode).then((topicsLearningContents) => {
            this.store.dispatch(setTopicLearningContents({ key: classId + courseId + topicCode.toString(), data: topicsLearningContents }));
          }).catch((err) => {
            resolve([]);
          });
        } else {
          resolve(cloneObject(topicsLearningContentsData));
        }
      });
      this.learningContentStoreSubscriptions.push(learningContentStoreSubscriptions);
    });
  }

  /**
   * @function fetchCompetencyLearningContents
   * Method to used to fetch competency learning contents
   */
   public fetchCompetencyLearningContents(courseId, classId, framework, competencyCode): Promise<Array<CompetencyAlternativeLearningContentsModel>> {
    return new Promise((resolve, reject) => {
      const learningContentStoreSubscriptions = this.store.select(getCompetenciesLearningContentsByClassId(classId + courseId + competencyCode.toString())).subscribe((competenciesLearningContentsData) => {
        if (!competenciesLearningContentsData) {
          return this.milestoneProvider.fetchCompetencyLearningContents(courseId, classId, framework, competencyCode).then((competenciesLearningContents) => {
            this.store.dispatch(setCompetencyLearningContents({ key: classId + courseId + competencyCode.toString(), data: competenciesLearningContents }));
          }).catch((err) => {
            resolve([]);
          });
        } else {
          resolve(cloneObject(competenciesLearningContentsData));
        }
      });
      this.learningContentStoreSubscriptions.push(learningContentStoreSubscriptions);
    });
  }

  /**
   * @function fetchMilestone
   * This method is used to fetch milestones
   */
  public fetchMilestone(hasPerformance = true, isForceReload = false) {
    const classDetails = this.classService.class;
    const classId = classDetails.id;
    const courseId = classDetails.course_id;
    const isPublicClass = this.classService.class.isPublic;
    const classPerference = classDetails.preference;
    const route0Applicable = classDetails.route0_applicable;
    const fwCode =
      classPerference && classPerference.framework
        ? classPerference.framework
        : null;
    const filters = {
      subject: classDetails.preference.subject,
      fw_code: fwCode,
    };
    return axios
      .all([
        this.taxonomyService.fetchGradesBySubject(filters),
        this.classService.fetchClassMembers(classId),
        this.getMilestone(
          classId,
          courseId,
          fwCode,
          false,
          hasPerformance,
          isForceReload
        ),
        this.getMilestone(
          classId,
          courseId,
          fwCode,
          true,
          hasPerformance,
          isForceReload
        ),
        route0Applicable ? this.route0Service.fetchRoute0Contents(classId,
          courseId, fwCode) : null,
        this.unit0Service.fetchUnit0Contents(classId, courseId, fwCode)
      ])
      .then(
        axios.spread((
          taxonomyGrades: Array<TaxonomyGrades>,
          gradeBounds: Array<ClassMembersGrade>,
          classMilestones: Array<MilestoneModel>,
          milestones: Array<MilestoneModel>,
          route0ContentResponse: Route0ContentModel,
          unit0ContentRespone: Array<Unit0Model>
        ) => {
          const route0Milestones = route0ContentResponse ? route0ContentResponse.route0Content.milestones : [];
          return this.parseMilestoneContent(
            classDetails,
            taxonomyGrades,
            gradeBounds,
            classMilestones,
            milestones,
            route0Milestones,
            isPublicClass,
            unit0ContentRespone
          );
        }));
  }

  /**
   * @function parseMilestoneContent
   * This method is used to parse the milestone content
   */
  public parseMilestoneContent(
    classDetails,
    taxonomyGrades,
    gradeBounds,
    classMilestones,
    milestones,
    route0Milestones,
    isPublicClass,
    unit0Milestone = []
  ) {
    const userId = this.session.userSession.user_id;
    const grades = taxonomyGrades.sort(
      (grade1, grade2) => grade1.sequenceId - grade2.sequenceId
    );
    const gradeBound: ClassMembersGrade = gradeBounds.find(
      (grade: ClassMembersGrade) => {
        return grade.userId === userId;
      }
    );
    const classGradeLowerBound = gradeBound.bounds.gradeLowerBound;
    const gradeUpperBound = gradeBound.bounds.gradeUpperBound;
    const startGrade = grades.find((grade) => {
      return grade.id === Number(classGradeLowerBound);
    });
    const startGradeIndex = grades.indexOf(startGrade);
    const endGrade = grades.find((grade) => {
      return grade.id === Number(gradeUpperBound);
    });
    const endGradeIndex = grades.indexOf(endGrade);
    const studentGrades = grades.slice(startGradeIndex, endGradeIndex + 1);
    const milestoneList = milestones.filter((milestone, milestoneIndex) => {
      const hasMilestoneContent = classMilestones.find(milestoneItem => milestoneItem.milestoneId === milestone.milestoneId);
      if (!hasMilestoneContent) {
        milestone.isRescoped = true;
        if (milestoneIndex) {
          const prevMilestone = milestones[milestoneIndex - 1];
          if (prevMilestone) {
            prevMilestone.nextMilestoneIsRescope = true;
          }
        }
      } else {
        milestone.competencyCount = hasMilestoneContent.competencyCount;
        milestone.computedEtlSecs = hasMilestoneContent.computedEtlSecs;
        milestone.isRescoped = false;
      }
      const gradeId = milestone.gradeId;
      const gradeModel = studentGrades.find((grade) => {
        return grade.id === gradeId;
      });
      if (gradeModel) {
        if (gradeId === classDetails.grade_current && !isPublicClass) {
          milestone.isClassGrade = true;
        }
        return milestone;
      }
    });
    const parsedMilestones = this.addAdditonalContentInMilestone(milestoneList, route0Milestones, unit0Milestone);
    return parsedMilestones;
  }

  /**
   * @function addAdditonalContentInMilestone
   * This method is used to add route0 and unit0 in milestone
   */
  public addAdditonalContentInMilestone(milestones, route0Milestones, unit0Milestone) {
    const milestoneList = [...unit0Milestone, ...route0Milestones, ...milestones];
    return milestoneList.map((milestone, index) => {
      milestone.sequenceId = index + 1;
      return milestone;
    });
  }


  /**
   * @function fetchLessonList
   * Method to used to fetch lesson list
   */
  public fetchLessonList(classId: string, milestoneId: string, courseId: string, fwCode: string) {
    return this.getMilestoneLesson(milestoneId, courseId).then((lessons: Array<LessonModel>) => {
      return this.getSkippedContents(classId, courseId).then((skippedContents: SkippedContents) => {
        const skippedLessons = skippedContents ? skippedContents.lessons : [];
        lessons.map((lesson) => {
          lesson.isRescoped = skippedLessons.includes(lesson.lessonId);
          return lesson;
        });
        const filtertedLessons = lessons;
        if (filtertedLessons.length) {
          this.fetchLessonsPerformance(classId, milestoneId, courseId, fwCode, filtertedLessons);
        }
        return filtertedLessons;
      });
    });
  }

  /**
   * @function fetchLessonsPerformance
   * This Method is used to fetch lessons performance
   */
  public fetchLessonsPerformance(classId: string, milestoneId: string, courseId: string, fwCode: string, filtertedLessons) {
    return axios
      .all([
        this.performanceProvider.fetchLessonPerformance(classId, courseId, milestoneId, fwCode, ASSESSMENT),
        this.performanceProvider.fetchLessonPerformance(classId, courseId, milestoneId, fwCode, COLLECTION)
      ])
      .then(
        axios.spread((
          lessonAssessmentPerformance,
          lessonCollectionPerformance
        ) => {
          this.normalizeLessonAssessmentPerformance(filtertedLessons, lessonAssessmentPerformance);
          this.normalizeLessonCollectionPerformance(filtertedLessons, lessonCollectionPerformance);
          return filtertedLessons;
        }));
  }


  /**
   * @function getMilestoneLesson
   * This Method is used to get the lesson list from store
   */
  public getMilestoneLesson(milestoneId, courseId) {
    return new Promise((resolve, reject) => {
      this.lessonStoreSubscription = this.store.select(getLessonByMilestoneId(milestoneId)).subscribe((lessonData) => {
        if (!lessonData) {
          return this.milestoneProvider.fetchLessonList(milestoneId, courseId).then((lessonResult) => {
            const lessons = removeDuplicateValues(lessonResult.lessons, 'lessonId');
            this.store.dispatch(setMilestoneLesson({ key: milestoneId, data: lessons }));
          });
        } else {
          resolve(cloneObject(lessonData));
        }
      });
    });
  }

  /**
   * @function normalizeLessonCollectionPerformance
   * This Method is used to set performance to lesson
   */
  private normalizeLessonCollectionPerformance(lessons, lessonPerformanceResponse) {
    return lessons.map((lesson) => {
      if (lessonPerformanceResponse.length) {
        const lessonPerformanceList = lessonPerformanceResponse[0].usageData;
        const lessonPerformance = lessonPerformanceList.find((item) => item.lessonId === lesson.lessonId);
        if (lessonPerformance && lesson.performance) {
          lesson.performance.timeSpent = lessonPerformance.timeSpent;
        } else {
          if (lessonPerformance) {
            lesson.performance = {
              timeSpent: lessonPerformance.timeSpent,
              totalCount: lessonPerformance.totalCount
            };
          }
        }
      }
      return lesson;
    });
  }

  /**
   * @function normalizeLessonAssessmentPerformance
   * This Method is used to set performance to lesson
   */
  private normalizeLessonAssessmentPerformance(lessons, lessonPerformanceResponse) {
    return lessons.map((lesson) => {
      if (lessonPerformanceResponse.length) {
        const lessonPerformanceList = lessonPerformanceResponse[0].usageData;
        const lessonPerformance = lessonPerformanceList.find((item) => item.lessonId === lesson.lessonId);
        lesson.performance = lessonPerformance;
      }
      return lesson;
    });
  }

  /**
   * @function getSkippedContents
   * This Method is used to get skipped contents
   */
  public getSkippedContents(classId, courseId) {
    return new Promise((resolve) => {
      this.skippedContentStoreSubscription = this.store.select(getSkippedContentsByClassId(classId)).subscribe((skippedContentData) => {
        if (!skippedContentData) {
          return this.milestoneProvider.fetchSkippedContents(classId, courseId).then((skippedContents) => {
            this.store.dispatch(setSkippedContent({ key: classId, data: skippedContents }));
          });
        } else {
          resolve(cloneObject(skippedContentData));
        }
      });
    });
  }

  /**
   * @function unSubscribeEvent
   * This Method is used to un subscribe the store event
   */
  public unSubscribeEvent() {
    if (this.milestoneStoreSubscription.length) {
      this.milestoneStoreSubscription.forEach((event) => {
        event.unsubscribe();
      });
    }
    if (this.skippedContentStoreSubscription) {
      this.skippedContentStoreSubscription.unsubscribe();
    }
    if (this.lessonStoreSubscription) {
      this.lessonStoreSubscription.unsubscribe();
    }
    if (this.milestonesRoutesStoreSubscription.length) {
      this.milestonesRoutesStoreSubscription.forEach((event) => {
        event.unsubscribe();
      });
    }
    if (this.learningContentStoreSubscriptions.length) {
      this.learningContentStoreSubscriptions.forEach((event) => {
        event.unsubscribe();
      });
    }
  }

  /**
   * @function fetchMilestoneAlternatePath
   * This Method is used to fetch milestone alternate path
   */
  public fetchMilestoneAlternatePath(milestoneId, classId, courseId, fwCode) {
    return this.milestoneProvider.fetchMilestoneAlternatePath(milestoneId, classId).then(async (alterPaths) => {
      return Promise.all((alterPaths || []).map(async (item) => {
        if (item.lessonSuggestions.length) {
          await this.fetchLessonsPerformance(classId, milestoneId, courseId, fwCode, item.lessonSuggestions);
        }
        return item;
      })).then(() => {
        return alterPaths;
      });
    });
  }

  /**
   * @function fetchSingleMilestoneAlternatePath
   * This Method is used to fetch single milestone alternate path
   */
   public fetchSingleMilestoneAlternatePath(milestoneId, classId) {
    return this.milestoneProvider.fetchMilestoneAlternatePath(milestoneId, classId).then(async (alterPaths) => {
      return alterPaths;
    });
  }

  /**
   * @function fetchMilestoneAlternatePath
   * This Method is used to fetch milestone alternate path
   */
   public fetchMilestoneDependentLesson(milestoneId, classId, courseId, fwCode) {
    return this.milestoneProvider.fethcMilestoneDependentLesson(milestoneId, classId).then(async (depdentLessons) => {
      await this.fetchLessonsPerformance(classId, milestoneId, courseId, fwCode, depdentLessons);
      return depdentLessons;
    });
  }
}
