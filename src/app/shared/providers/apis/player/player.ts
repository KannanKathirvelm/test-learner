import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import {
  CONTENT_TYPES,
  PLAYER_EVENT_TYPES,
  PLAYER_EVENTS,
  TEACHER_GRADING_QUESTIONS
} from '@shared/constants/helper-constants';
import { HttpService } from '@shared/providers/apis/http';
import { SessionService } from '@shared/providers/service/session/session.service';
import { generateUUID } from '@shared/utils/global';
import * as moment from 'moment-timezone';


@Injectable({
  providedIn: 'root'
})
export class PlayerProvider {

  // -------------------------------------------------------------------------
  // Properties
  private namespace = 'api/nucleus-insights/v2';

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(private httpService: HttpService, private sessionService: SessionService) { }

  get userSession() {
    return this.sessionService.userSession;
  }

  /**
   * @function collectionPlayEvent
   * Create start play event for collection
   */
  public collectionPlayEvent(collection, params, sessionId) {
    return new Promise((resolve, reject) => {
      const endpoint = `${this.namespace}/event`;
      const context = this.serializeCollectionStartContext(collection, params, sessionId);
      this.httpService.post(endpoint, context).then(() => {
        resolve(context[0]);
      }, reject);
    });
  }

  /**
   * @function collectionStopEvent
   * Create start stop event for collection
   */
  public collectionStopEvent(collectionEventContext) {
    return new Promise((resolve, reject) => {
      const endpoint = `${this.namespace}/event`;
      const eventData = collectionEventContext;
      eventData.context.type = PLAYER_EVENT_TYPES.STOP;
      eventData.endTime = moment().valueOf();
      this.httpService.post(endpoint, [eventData]).then(() => {
        resolve(null);
      }, reject);
    });
  }

  /**
   * @function reactionEvent
   * Create reaction event for resource
   */
  public reactionEvent(collection, params, resource, eventId, reaction) {
    const endpoint = `${this.namespace}/event`;
    const context = this.serializeReactionContext(collection, params, resource, eventId, reaction);
    this.httpService.post(endpoint, context);
  }

  /**
   * @function postSelfReport
   * This method is used to post self report
   */
  public postSelfReport(collection, context, score, timespent) {
    const endpoint = `${this.namespace}/self-report`;
    const contextData = this.serializeSelfReport(collection, context, score, timespent);
    return this.httpService.post(endpoint, contextData).then(() => {
      return contextData.session_id;
    });
  }

  /**
   * @function collectionResourcePlayEvent
   * Create start play event for resource
   */
  public collectionResourcePlayEvent(collection, params, resource, eventId) {
    return new Promise((resolve, reject) => {
      const endpoint = `${this.namespace}/event`;
      const context = this.serializeResourceStartContext(collection, params, resource, eventId);
      return this.httpService.post(endpoint, context).then(() => {
        resolve(context[0]);
      }, reject);
    });
  }

  /**
   * @function externalResourcePlayEvent
   * Create start play event for external resource
   */
  public externalResourcePlayEvent(collection, params, resource, eventId) {
    return new Promise((resolve, reject) => {
      const endpoint = `${this.namespace}/event/external?apiKey=${environment.EVENT_API_KEY}`;
      const context = this.serializeResourceStartContext(collection, params, resource, eventId);
      return this.httpService.post(endpoint, context).then(() => {
        resolve(context[0]);
      }, reject);
    });
  }

  /**
   * @function collectionResourcePlayEvent
   * Create stop play event for resource
   */
  public collectionResourceStopEvent(resourceEventContext, isSkipped?) {
    return new Promise((resolve, reject) => {
      const endpoint = `${this.namespace}/event`;
      const eventData = resourceEventContext;
      eventData.context.type = PLAYER_EVENT_TYPES.STOP;
      // if question is skipped we are not sending timespent
      if (!isSkipped) {
        eventData.endTime = moment().valueOf();
      }
      return this.httpService.post(endpoint, [eventData]).then(() => {
        resolve(null);
      }, reject);
    });
  }

