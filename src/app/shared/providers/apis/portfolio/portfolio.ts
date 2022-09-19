import { Injectable } from '@angular/core';
import { ASSESSMENT, ASSESSMENT_EXTERNAL, COLLECTION, COLLECTION_EXTERNAL, DEFAULT_IMAGES, NO_PROFILE, OFFLINE_ACTIVITY } from '@shared/constants/helper-constants';
import { PortfolioAllActivityAttempt, PortfolioModel, PortfolioUniversalActivitiesModal } from '@shared/models/portfolio/portfolio';
import { HttpService } from '@shared/providers/apis/http';
import { TaxonomyProvider } from '@shared/providers/apis/taxonomy/taxonomy';
import { SessionService } from '@shared/providers/service/session/session.service';
import * as moment from 'moment';


@Injectable({
  providedIn: 'root'
})

export class PortfolioProvider {

  // -------------------------------------------------------------------------
  // Properties

  private namespace = 'api/ds/users/v2';
  private portfolioNamespace = 'api/ds/users/v2/content/portfolio';
  private universalPortfolioNamespace = 'api/nucleus/v2/profiles';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private taxonomyProvider: TaxonomyProvider, private httpService: HttpService, private sessionService: SessionService) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchCourseListByClassid
   * @returns {CourseModel}
   * This method is used to fetch the course list
   */
  public fetchUserPortfolioUniqueItems(requestParams, contentBase): Promise<Array<PortfolioModel>> {
    const endpoint = `${this.namespace}/${contentBase}/portfolio/items`;
    return this.httpService.get<Array<PortfolioModel>>(endpoint, requestParams).then((res) => {
      return this.serializePortfolioItems(res.data.items, requestParams.activityType);
    });
  }

  /**
   * @function fetchItemsExits
   * This method is used to fetch items exists
   */
  public fetchItemsExits(collectionIds) {
    const endpoint = `${this.portfolioNamespace}/items/exists`;
    const userId = this.sessionService.userSession.user_id;
    const params = {
      collectionIds,
      userId
    };
    return this.httpService.post(endpoint, params).then((res) => {
      return res.data.items;
    });
  }

  /**
   * @function serializePortfolioItem
   * Method to serialize individual portfolio activity
   */
  public serializePortfolioItem(content) {
    const serializer = this;
    const basePath = this.sessionService.userSession.cdn_urls.content_cdn_url;
    const contentType = content.type;
    let serializedPortfolioItem = {};
    if (content) {
      const thumbnailUrl = content.thumbnail ? basePath + content.thumbnail : null;
      let imageLoc = content.thumbnail || '';
      if (!content.thumbnail) {
        imageLoc = contentType.includes(ASSESSMENT)
          ? DEFAULT_IMAGES.ASSESSMENT
          : contentType === OFFLINE_ACTIVITY
            ? null
            : DEFAULT_IMAGES.COLLECTION;
      }
      serializedPortfolioItem = {
        activityTimestamp: content.activityTimestamp,
        contentSource: content.contentSource,
        efficacy: 0.5 || content.efficacy,
        engagement: 0.5 || content.engagement,
        gradingStatus: content.gradingStatus,
        gutCodes: content.gutCodes,
        id: content.id,
        learningObjective: content.learningObjective,
        lastSessionId: content.sessionId,
        masterySummary: content.masterySummary,
        maxScore: content.maxScore,
        owner: serializer.normalizeOwner(content.owner),
        questionCount: content.questionCount,
        resourceCount: content.resourceCount,
        relevance: 0.5 || content.relevance,
        score: content.score,
        status: content.status,
        subType: content.subType,
        taskCount: content.taskCount,
        taxonomy: this.taxonomyProvider
          .normalizeLearningMapsTaxonomyArray(content.taxonomy),
        thumbnailUrl: thumbnailUrl ? thumbnailUrl : imageLoc,
        timespent: content.timespent,
        title: content.title,
        type: contentType,
        isCollection: contentType === COLLECTION,
        isAssessment: contentType === ASSESSMENT,
        isExternalAssessment: contentType === ASSESSMENT_EXTERNAL,
        isExternalCollection: contentType === COLLECTION_EXTERNAL,
        isOfflineActivity: contentType === OFFLINE_ACTIVITY
      };
    }
    return serializedPortfolioItem;
  }

  /**
   * Normalize the Read Profile endpoint response
   * @returns {ProfileModel} a profile model object
   */
  public normalizeOwner(owner) {
    let ownerObject = {
      id: null,
      firstName: null,
      lastName: null,
      username: null,
      fullName: null,
      displayName: null,
      thumbnailUrl: null
    };
    if (owner) {
      const basePath = this.sessionService.userSession.cdn_urls.user_cdn_url;
      const thumbnailUrl = owner.thumbnail
        ? basePath + owner.thumbnail
        : null;

      ownerObject = {
        id: owner.id,
        firstName: owner.firstName,
        lastName: owner.lastName,
        username: owner.username,
        fullName: `${owner.lastName} ${owner.firstName}`,
        displayName: owner.displayName,
        thumbnailUrl
      };
    }
    return ownerObject;
  }

  /**
   * @function serializePortfolioItems
   * @param {String} contentType
   * Method to serialize portfolio activities
   */
  public serializePortfolioItems(portfolioItems, contentType) {
    const serializer = this;
    const serializedPortfolioItems = [];
    if (portfolioItems.usageData) {
      const learningActivities = portfolioItems.usageData;
      if (
        contentType === OFFLINE_ACTIVITY ||
        !learningActivities.length
      ) {
        const availableSubTypes = Object.keys(learningActivities);
        availableSubTypes.map(subType => {
          learningActivities[`${subType}`].map(learningActivity => {
            serializedPortfolioItems.push(
              serializer.serializePortfolioItem(learningActivity)
            );
          });
        });
      } else {
        learningActivities.map(learningActivity => {
          serializedPortfolioItems.push(
            serializer.serializePortfolioItem(learningActivity)
          );
        });
      }
    }
    return serializedPortfolioItems;
  }

  /**
   * @function fetchAllAttemptsByItem
   * This Method is used to get collection list
   */
  public fetchAllAttemptsByItem(contentId: string) {
    const userId = this.sessionService.userSession.user_id;
    const endpoint = `${this.portfolioNamespace}/item`;
    const paramsData = {
      userId,
      itemId: contentId
    };
    return this.httpService.get<PortfolioAllActivityAttempt>(endpoint, paramsData).then((response) => {
      const items = response.data.items;
      const portfolioItems: PortfolioAllActivityAttempt = {
        activityId: items.activityId,
        usageData: this.normalizeUsageData(items.usageData),
      };
      return portfolioItems;
    });
  }

  /**
   * Normalizes a usage data of portfolio activity attempt
   * @return {usageData}
   */
  private normalizeUsageData(payload) {
    return payload.map((item) => {
      const usageData = {
        classId: item.classId,
        contentSource: item.contentSource,
        courseId: item.courseId,
        createdAt: item.createdAt,
        createdDate: moment.utc(item.createdAt).local().format('DD MMM YYYY hh:mm A'),
        dcaContentId: item.dcaContentId,
        gradingStatus: item.gradingStatus,
        id: item.id,
        lessonId: item.lessonId,
        maxScore: item.maxScore,
        pathId: item.pathId,
        pathType: item.pathType,
        reaction: item.reaction,
        score: item.score,
        sessionId: item.sessionId,
        status: item.status,
        timespent: item.timespent,
        title: item.title,
        type: item.type,
        unitId: item.unitId,
        updatedAt: item.updatedAt ? moment.utc(item.updatedAt).local().format('DD-MMM-YYYY hh:mm A') : null
      };
      return usageData;
    });
  }

  /**
   * @function fetchUniversalUserPortfolioUniqueItems
   * This method is used to fetch the Universal portfolio items
   */
  public fetchUniversalUserPortfolioUniqueItems(userId) {
    const endpoint = `${this.universalPortfolioNamespace}/user/identities`;
    const params = {
      userId
    };
    return this.httpService.get<Array<PortfolioUniversalActivitiesModal>>(endpoint, params).then((res) => {
      return this.serializeUniversalPortfolioItems(res.data.users);
    });
  }

  /**
   * @function serializeUniversalPortfolioItems
   * Method to serialize universal portfolio activities
   */
  public serializeUniversalPortfolioItems(content) {
    const basePath = this.sessionService.userSession.cdn_urls.user_cdn_url;
    return  content.map((item) => {
      const serializedUniversalPortfolioItem: PortfolioUniversalActivitiesModal = {
        code: item.code,
        email: item.email,
        firstName: item.first_name,
        id: item.id,
        lastName: item.last_name,
        originatorEmail: item.originator_email,
        originatorFirstName: item.originator_first_name,
        originatorId: item.originator_id,
        originatorLastName: item.originator_last_name,
        originatorThumbnail: item.originator_thumbnail,
        originatorUsername: item.originator_username,
        status: item.status,
        tenantName: item.tenant_name,
        thumbnail: item.thumbnail ?  basePath + item.thumbnail : NO_PROFILE,
        username: item.username
      };
      return serializedUniversalPortfolioItem;
    });
  }
}
