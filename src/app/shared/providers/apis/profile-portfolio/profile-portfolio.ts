import { Injectable } from '@angular/core';
import { ASSESSMENT, ASSESSMENT_EXTERNAL, COLLECTION, COLLECTION_EXTERNAL, DEFAULT_IMAGES, OFFLINE_ACTIVITY } from '@shared/constants/helper-constants';
import { PortfolioActivities } from '@shared/models/profile-portfolio/profile-portfolio';
import { HttpService } from '@shared/providers/apis/http';
import { SessionService } from '@shared/providers/service/session/session.service';

@Injectable({
  providedIn: 'root'
})
export class ProfilePortfolioProvider {

  // -------------------------------------------------------------------------
  // Properties
  private portfolioNamespace = 'api/ds/users/v2/content/portfolio';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private httpService: HttpService, private sessionService: SessionService) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchPortfolioActivities
   * This method is used to fetch the Portfolio Offline Activity
   */
  public fetchPortfolioActivities(params) {
    const endpoint = `${this.portfolioNamespace}/items`;
    return this.httpService.get<PortfolioActivities>(endpoint, params).then((response) => {
      return this.serializePortfolioItems(response.data.items, params.activityType);
    });
  }

  /**
   * @function serializePortfolioItems
   * @param {String} contentType
   * Method to serialize portfolio activities
   */
  public serializePortfolioItems(portfolioItems, contentType) {
    const serializer = this;
    const serializedPortfolioItems = [];
    const offlineActivity = [];
    let contentTypeName;
    if (portfolioItems.usageData) {
      const learningActivities = portfolioItems.usageData;
      if (
        contentType === OFFLINE_ACTIVITY ||
        !learningActivities.length
      ) {
        contentTypeName = 'OFFLINE-ACTIVITY';
        Object.keys(learningActivities).forEach(function(item) {
          const splitedValue = item.split('.');
          const textTitle = splitedValue[splitedValue.length - 1];
          const offlineData = serializer.serializeOfflineActivities(learningActivities[item]);
          const content = {
            title: textTitle,
            offlineData
          };
          offlineActivity.push(content);
        });
      } else {
        contentTypeName = contentType === ASSESSMENT ? 'ASSESSMENT' : 'COLLECTION';
        learningActivities.map(learningActivity => {
          serializedPortfolioItems.push(
            serializer.serializePortfolioItem(learningActivity)
          );
        });
      }
    }

    const serializedPortfolioItem = {
      content: contentType === OFFLINE_ACTIVITY ? offlineActivity : serializedPortfolioItems,
      contentType,
      contentTypeName,
      isCollection: contentType === COLLECTION,
      isAssessment: contentType === ASSESSMENT,
      isOfflineActivity: contentType === OFFLINE_ACTIVITY
    };
    return serializedPortfolioItem;
  }

  /**
   * @function serializeOfflineActivities
   * Method to serialize individual portfolio activity
   */
  public serializeOfflineActivities(learningActivities) {
    const serializedPortfolioItems = [];
    learningActivities.map(learningActivity => {
      serializedPortfolioItems.push(
        this.serializePortfolioItem(learningActivity)
      );
    });
    return serializedPortfolioItems;
  }

  /**
   * @function serializePortfolioItem
   * Method to serialize individual portfolio activity
   */
  public serializePortfolioItem(content) {
    const basePath = this.sessionService.userSession.cdn_urls.content_cdn_url;
    const contentType = content.type;
    let serializedPortfolioItem = {};
    if (content) {
      const thumbnailUrl = content.thumbnail ? basePath : null;
      let imageLocal = content.thumbnail || '';
      if (!content.thumbnail) {
        imageLocal = contentType.includes(ASSESSMENT)
          ? DEFAULT_IMAGES.ASSESSMENT
          : contentType === OFFLINE_ACTIVITY
            ? null
            : DEFAULT_IMAGES.COLLECTION;
      }
      serializedPortfolioItem = {
        id: content.id,
        type: content.type,
        subType: content.subType,
        title: content.title,
        learningObjective: content.learningObjective,
        thumbnail: thumbnailUrl + imageLocal,
        taxonomy: content.taxonomy,
        gutCodes: content.gutCodes,
        questionCount: content.questionCount,
        resourceCount: content.resourceCount,
        taskCount: content.taskCount,
        owner: content.owner,
        efficacy: content.efficacy,
        engagement: content.engagement,
        relevance: content.relevance,
        timespent: content.timespent,
        score: content.score,
        maxScore: content.maxScore,
        sessionId: content.sessionId,
        contentSource: content.contentSource,
        activityTimestamp: content.activityTimestamp,
        updatedAt: content.updatedAt,
        gradingStatus: content.gradingStatus,
        status: content.status,
        isCollection: contentType === COLLECTION,
        isAssessment: contentType === ASSESSMENT,
        isOfflineActivity: contentType === OFFLINE_ACTIVITY,
        isExternalAssessment: contentType === ASSESSMENT_EXTERNAL,
        isExternalCollection: contentType === COLLECTION_EXTERNAL
      };
    }
    return serializedPortfolioItem;
  }
}
