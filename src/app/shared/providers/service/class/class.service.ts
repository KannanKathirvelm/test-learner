import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Store } from '@ngrx/store';
import { ClassModel } from '@shared/models/class/class';
import { TaxonomySubjectModel } from '@shared/models/taxonomy/taxonomy';
import { TenantSettingsModel } from '@shared/models/tenant/tenant-settings';
import { ClassProvider } from '@shared/providers/apis/class/class';
import { CompetencyProvider } from '@shared/providers/apis/competency/competency';
import { CourseProvider } from '@shared/providers/apis/course/course';
import { PerformanceProvider } from '@shared/providers/apis/performance/performance';
import { LocationService } from '@shared/providers/service/location/location.service';
import { LookupService } from '@shared/providers/service/lookup/lookup.service';
import { SessionService } from '@shared/providers/service/session/session.service';
import { setClass } from '@shared/stores/actions/class.action';
import { getClass } from '@shared/stores/reducers/class.reducer';
import { cloneObject } from '@shared/utils/global';
import { BehaviorSubject } from 'rxjs';
import { AnonymousSubscription } from 'rxjs/Subscription';

@Injectable({
  providedIn: 'root'
})
export class ClassService {

  public classSubject: BehaviorSubject<ClassModel>;
  public classTaxonomySubject: BehaviorSubject<TaxonomySubjectModel>;
  public classStoreSubscriptions: Array<AnonymousSubscription>;
  public classListStoreSubscriptions: Array<AnonymousSubscription>;
  public readonly CLASS_JOINED_UPDATE = 'class_joined_update';
  private readonly ACTIVE_CLASS_ID = 'active_class_id';

  constructor(
    private locationService: LocationService,
    private storage: Storage,
    private store: Store,
    private session: SessionService,
    private classProvider: ClassProvider,
    private courseProvider: CourseProvider,
    private competencyProvider: CompetencyProvider,
    private performanceProvider: PerformanceProvider,
    private lookupService: LookupService
  ) {
    this.classSubject = new BehaviorSubject<ClassModel>(null);
    this.classTaxonomySubject = new BehaviorSubject<TaxonomySubjectModel>(null);
    this.classStoreSubscriptions = [];
    this.classListStoreSubscriptions = [];
  }

  /**
   * @function fetchClassList
   * Method to fetch classes
   */
  public fetchClassList(): Promise<Array<ClassModel>> {
    return new Promise((resolve, reject) => {
      this.classProvider.fetchClassList().then((classList) => {
        this.lookupService.fetchTenantSettings().then((tenantSettings: TenantSettingsModel) => {
          let activeClasses = this.getActiveClasses(classList) || [];
          // Note: Refer Ticket NILEMOBILE-310
          // if ((tenantSettings && tenantSettings.filterNonPremiumCourse !== SETTINGS.ON)) {
          //   activeClasses = this.getPremiumClasses(activeClasses);
          // }
          const members = classList.member;
          activeClasses = this.orderByMemberId(activeClasses, members);
          activeClasses = this.addTeacherToClass(activeClasses, classList.teacherDetails);
          const courseIds = this.courseProvider.getListOfCourseIds(activeClasses);
          if (courseIds && courseIds.length) {
            this.courseProvider.fetchCourseList(courseIds).then((courses) => {
              activeClasses.map((activeClass) => {
                const course = courses.find((courseItem) => {
                  return courseItem.id === activeClass.course_id;
                });
                return activeClass.course = course;
              });
              const classCourseIds = this.courseProvider.getListOfCourseIds(activeClasses, true);
              const classIds = this.getListOfClassIds(activeClasses);
              const premiumClasses = this.getPremiumClasses(activeClasses);
              const permiumClassSubjectIds = this.getListOfClassSubCodeIds(premiumClasses);
              const classCourseIdsFwCode = this.getListOfClassCourseIdsFwCode(activeClasses);
              const userId = this.session.userSession.user_id;
              if (classCourseIds.length) {
                this.performanceProvider.fetchClassPerformance(classCourseIds).then(performanceSummary => {
                  const performanceKey = 'performanceSummary';
                  this.setPerformanceSummary(activeClasses, performanceSummary, performanceKey);
                  this.updateClassToStore(activeClasses);
                });
              }
              if (classIds.length) {
                this.performanceProvider.fetchCAPerformance(classIds).then(performanceSummaryForDCA => {
                  const performanceKey = 'performanceSummaryForDCA';
                  this.setPerformanceSummary(activeClasses, performanceSummaryForDCA, performanceKey);
                  this.updateClassToStore(activeClasses);
                });
              }
              if (permiumClassSubjectIds.length) {
                this.competencyProvider.fetchCompetencyCompletionStats(permiumClassSubjectIds).then((competencyCompletionStats) => {
                  const performanceKey = 'competencyStats';
                  this.setPerformanceSummary(activeClasses, competencyCompletionStats, performanceKey);
                  this.updateClassToStore(activeClasses);
                });
              }
              if (classCourseIdsFwCode.length) {
                this.performanceProvider.fetchUserCurrentLocationByClassIds(classCourseIdsFwCode, userId).then(currentLocation => {
                  const performanceKey = 'currentLocation';
                  this.setPerformanceSummary(activeClasses, currentLocation, performanceKey);
                  this.updateClassToStore(activeClasses);
                });
              }
              resolve(activeClasses);
            }, reject);
          } else {
            resolve(activeClasses);
          }
        }, reject);
      }, reject);
    });
  }

