import { Injectable } from '@angular/core';
import { Dialogs } from '@ionic-native/dialogs/ngx';
import {
  InAppBrowser,
  InAppBrowserOptions,
} from '@ionic-native/in-app-browser/ngx';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { TranslateService } from '@ngx-translate/core';
import {
  ATTEMP_STATUS,
  PLAYER_TOOLBAR_OPTIONS,
  QUESTION_TYPES,
  TEACHER_GRADING_QUESTIONS,
  VIDEO_RESOURCE_TYPES
} from '@shared/constants/helper-constants';
import { CollectionEventModel } from '@shared/models/player/player';
import { PlayerProvider } from '@shared/providers/apis/player/player';
import { UtilsService } from '@shared/providers/service/utils/utils.service';
import { checkHttpUrl, checkUrlisPDF } from '@shared/utils/global';
import Player from '@vimeo/player';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CollectionPlayerService {
  // -------------------------------------------------------------------------
  // Properties
  private collectionEventSubject: BehaviorSubject<CollectionEventModel>;
  private resourceEventSubject: BehaviorSubject<any>;
  private questionStartTime: number;
  private questionEndTime: number;
  private readonly YOUTUBEPATTERN = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
  private readonly VIMEOPATTERN = /vimeo.*\/(\d+)/;
  public player: Player;
  private readonly ALLOWED_STRUGGLES_QUESTION_TYPES = ['multiple_choice_question'];
  public readonly PLAYED_COLLECTION = 'played_collection';
  private currentQuestionEventId: string;
  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private spinnerDialog: SpinnerDialog,
    private dialogs: Dialogs,
    private inAppBrowser: InAppBrowser,
    private playerProvider: PlayerProvider,
    private translate: TranslateService,
    private utilsService: UtilsService
  ) {
    this.collectionEventSubject = new BehaviorSubject<CollectionEventModel>(
      null
    );
    this.resourceEventSubject = new BehaviorSubject<any>(null);
  }

  get collectionEventContext() {
    return this.collectionEventSubject
      ? this.collectionEventSubject.value
      : null;
  }

  get resourceEventContext() {
    return this.resourceEventSubject
      ? this.resourceEventSubject.value
      : null;
  }

  get resourceTime() {
    return this.questionEndTime - this.questionStartTime;
  }

  /**
   * @function onCollectionPlay
   * This method is used to start play event for collection
   */
  public onCollectionPlay(collection, params, sessionId?) {
    this.playerProvider
      .collectionPlayEvent(collection, params, sessionId)
      .then((collectionEventContext: CollectionEventModel) => {
        this.collectionEventSubject.next(collectionEventContext);
      });
  }

  /**
   * @function getInlineVideoResourceType
   * This method is used to check the inline videos
   */
  public getInlineVideoResourceType(url) {
    if (this.YOUTUBEPATTERN.test(url)) {
      return VIDEO_RESOURCE_TYPES.YOUTUBE;
    }
    if (this.VIMEOPATTERN.test(url)) {
      return VIDEO_RESOURCE_TYPES.VIMEO;
    }
    return null;
  }

  /**
   * @function getYoutubePlayer
   * This method is used to get the youTube play instance
   */
  public getYoutubePlayer() {
    if (!this.player) {
      this.player = new Promise((resolve) => {
        (window as any).onYouTubeIframeAPIReady = () =>
          resolve((window as any).YT);
      });
      return this.player;
    }
    return this.player;
  }

  /**
   * @function getYoutubeVideoId
   * This method is used to get the youtube video id
   */
  public getYoutubeVideoId(url) {
    const urls = url.match(this.YOUTUBEPATTERN);
    return urls[1];
  }

  /**
   * @function getVimeoVideoId
   * This method is used to get the vimeo video id
   */
  public getVimeoVideoId(url) {
    const parseUrl = this.VIMEOPATTERN.exec(url);
    return parseUrl[1];
  }

  /**
   * @function onCollectionStop
   * This method is used to stop play event for collection
   */
  public onCollectionStop() {
    return new Promise((resolve, reject) => {
      this.playerProvider
        .collectionStopEvent(this.collectionEventContext)
        .then(() => {
          const sessionId = this.collectionEventContext.session
            .sessionId;
          this.collectionEventSubject.next(null);
          this.resetQuestionTimer();
          resolve(sessionId);
        }, reject);
    });
  }

  /**
   * @function openResourceContent
   * This method is used to open the resource content
   */
  public openResourceContent(resource, isPreview, loadAgain = false) {
    if (!loadAgain) {
      this.spinnerDialog.show();
    }
    let url = resource.url;
    let isContentLoadStart = false;
    const isPdfResource = checkUrlisPDF(url);
    const isH5PContent = this.utilsService.isH5PContent(resource.contentSubformat);
    if (isPdfResource && this.utilsService.isAndroid()) {
      url = `https://docs.google.com/viewer?url=${url}&embedded=true`;
    }
    const options = this.getInAppBrowserOptions();
    if (isH5PContent) {
      options.zoom = 'no';
    }
    if (loadAgain) {
      options.hidden = 'yes';
    }
    const browser = this.inAppBrowser.create(
      url,
      '_blank',
      options
    );
    const alertMessage = this.translate.instant(
      'IN_APP_BROWSER_ALERT_MSG'
    );
    browser.on('loadstart').subscribe(() => {
      isContentLoadStart = true;
    });
    browser.on('loadstop').subscribe(() => {
      if (isH5PContent) {
        this.utilsService.lockOrientationInLandscape();
      }
      if (isContentLoadStart) {
        this.spinnerDialog.hide();
        if (loadAgain) {
          browser.show();
        }
      } else {
        this.openResourceContent(resource, isPreview, true);
      }
    });
    browser.on('loaderror').subscribe(() => {
      this.spinnerDialog.hide();
      this.dialogs.alert(alertMessage).then(() => {
        browser.hide();
        if (!isPreview) {
          this.stopResourcePlayEvent();
        }
        if (isH5PContent) {
          this.utilsService.lockOrientationInLandscape();
        }
      });
    });
    browser.on('exit').subscribe(() => {
      this.spinnerDialog.hide();
      if (!isPreview) {
        this.stopResourcePlayEvent();
      }
      if (isH5PContent) {
        this.utilsService.lockOrientationInPortrait();
      }
    });
  }


  /**
   * @function playResourceContent
   * This method is used to start play event for resource
   */
  public playResourceContent(collection, params, resource, eventId) {
    this.startResourcePlayEvent(collection, params, resource, eventId);
    this.openResourceContent(resource, false);
  }

  /**
   * @function playExternalResourceContentForLu
   * This method is used to start play event for LU
   */
  public playExternalResourceContentForLu(collection, params, resource, eventId) {
    this.startExternalResourcePlayEvent(collection, params, resource, eventId);
  }

  /**
   * @function playRelatedResourceContent
   * This method is used to play related resource
   */
  public playRelatedResourceContent(resource) {
    this.openResourceContent(resource, true);
  }

  /**
   * @function getInAppBrowserOptions
   * This method is used to get the in app browser options
   */
  public getInAppBrowserOptions() {
    const options: InAppBrowserOptions = {
      location: 'yes',
      hidden: 'no',
      zoom: 'yes',
      hideurlbar: 'yes',
      toolbarcolor: PLAYER_TOOLBAR_OPTIONS.BACKGROUND_COLOR,
      navigationbuttoncolor: PLAYER_TOOLBAR_OPTIONS.FONT_COLOR,
      closebuttoncolor: PLAYER_TOOLBAR_OPTIONS.FONT_COLOR,
    };
    return options;
  }

  /**
   * @function stopResourcePlayEvent
   * This method is used to get play event for resource
   */
  public stopResourcePlayEvent() {
    this.playerProvider
      .collectionResourceStopEvent(this.resourceEventContext)
      .then(() => {
        this.questionEndTime = moment().valueOf();
        this.resourceEventSubject.next(null);
      });
  }

  /**
   * @function stopExternalResourcePlayEvent
   * This method is used to stop play event for  external resource
   */
  public stopExternalResourcePlayEvent(context) {
    return this.playerProvider
      .externalResourceStopEvent(this.resourceEventContext, context)
      .then(() => {
        this.resourceEventSubject.next(null);
      });
  }

  /**
   * @function stopResourcePlayEvent
   * This method is used to get play event for resource
   */
  public reactionCreateEvent(
    collection,
    params,
    resource,
    eventId,
    reaction
  ) {
    this.playerProvider.reactionEvent(
      collection,
      params,
      resource,
      eventId,
      reaction
    );
  }

  /**
   * @function startResourcePlayEvent
   * This method is used to get play event for resource
   */
  public startResourcePlayEvent(collection, params, resource, eventId) {
    params.sessionId = this.collectionEventContext.session.sessionId;
    params.parentEventId = this.collectionEventContext.eventId;
    params.startTime = moment().valueOf();
    this.playerProvider
      .collectionResourcePlayEvent(collection, params, resource, eventId)
      .then((resourceEventContext) => {
        this.resourceEventSubject.next(resourceEventContext);
      });
  }

  /**
   * @function startExternalResourcePlayEvent
   * This method is used to get play event for external resource
   */
  public startExternalResourcePlayEvent(collection, params, resource, eventId) {
    params.sessionId = eventId;
    params.parentEventId = eventId;
    params.startTime = moment().valueOf();
    this.playerProvider
      .externalResourcePlayEvent(collection, params, resource, eventId)
      .then((resourceEventContext) => {
        this.resourceEventSubject.next(resourceEventContext);
      });
  }

  /**
   * @function playQuestionResourceContent
   * This method is used to start play event for question
   */
  public playQuestionResourceContent(eventId, isFirstQuestion) {
    const collectionEndTime = isFirstQuestion ? this.collectionEventContext && this.collectionEventContext.startTime :  moment().valueOf();
    this.currentQuestionEventId = eventId;
    this.questionStartTime = this.questionEndTime || collectionEndTime;
  }

  /**
   * @function postSelfReport
   * This method is used to post self report for external collections/assessments
   */
  public postSelfReport(collection, context, score, timespent) {
    return this.playerProvider.postSelfReport(
      collection,
      context,
      score,
      timespent
    );
  }

  /**
   * @function stopQuestionResourceContent
   * This method is used to stop play event for question
   */
  public stopQuestionResourceContent(
    collection,
    params,
    resource,
    selectedAnswers,
    isSkipped?,
  ) {
    return new Promise((resolve, reject) => {
      const questionType = QUESTION_TYPES[resource.contentSubformat];
      this.questionEndTime = moment().valueOf();
      params.sessionId = this.collectionEventContext.session.sessionId;
      params.parentEventId = this.collectionEventContext.eventId;
      const startTime = isSkipped ? 0 : this.questionStartTime; // if question is skipped start time will be 0
      params.startTime = startTime; // on question start event start and end time will be same
      params.endTime = this.questionEndTime;
      params.payLoadObject = { questionType };
      this.playerProvider
        .collectionResourcePlayEvent(
          collection,
          params,
          resource,
          this.currentQuestionEventId
        )
        .then((resourceEventContext) => {
          this.resourceEventSubject.next(resourceEventContext);
          const answerPayLoad = this.createAnswerPayLoadObject(
            questionType,
            selectedAnswers,
            isSkipped
          );
          const payLoadObject = this.playerProvider.createPayLoadObject(
            answerPayLoad,
            resource
          );
          this.resourceEventContext.payLoadObject = payLoadObject;
          this.playerProvider
            .collectionResourceStopEvent(
              this.resourceEventContext,
              isSkipped
            )
            .then(() => {
              this.resourceEventSubject.next(null);
              resolve(null);
            }, reject);
        }, reject);
    });
  }

  /**
   * @function createAnswerPayLoadObject
   * This method is used to create answer payload object
   */
  public createAnswerPayLoadObject(
    questionType,
    selectedAnswers,
    isSkipped
  ) {
    const isOpendedQuestion = !!TEACHER_GRADING_QUESTIONS.includes(questionType);
    const answerObject = selectedAnswers.map((answer, index) => {
      const status = answer.is_correct
        ? ATTEMP_STATUS.CORRECT
        : ATTEMP_STATUS.INCORRECT;
      const answerId =
        questionType !== QUESTION_TYPES.multiple_answer_question
          ? index.toString()
          : `answer_${index + 1}`;
      return {
        text: answer.answer_text,
        order: answer.sequence,
        answerId,
        timeStamp: this.resourceTime,
        status: !isOpendedQuestion ? status : undefined, // No need to pass status for OE question
        skip: false,
      };
    });
    let attemptStatus = ATTEMP_STATUS.CORRECT;
    if (isSkipped) {
      attemptStatus = ATTEMP_STATUS.SKIPPED;
    } else if (isOpendedQuestion) {
      attemptStatus = ATTEMP_STATUS.ATTEMPTED;
    } else {
      const inCorrectAnswer = answerObject.find((answer) => {
        return answer.status === ATTEMP_STATUS.INCORRECT;
      });
      if ((answerObject && answerObject.length === 0) || inCorrectAnswer) {
        attemptStatus = ATTEMP_STATUS.INCORRECT;
      }
    }
    return { attemptStatus, questionType, answerObject };
  }

  /**
   * @function getResourceStrugglesContext
   * This method is used to get struggles context
   */
  public getResourceStrugglesContext(assessment, selectedQuestionAnswers) {
    if (assessment.content && selectedQuestionAnswers) {
      return assessment.content.map((question) => {
        if (this.ALLOWED_STRUGGLES_QUESTION_TYPES.includes(question.contentSubformat)) {
          const userSelectedQuestionAnswer = selectedQuestionAnswers.find((questionAnswer) => {
            return questionAnswer.questionId === question.id;
          });
          if (userSelectedQuestionAnswer) {
            const questionType = QUESTION_TYPES[question.contentSubformat];
            let answerPayload = userSelectedQuestionAnswer;
            if (!answerPayload.alreadyPlayedQuestions) {
              answerPayload = this.createAnswerPayLoadObject(questionType, userSelectedQuestionAnswer.selectedAnswers, false);
            }
            const answers = answerPayload.alreadyPlayedQuestions ? answerPayload.alreadyPlayedQuestions : answerPayload;
            const answer = question.answer.map((payload) => {
              const userSelected = answers.answerObject.find((userAnswer) => {
                return payload.sequence === userAnswer.order;
              });
              return {
                is_correct: payload.is_correct,
                struggles: payload.struggles ? payload.struggles : [],
                user_selected: userSelected ? 1 : 0
              };
            });
            return {
              resource_id: question.id,
              resource_type: userSelectedQuestionAnswer.contentFormat,
              status: answers.attemptStatus,
              answer
            };
          } else {
            return {};
          }
        } else {
          return {};
        }
      });
    }
    return [];
  }

  /**
   * @function checkUserAnswers
   * This method is used to integrate user answer status
   */
  public checkUserAnswers(answers, userAnswers, showCorrectAnswer?) {
    if (!answers) {
      return [];
    }
    return answers.map((answer, index) => {
      const performance =
        userAnswers && userAnswers.answerObject
          ? userAnswers.answerObject.find((performanceAnswer) => {
            return performanceAnswer.order === answer.sequence;
          })
          : null;
      if (performance) {
        answer.status = performance.status;
      } else {
        answer.status = ATTEMP_STATUS.SKIPPED;
        if (showCorrectAnswer) {
          answer.status = answer.is_correct
            ? ATTEMP_STATUS.CORRECT
            : null;
        }
      }
      return answer;
    });
  }

  /**
   * @function checkSerpAudioAnswers
   * This method is used to integrate serp user answer
   */
  public checkSerpAudioAnswers(answers, userAnswers, showCorrectAnswer?, hintExplanationDetail?) {
    if (!answers) {
      return [];
    }
    return answers.map((answer, index) => {
      const performance =
        userAnswers && userAnswers.answerObject
          ? userAnswers.answerObject.find((performanceAnswer) => {
            return performanceAnswer.order === answer.sequence;
          })
          : null;
      if (performance) {
        const pattern = checkHttpUrl(performance.answer_text);
        if (pattern) {
          answer.audioUrl = performance.answer_text;
        }
      } else {
        const exemplarDocs = hintExplanationDetail && hintExplanationDetail.exemplar_docs;
        if (showCorrectAnswer && exemplarDocs && exemplarDocs.length) {
          answer.audioUrl = exemplarDocs[index].audio_url;
        } else {
          answer.audioUrl = null;
        }
      }
      return answer;
    });
  }

  /**
   * @function resetQuestionTimer
   * This method is used to reset question timer
   */
  public resetQuestionTimer() {
    this.questionStartTime = 0;
    this.questionEndTime = 0;
  }

  // -------------------------------------------------------------------------
  // Events
  public ngOnDestory() {
    this.currentQuestionEventId = null;
    this.collectionEventSubject.next(null);
    this.resourceEventSubject.next(null);
    this.resetQuestionTimer();
  }
}
