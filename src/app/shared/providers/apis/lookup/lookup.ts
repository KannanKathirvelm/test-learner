import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { AppConfigModel } from '@shared/models/config/config';
import { TenantSettingsModel } from '@shared/models/tenant/tenant-settings';
import { TourMessagesModel, TourModel } from '@shared/models/tour/tour';
import { HttpService } from '@shared/providers/apis/http';

@Injectable({
  providedIn: 'root'
})
export class LookupProvider {

  // -------------------------------------------------------------------------
  // Properties

  private namespaceV1 = 'api/nucleus/v1';
  private parseNamespace: string;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private httpService: HttpService) {
    this.parseNamespace = environment.PARSE_API_PATH;
  }


  /**
   * @function fetchTenantSettings
   * This method is used to fetch tenant settings
   */
  public fetchTenantSettings(): Promise<TenantSettingsModel> {
    const endpoint = `${this.namespaceV1}/lookups/tenant-settings`;
    return this.httpService.get<TenantSettingsModel>(endpoint).then((res) => {
      const tenantSettings = res.data ? res.data.tenant_settings : null;
      if (!tenantSettings) {
        return {} as TenantSettingsModel;
      }
      return this.normalizeTenantSettings(tenantSettings);
    });
  }

  /**
   * @function fetchTourMessages
   * This method is used to fetch tour messages
   */
  public fetchTourMessages() {
    const endpoint = `${this.parseNamespace}/tour`;
    const headers = this.httpService.getAppIdHeaders();
    return this.httpService.get<Array<TourMessagesModel>>(endpoint, {}, headers).then((res) => {
      if (!res.data) {
        return {} as TourMessagesModel;
      }
      return this.normalizeTourMessages(res.data);
    });
  }

  /**
   * @function normalizeTourMessages
   * This method is used to normalize tour messages
   */
  public normalizeTourMessages(payload) {
    return payload.map((tourDetails) => {
      const item: TourMessagesModel = {
        key: tourDetails.key,
        value: this.normalizeTourMessage(tourDetails.value)
      };
      return item;
    });
  }

  /**
   * @function normalizeTourMessage
   * This method is used to normalize tour message
   */
  public normalizeTourMessage(payload) {
    return payload.map((tourDetails) => {
      const item: TourModel = {
        element: tourDetails.element,
        popover: tourDetails.popover
      };
      return item;
    });
  }

  /**
   * @function fetchAppConfig
   * This method is used to fetch app config
   */
  public fetchAppConfig() {
    const endpoint = `${this.parseNamespace}/config`;
    const headers = this.httpService.getAppIdHeaders();
    return this.httpService.get<AppConfigModel>(endpoint, {}, headers).then((res) => {
      return this.normalizeAppConfig(res.data);
    });
  }

  /**
   * @function normalizeAppConfig
   * This method is used to normalize the app config
   */
  private normalizeAppConfig(payload) {
    if (payload) {
      const appConfig: any = [];
      payload.forEach((config) => {
        const item = {
          value: config.value
        };
        appConfig[config.key] = item;
      });
      return appConfig;
    }
    return;
  }

  /**
   * @function normalizeTenantSettings
   * This method is used to normalize the tenant settings
   */
  private normalizeTenantSettings(payload): TenantSettingsModel {
    const payloadTxSubClassifierPrefs = payload.tx_sub_classifier_prefs;
    const txSubClassifierPrefs = {
      defaultubClassificationId: payloadTxSubClassifierPrefs ?
        payloadTxSubClassifierPrefs.default_sub_classification_id : null,
      isGlobalVisible: payloadTxSubClassifierPrefs ?
        payloadTxSubClassifierPrefs.is_global_visible : null
    };
    const subPrefs = payload.tx_sub_prefs;
    const txSubPrefsKeys = subPrefs ? Object.keys(subPrefs) : null;
    const txSubPrefsKey = txSubPrefsKeys && txSubPrefsKeys.length ? txSubPrefsKeys[0] : null;
    const txSubPrefs = txSubPrefsKey ? {
      subject: txSubPrefsKey,
      defaultGutSubjectCode: subPrefs[`${txSubPrefsKey}`].default_gut_subject_code,
      isGlobalVisible: subPrefs[`${txSubPrefsKey}`].is_global_visible
    } : null;
    const classSettings = payload.navigator_class_setting;
    const classSettingsKeys = classSettings ? Object.keys(classSettings) : null;
    const classSettingsKey = classSettingsKeys && classSettingsKeys.length ? classSettingsKeys[0] : null;
    const navigatorClassSetting = classSettingsKey ? {
      subjectCode: classSettingsKey,
      classOrigin: classSettings[`${classSettingsKey}`].class_origin,
      classVersion: classSettings[`${classSettingsKey}`].class_version,
      courseId: classSettings[`${classSettingsKey}`].course_id,
      diagnosticApplicable: classSettings[`${classSettingsKey}`].diagnostic_applicable,
      framework: classSettings[`${classSettingsKey}`].framework,
      route0Applicable: classSettings[`${classSettingsKey}`].route0_applicable,
      studentMathLevel: classSettings[`${classSettingsKey}`].student_math_level
    } : null;
    const visiblityElement = payload.ui_element_visibility_settings;

    const tenantSettings: TenantSettingsModel = {
      translationSetting: payload.translation_setting,
      allowMultiGradeClass: payload.allow_multi_grade_class,
      competencyCompletionDefaultMinScore: payload.competency_completion_default_min_score ? Number(payload.competency_completion_default_min_score) : null,
      competencyCompletionMinScore: payload.competency_completion_min_score,
      competencyCompletionThresholdForAssessment: payload.competency_completion_threshold_for_assessment,
      enableClsVideoConfSetup: payload.enable_cls_video_conf_setup,
      groupHierarchy: payload.group_hierarchy,
      filterNonPremiumCourse: payload.filter_non_premium_course,
      navigatorClassSetting,
      txSubClassifierPrefs,
      txSubPrefs,
      twFwPref: payload.tx_fw_prefs,
      preferredFacetSubjectCodes: payload.preferred_facet_subject_codes,
      useLearnerDataVisibiltyPref: payload.use_learner_data_visibilty_pref,
      defaultSkylineGradeDiffForDiagnostic: payload.default_skyline_grade_diff_for_diagnostic_flow || null,
      defaultSkylineGradeDiff: payload.default_skyline_grade_diff,
      navigatorRouteMapViewApplicable: payload.navigator_route_map_view_applicable,
      enableMilestoneViewAtFwLevel: payload.enable_milestone_view_at_fw_level,
      uiElementVisibilitySettings: payload.ui_element_visibility_settings ? this.normalizeVisibilitySettings(payload.ui_element_visibility_settings) : null,
      isShowReaction: visiblityElement ? visiblityElement.show_reaction_only !== false : true, // Default values is true
      showJoinClass: visiblityElement ? visiblityElement.show_join_class_card !== false : true, // Default values is true
      enableGuardianCollectionPreview: payload.enable_guardian_collection_preview === undefined || payload.enable_guardian_collection_preview === 'on', // Default values is true
      hideGuardianAnswerDetails: payload.hide_guardian_answer_details &&  payload.hide_guardian_answer_details === 'on' // Default values is false
    };
    return tenantSettings;
  }

  /**
   * @function normalizeVisibilitySettings
   * This method is used to normalize the UI visibility settings
   */
  private normalizeVisibilitySettings(payload) {
    return {
      questionEvidenceVisibility  : payload.question_evidence_visibility ? this.normalizeVisibilityQuestionSettings(payload.question_evidence_visibility) : null,
      showQuestionEvidence : payload.show_question_evidence,
      showLogo: payload.show_logo,
      classCreateShowSubjectCards: payload.class_create_show_subject_cards,
      enableStudyPlayerFullscreenMode: payload.enable_study_player_fullscreen_mode,
      lessonLabelCourseMap: payload.lesson_label_course_map,
      logoUrl: payload.logo_url,
      studyPlayerPgImage: payload.study_player_pg_image,
      isLearningJourneyPathView: !!(payload.default_lj_route_view && payload.default_lj_route_view === 'path'), //  Default value of default_lj_route_view is drilldown - (options: dilldown/path)
      enableNavigatorProgram: payload.enable_navigator_programs ? true : false, // default value is to be false
      hideCourseMapViewContentLabelSeq: payload.hide_course_map_view_content_label_seq
    };
  }

  /**
   * @function normalizeVisibilityQuestionSettings
   * This method is used to normalize evidence visibility settings
   */
  private normalizeVisibilityQuestionSettings(payload) {
    return {
      default : payload.default,
      fillInTheBlankQuestion: payload.fill_in_the_blank_question,
      hotTextReorderQuestion : payload.hot_text_reorder_question,
      multipleAnswerQuestion: payload.multiple_answer_question,
      multipleChoiceQuestion : payload.multiple_choice_question,
      openEndedQuestion : payload.open_ended_question,
      trueFalseQuestion : payload.true_false_question,
    };
  }
}