  /**
   * @function fetchClassLessonTimespentPerformance
   * Method is used to fetch the class lesson timespent performance
   */
  public fetchClassLessonTimespentPerformance(activeClasses, classIdList, featuredCourseList = []) {
    return new Promise((resolve) => {
      if (classIdList && classIdList.length) {
        const userId = this.session.userSession.user_id;
        let timeSpentValues = [];
        this.performanceProvider.fetctClassTimespent(classIdList, userId).then((timeSpent) => {
          if (timeSpent.length) {
            timeSpentValues = timeSpent;
            featuredCourseList.forEach((data) => {
              const timespentdata = timeSpentValues.filter((timespentItem) => timespentItem.id === data.id);
              data.timeSpentValues = timespentdata[0];
            });
          }
          const timeSpentKey = 'classTimeSpent';
          this.setPerformanceSummary(activeClasses, timeSpent, timeSpentKey);
          this.updateClassToStore(activeClasses);
          let courseCompletion = [];
          if (featuredCourseList) {
            featuredCourseList.forEach((data) => {
              const classInfo = activeClasses.find(item => item.course_id === data.id);
              if (classInfo) {
                data.competencyStats = classInfo.competencyStats;
              }
            });
          }
          this.performanceProvider.fetctClassLessonStats(classIdList, userId).then(lessonStat => {
            if (lessonStat.length) {
              courseCompletion = lessonStat;
              featuredCourseList.forEach((data) => {
                const percentagedata = courseCompletion.filter((courseCompletionData) => courseCompletionData.classId === data.id);
                data.courseCompletion = percentagedata[0];
              });
            }
            const lessonStatsKey = 'classLessonStats';
            this.setPerformanceSummary(activeClasses, lessonStat, lessonStatsKey);
            this.updateClassToStore(activeClasses);
          });
        });
      }
      resolve(activeClasses);
    });
  }

  /**
   * @function fetchClassPerformance
   * Method is used to fetch the class performance
   */
  public fetchClassPerformance(activeClasses) {
    return new Promise((resolve) => {
      const nonPremiumClassCourseIds = this.courseProvider.getListOfCourseIds(activeClasses, true);
      const nonPremiumClassIds = this.getListOfClassIds(activeClasses);
      const classIdList = this.getListOfClassIds(activeClasses);
      const premiumClasses = this.getPremiumClasses(activeClasses);
      const permiumClassSubjectIds = this.getListOfClassSubCodeIds(premiumClasses);
      const classCourseIdsFwCode = this.getListOfClassCourseIdsFwCode(activeClasses);
      const userId = this.session.userSession.user_id;
      if (nonPremiumClassCourseIds.length) {
        this.performanceProvider.fetchClassPerformance(nonPremiumClassCourseIds).then(performanceSummary => {
          const performanceKey = 'performanceSummary';
          this.setPerformanceSummary(activeClasses, performanceSummary, performanceKey);
        });
      }
      if (nonPremiumClassIds.length) {
        this.performanceProvider.fetchCAPerformance(nonPremiumClassIds).then(performanceSummaryForDCA => {
          const performanceKey = 'performanceSummaryForDCA';
          this.setPerformanceSummary(activeClasses, performanceSummaryForDCA, performanceKey);
        });
      }
      if (permiumClassSubjectIds.length) {
        this.competencyProvider.fetchCompetencyCompletionStats(permiumClassSubjectIds).then((competencyCompletionStats) => {
          const performanceKey = 'competencyStats';
          this.setPerformanceSummary(activeClasses, competencyCompletionStats, performanceKey);
        });
      }
      if (classCourseIdsFwCode.length) {
        this.performanceProvider.fetchUserCurrentLocationByClassIds(classCourseIdsFwCode, userId).then(currentLocation => {
          const performanceKey = 'currentLocation';
          this.setPerformanceSummary(activeClasses, currentLocation, performanceKey);
        });
      }
      if (classIdList.length) {
        this.performanceProvider.fetctClassTimespent(classIdList, userId).then(timeSpent => {
          const timeSpentKey = 'classTimeSpent';
          this.setPerformanceSummary(activeClasses, timeSpent, timeSpentKey);
          this.updateClassToStore(activeClasses);
        });
        this.performanceProvider.fetctClassLessonStats(classIdList, userId).then(lessonStat => {
          const lessonStatsKey = 'classLessonStats';
          this.setPerformanceSummary(activeClasses, lessonStat, lessonStatsKey);
          this.updateClassToStore(activeClasses);
        });
      }
      resolve(activeClasses);
    });
  }