  /**
   * @function externalResourceStopEvent
   * Create stop method for external resource
   */
  public externalResourceStopEvent(resourceEventContext, context) {
    return new Promise((resolve, reject) => {
      const endpoint = `${this.namespace}/event/external?apiKey=${environment.EVENT_API_KEY}`;
      const eventData = resourceEventContext;
      eventData.context.type = PLAYER_EVENT_TYPES.STOP;
      Object.assign(eventData, {
        metrics: {
          score: Number(context.score)
        },
        endTime: new Date().getTime()
      });
      return this.httpService.post(endpoint, [eventData]).then(() => {
        resolve(null);
      }, reject);
    });
  }

  /**
   * @function submitOfflineActivityTask
   * @param {JSON} requestPayload
   * Method to submit offline activity task
   */
  public submitOfflineActivityTask(requestPayload) {
    const endpoint = `${this.namespace}/oa/submissions`;
    return new Promise((resolve, reject) => {
      return this.httpService.post(endpoint, JSON.stringify(requestPayload)).then(() => {
        resolve(null);
      }, reject);
    });
  }

  /**
   * @function serializeCollectionStartContext
   * This method is used to serialize collection event context
   */
  public serializeCollectionStartContext(collection, params, sessionId) {
    const context = this.createCollectionContext(collection, params);
    const eventName = PLAYER_EVENTS.COLLECTION_PLAY;
    const event = this.createEventData(sessionId);
    return [{ ...event, context, eventName }];
  }

  /**
   * @function createEventData
   * This method is used to create event data
   */
  public createEventData(sessionId?, startTime?, endTime?, eventId?) {
    eventId = eventId ? eventId : generateUUID();
    const session = {
      apiKey: environment.EVENT_API_KEY,
      sessionId: sessionId ? sessionId : generateUUID(),
      sessionToken: this.userSession.access_token
    };
    const user = {
      gooruUId: this.userSession.user_id
    };
    const version = {
      logApi: 4.0
    };
    const timezone = moment.tz.guess();
    if (!startTime) {
      startTime = moment().valueOf();
    }
    if (!endTime) {
      endTime = moment().valueOf();
    }
    return {
      session,
      eventId,
      user,
      version,
      timezone,
      startTime,
      endTime
    };
  }

  /**
   * @function createCollectionContext
   * This method is used to create collection event context
   */
  public createCollectionContext(collection, params) {
    let additionalContext;
    if (params.caContentId) {
      additionalContext = this.getAdditionalContext(params.caContentId);
    }
    return {
      contentGooruId: collection.id,
      type: PLAYER_EVENT_TYPES.START,
      collectionType: params.collectionType,
      courseGooruId: params.courseId,
      classGooruId: params.classId,
      unitGooruId: params.unitId,
      lessonGooruId: params.lessonId,
      source: environment.API_END_POINT,
      appId: this.userSession.appId,
      partnerId: this.userSession.partnerId,
      tenantId: this.userSession.tenant.tenantId,
      pathId: params.pathId || 0,
      pathType: params.pathType || null,
      questionCount: this.getQuestionCount(collection),
      contentSource: params.source,
      contextPathId: params.ctxPathId || 0,
      contextPathType: params.ctxPathType || null,
      additionalContext,
      clientSource: 'mobile'
    };
  }

  /**
   * @function getQuestionCount
   * This method is used to get question count
   */
  public getQuestionCount(collection) {
    const questions = collection.content.filter((item) => item.contentFormat === CONTENT_TYPES.QUESTION);
    return questions.length;
  }

  /**
   * @function serializeResourceStartContext
   * This method is used to serialize resource event context
   */
  public serializeResourceStartContext(collection, params, resource, eventId) {
    const context = this.createResourceContext(collection, params, resource);
    const eventName = !!collection.learningToolId ? PLAYER_EVENTS.COLLECTION_PLAY : PLAYER_EVENTS.RESOURCE_PLAY;
    const event = this.createEventData(params.sessionId, params.startTime, params.endTime, eventId);
    const payLoadObject = this.createPayLoadObject(params.payLoadObject, resource);
    return [{ ...event, context, eventName, payLoadObject }];
  }

  /**
   * @function serializeReactionContext
   * This method is used to serialize resource reaction event context
   */
  public serializeReactionContext(collection, params, resource, eventId, reaction) {
    const context = this.createReationContext(collection, params, resource, eventId, reaction);
    const eventName = PLAYER_EVENTS.REACTION;
    const event = this.createEventData(params.sessionId, params.startTime, params.endTime);
    return [{ ...event, context, eventName }];
  }

