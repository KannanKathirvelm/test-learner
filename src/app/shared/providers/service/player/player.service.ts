import { Injectable } from '@angular/core';
import { Events } from '@ionic/angular';
import { VideoConferenceComponent } from '@shared/components/video-conference/video-conference.component';
import { ASSESSMENT, ASSESSMENT_EXTERNAL, COLLECTION, CONTENT_TYPES, PLAYER_EVENT_SOURCE } from '@shared/constants/helper-constants';
import { PlayerLastPlayedSesssionModel, PlayerPerformanceModel } from '@shared/models/player/player';
import { PlayerPage } from '@shared/pages/player/player.page';
import { ModalService } from '@shared/providers/service/modal.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  public readonly CLASS_PERFORMANCE_UPDATE = 'class_performance_update';

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(private events: Events,
              private modalService: ModalService) { }

  /**
   * @function openPlayer
   * This method is used to open player modal
   */
  public openPlayer(props, className?) {
    return this.modalService.open(PlayerPage, props, className);
  }

  /**
   * @function openVideoConference
   * This method is used to open video conference modal
   */
  public openVideoConference(props, className) {
    return this.modalService.open(VideoConferenceComponent, props, className);
  }

  /**
   * @function updateLatestPerformance
   * This method is used to update latest performance
   */
  public updateLatestPerformance(collectionPerformance: PlayerPerformanceModel,
                                 lastPlayedSession: PlayerLastPlayedSesssionModel,
                                 collectionType: string,
                                 isUpdateClassPerformance?: boolean) {
    const lastPlayedPeformance = lastPlayedSession.performance;
    if (lastPlayedPeformance) {
      const attempts = collectionPerformance.attempts || 0;
      const lookupType = collectionType === ASSESSMENT ||
        collectionType === ASSESSMENT_EXTERNAL ? ASSESSMENT : COLLECTION;
      const latestPerformance = lastPlayedPeformance[lookupType];
      const score = latestPerformance.score;
      const timespent = latestPerformance.timespent
        ? (collectionPerformance.timeSpent || 0 + latestPerformance.timespent)
        : collectionPerformance.timeSpent;
      collectionPerformance.score = score;
      collectionPerformance.scoreInPercentage = score;
      collectionPerformance.attempts = attempts + 1;
      collectionPerformance.sessionId = lastPlayedSession.sessionId || null;
      collectionPerformance.lastSessionId = lastPlayedSession.sessionId || null;
      collectionPerformance.timeSpent = timespent;
    }
    if (isUpdateClassPerformance) {
      this.updateClassPerformance(PLAYER_EVENT_SOURCE.CA);
    }
    return collectionPerformance;
  }

  public updateClassPerformance(source?) {
    this.events.publish(this.CLASS_PERFORMANCE_UPDATE, source);
  }

  /**
   * @function checkEvidenceIsEnabled
   * This method is used to check evidence is enable
   */
  public checkEvidenceIsEnabled(classDetails, tenantSettings, content) {
    let isShowEvidence = false;
    if (content.contentFormat === CONTENT_TYPES.QUESTION) {
      isShowEvidence = classDetails && classDetails.setting ? classDetails.setting['show.evidence'] : false;
      if (tenantSettings) {
        const questionEvidenceVisibilityList = tenantSettings.uiElementVisibilitySettings ? tenantSettings.uiElementVisibilitySettings.questionEvidenceVisibility : null;
        if (isShowEvidence) {
          if (questionEvidenceVisibilityList) {
            isShowEvidence = questionEvidenceVisibilityList[content.contentSubformat];
          }
        }
        if (!isShowEvidence && questionEvidenceVisibilityList && questionEvidenceVisibilityList.default) {
          isShowEvidence = questionEvidenceVisibilityList[content.contentSubformat];
        }
        if (!isShowEvidence && !questionEvidenceVisibilityList) {
          isShowEvidence = content.player_metadata ? content.player_metadata.isEvidenceEnabled : false;
        }
      }
    }
    return isShowEvidence;
  }
}