  /**
   * @function setActiveClass
   * This Method is used to set the active class
   */
  public setActiveClass(id) {
    this.storage.set(this.ACTIVE_CLASS_ID, id);
  }

  /**
   * @function getActiveClass
   * This Method is used to get the active class from the ionic storage
   */
  public getActiveClass() {
    return this.storage.get(this.ACTIVE_CLASS_ID).then((classId) => {
      return classId;
    });
  }

  /**
   * @function updateClassToStore
   * Method is used to store values
   */
  public updateClassToStore(classes) {
    this.store.dispatch(setClass({ data: cloneObject(classes) }));
  }

  /**
   * @function getClassList
   * Method is used to get class list
   */
  public getClassList() {
    return new Promise((resolve, reject) => {
      const classListStoreSubscription = this.store.select(getClass())
        .subscribe((classList) => {
          resolve(cloneObject(classList.data));
        }, (error) => {
          reject(error);
        });
      this.classListStoreSubscriptions.push(classListStoreSubscription);
    });
  }

  /**
   * @function addTeacherToClass
   * Method is used to add teacher details to class
   */
  public addTeacherToClass(classes, teacherDetails) {
    return classes.map((classItem) => {
      classItem.teacher = teacherDetails.find((teacher) => {
        return teacher.id === classItem.creator_id;
      });
      return classItem;
    });
  }

  /**
   * @function fetchClassById
   * Method is used to fetch class by id
   */
  public fetchClassById(classId) {
    return this.classProvider.fetchClassById(classId).then(async (classDetails) => {
      const classPerference = classDetails.preference;
      const fwCode = classPerference && classPerference.framework ? classPerference.framework : null;
      if (fwCode) {
        const courseId = classDetails.course_id;
        const location = await this.locationService.fetchCurrentLocation(classId, courseId, fwCode);
        classDetails.currentLocation = location;
        return classDetails;
      }
      return classDetails;
    });
  }

  /**
   * @function orderByMemberId
   * Method is used to order by member id
   */
  public orderByMemberId(classes, memberIds) {
    return classes.sort((class1, class2) => {
      return memberIds.indexOf(class1.id) - memberIds.indexOf(class2.id) ;
    });
  }

  /**
   * @function fetchClassMembers
   * Method is used to fetch class members
   */
  public fetchClassMembers(classId) {
    return this.classProvider.fetchClassMembers(classId);
  }

  /**
   * @function unSubscribeEvent
   * This Method is used to un subscribe the store event
   */
  public unSubscribeEvent() {
    if (this.classStoreSubscriptions.length) {
      this.classStoreSubscriptions.forEach((classStoreSubscription) => {
        classStoreSubscription.unsubscribe();
      });
    }
    if (this.classListStoreSubscriptions.length) {
      this.classListStoreSubscriptions.forEach((classListStoreSubscription) => {
        classListStoreSubscription.unsubscribe();
      });
    }
  }

  /**
   * @function getListOfClassIds
   * Method to fetch class ids from the list of classes
   */
  public getListOfClassIds(activeClasses) {
    return activeClasses.map((activeClass) => {
      return activeClass.id;
    });
  }