  /**
   * @function createPayLoadObject
   * This method is used to create payLoad Object
   */
  public createPayLoadObject(payLoadObject, resource) {
    const questionType = payLoadObject && payLoadObject.questionType || null;
    const isOpendedQuestion = !!TEACHER_GRADING_QUESTIONS.includes(questionType);
    const gradingType = isOpendedQuestion ? 'teacher' : 'system';
    const isStudent = true;
    let answerScore;
    const evidence = resource.evidence;
    if (payLoadObject && payLoadObject.answerObject && payLoadObject.answerObject.length) {
      answerScore = this.getAnswerScore(resource, payLoadObject.answerObject);
      if (answerScore > 0) {
        payLoadObject.attemptStatus = 'correct';
      }
    }
    return { ...payLoadObject, gradingType, isStudent, answerScore, evidence };
  }

  /**
   * @function getAnswerScore
   * This method is used to get partial score if its enabled
   */
  public getAnswerScore(resource, answerPayLoad) {
    const metadata = resource.player_metadata;
    const correctAnswers = answerPayLoad.filter((answer) => answer.status === 'correct');
    if (metadata && metadata.isPartialEnable) {
      return (correctAnswers.length / answerPayLoad.length) * 100;
    }
    return correctAnswers.length ? 100 : 0;
  }

  /**
   * @function createResourceContext
   * This method is used to create resource event context
   */
  public createResourceContext(collection, params, resource) {
    let additionalContext;
    if (params.caContentId) {
      additionalContext = this.getAdditionalContext(params.caContentId);
    }
    return {
      contentGooruId: resource.id,
      parentGooruId: collection.id,
      parentEventId: params.parentEventId,
      type: PLAYER_EVENT_TYPES.START,
      collectionType: params.collectionType,
      resourceType: resource.contentFormat,
      clientSource: 'mobile',
      reactionType: 0,
      courseGooruId: params.courseId,
      source: environment.API_END_POINT,
      appId: this.userSession.appId,
      partnerId: this.userSession.partnerId,
      tenantId: this.userSession.tenant.tenantId,
      classGooruId: params.classId,
      unitGooruId: params.unitId,
      lessonGooruId: params.lessonId,
      contentSource: params.source,
      pathId: params.pathId || 0,
      pathType: params.pathType || null,
      contextPathId: params.ctxPathId || 0,
      contextPathType: params.ctxPathType || null,
      additionalContext,
      baseContentGooruId: resource.baseContentGooruId || null
    };
  }

  /**
   * @function createReationContext
   * This method is used to create resource reaction event context
   */
  public createReationContext(collection, params, resource, parentEventId, reaction = 0) {
    return {
      contentGooruId: resource.id,
      parentGooruId: collection.id,
      parentEventId,
      clientSource: 'mobile',
      reactionType: reaction.toString(),
      courseGooruId: params.courseId,
      source: environment.API_END_POINT,
      appId: this.userSession.appId,
      partnerId: this.userSession.partnerId,
      tenantId: this.userSession.tenant.tenantId,
      classGooruId: params.classId,
      unitGooruId: params.unitId,
      lessonGooruId: params.lessonId,
      contentSource: params.source,
      pathId: params.pathId ? Number(params.pathId) : 0,
      pathType: params.pathId ? params.pathType : null
    };
  }

  /**
   * @function serializeSelfReport
   * This method is used to serialize the data for self report
   */
  public serializeSelfReport(collection, context, score, timespent) {
    const sessionId = generateUUID();
    const timezone = moment.tz.guess();
    return {
      percent_score: score,
      score: null,
      max_score: null,
      user_id: this.userSession.user_id,
      class_id: context.classId,
      course_id: context.courseId,
      unit_id: context.unitId,
      lesson_id: context.lessonId,
      collection_type: collection.collectionType,
      external_collection_id: collection.id,
      collection_id: collection.id,
      session_id: sessionId,
      time_zone: timezone,
      partner_id: this.userSession.partnerId,
      tenant_id: this.userSession.tenant.tenantId,
      content_source: context.source,
      path_id: context.pathId,
      path_type: context.pathType,
      time_spent: timespent
    };
  }

  /**
   * @function getAdditionalContext
   * This method is used to get additional context
   */
  private getAdditionalContext(caContentId) {
    const dcaContentId = JSON.stringify({ dcaContentId: caContentId });
    return btoa(dcaContentId);
  }
}