  /**
   * @function getListOfClassSubCodeIds
   * Method to fetch class ids and subject code from the list of classes
   */
  public getListOfClassSubCodeIds(activeClasses) {
    const classesHasSubject = this.filterSubjectClasses(activeClasses);
    return classesHasSubject.map((activeClass) => {
      const subjectCode = activeClass.preference ? activeClass.preference.subject : null;
      const classSubjectIds = { classId: activeClass.id, subjectCode };
      return classSubjectIds;
    });
  }

  /**
   * @function filterSubjectClasses
   * Method is used to filter subject classes
   */
  public filterSubjectClasses(activeClasses) {
    return activeClasses.filter((subjectClass) => {
      return subjectClass.preference && subjectClass.preference.subject !== null && subjectClass.preference.subject !== '';
    });
  }

  /**
   * @function setClass
   * Method is used to set the class
   */
  public setClass(classData) {
    this.setActiveClass(classData.id);
    this.classSubject.next(classData);
  }

  /**
   * @function setClassTaxonomy
   * Method is set the class taxonomy
   */
  public setClassTaxonomy(classTaxonomy) {
    this.classTaxonomySubject.next(classTaxonomy);
  }

  get class(): ClassModel {
    return this.classSubject ? this.classSubject.value : null;
  }

  get classTaxonomy(): TaxonomySubjectModel {
    return this.classTaxonomySubject ? this.classTaxonomySubject.value : null;
  }

  /**
   * @function fetchSkylineInitialState
   * Method is used to fetch state
   */
  public fetchSkylineInitialState(classId: string) {
    return this.classProvider.fetchSkylineInitialState(classId);
  }

  /**
   * @function getListOfClassCourseIdsFwCode
   * Method to fetch class, course ids and fwCode from the list of classes
   */
  private getListOfClassCourseIdsFwCode(activeClasses) {
    const listOfActiveClassCourseIdsFwCode = [];
    activeClasses.forEach(activeClass => {
      if (activeClass.course_id) {
        const classCourseId = {
          classId: activeClass.id,
          courseId: activeClass.course_id,
          fwCode: null,
        };
        if (
          activeClass.milestone_view_applicable &&
          activeClass.milestone_view_applicable === true &&
          activeClass.preference &&
          activeClass.preference.framework
        ) {
          classCourseId.fwCode = activeClass.preference.framework;
        }
        listOfActiveClassCourseIdsFwCode.push(classCourseId);
      }
    });
    return listOfActiveClassCourseIdsFwCode;
  }

  /**
   * @function setPerformanceSummary
   * Method to used to set performance summary for given classes
   */
  private setPerformanceSummary(activeClasses, performanceSummaryList, performanceKey) {
    activeClasses.map(activeClass => {
      const performance = performanceSummaryList.find((performanceSummary) => {
        return performanceSummary.classId === activeClass.id;
      });
      activeClass[performanceKey] = performance ? performance : null;
      activeClass['isLoaded' + performanceKey] = true;
      return activeClass;
    });
  }

  /**
   * @function getPremiumClasses
   * Method to get premium class
   */
  private getPremiumClasses(classes) {
    return classes.filter(classData => {
      return classData.isPremiumClass || classData.isPublic;
    });
  }

  /**
   * Retrieve the student active and premium classes
   */
  private getActiveClasses(classList) {
    const classes = classList.classes;
    if (classes && !classes.length) {
      return [];
    }
    return classes.filter((aClass) => {
      return !aClass.is_archived && classList.member.includes(aClass.id);
    });
  }

  /**
   * @function isMilestoneViewEnabled
   * This method used to get is milestone view enabled
   */
  public async isMilestoneViewEnabled(preference, setting) {
    const tenantSetting = await this.lookupService.getTenantSettings();
    const subject =
      preference && preference.framework && preference.subject
        ? `${preference.framework}.${preference.subject}`
        : null;
    const isMilestoneViewEnabledForTenant =
      setting && setting.enable_milestone_view !== undefined
        ? setting.enable_milestone_view
        : !(
          tenantSetting &&
          tenantSetting['enableMilestoneViewAtFwLevel'] &&
          tenantSetting['enableMilestoneViewAtFwLevel'][subject] ===
          false
        );
    return isMilestoneViewEnabledForTenant;
  }
}
