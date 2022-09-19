import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OA_TASK_SUBMISSION_TYPES } from '@shared/constants/helper-constants';
import { ReferenceModel, SubmissionTypeModel, TaskFileUpload, TaskModel } from '@shared/models/offline-activity/offline-activity';
import { OATaskSubmissionContext, OATaskSubmissionPayload, PlayerContextModel } from '@shared/models/player/player';
import { PlayerProvider } from '@shared/providers/apis/player/player';
import { MediaService } from '@shared/providers/service/media/media.service';
import { SessionService } from '@shared/providers/service/session/session.service';
import { getFileCategoryByExtension as getFileType } from '@shared/utils/global';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'offline-activity-task',
  templateUrl: './offline-activity-task.component.html',
  styleUrls: ['./offline-activity-task.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 })],
})
export class OfflineActivityTaskComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Dependencies
  constructor(
    private mediaService: MediaService,
    private session: SessionService,
    private playerApiProvider: PlayerProvider) { }

  /**
   * @property {Array} expectedTaskSubmissions
   * Property for list of expected task submission
   */
  get expectedTaskSubmissions() {
    return this.task.oaTaskSubmissions;
  }

  /**
   * @property {Array} expectedUploadedSubmissions
   * Property for list of expected upload submission
   */
  get expectedUploadedSubmissions() {
    return this.expectedTaskSubmissions.filter((submission) => {
      return submission.taskSubmissionType === 'uploaded';
    });
  }

  /**
   * @property {Array} expectedUrlSubmissions
   * Property for list of expected url submission
   */
  get expectedUrlSubmissions() {
    return this.expectedTaskSubmissions.filter((submission) => {
      return submission.taskSubmissionType === 'remote';
    });
  }

  /**
   * @property {Array} submittedUploads
   * Property for list of submitted task uploads
   */
  get submittedUploads() {
    let submittedUploads = [];
    if (this.task.submissions && this.task.submissions['uploaded']) {
      submittedUploads = this.task.submissions['uploaded'].length ? this.task.submissions['uploaded'] : [];
    }
    return submittedUploads;
  }

  /**
   * @property {Array} submittedUrls
   * Property for list of submitted task urls
   */
  get submittedUrls() {
    let submittedUrls = [];
    if (this.task.submissions && this.task.submissions['remote']) {
      submittedUrls = this.task.submissions['remote'].length ? this.task.submissions['remote'] : [];
    }
    return submittedUrls;
  }

  /**
   * @property {string} submittedAnswerText
   * Property for submitted answer text
   */
  get submittedAnswerText() {
    let submittedAnswerText = '';
    if (this.task.submissions && this.task.submissions['freeFormText']) {
      submittedAnswerText = this.task.submissions['freeFormText'].length ? this.task.submissions['freeFormText'][0].submissionInfo : '';
    }
    return submittedAnswerText;
  }

  /**
   * @property {String} answerText
   * @getter Property for submitted answer text
   */
  get answerText() {
    return this.submittedAnswerText;
  }

  /**
   * @property {String} answerText
   * @setter Property for submitted answer text
   */
  set answerText(value: string) {
    this.updatedAnswerText = value;
  }

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {TaskModel} task
   * Property for offline activity task
   */
  @Input() public task: TaskModel;

  @Input() public isContentPreview: boolean;

  @Input() public references: Array<ReferenceModel>;

  /**
   * @property {PlayerContextModel} playerContext
   * Property for current player context object
   */
  @Input() public playerContext: PlayerContextModel;

  /**
   * @property {number} oaTimespent
   * Property for offline activity timespent
   */
  @Input() public oaTimespent: number;

  /**
   * @property {boolean} isPreview
   * Property to check whether the OA is completed or not
   */
  @Input() public isPreview;

  /**
   * @property {boolean} isStudyPlayer
   * Property to check whether it's a study player or not
   */
  @Input() public isStudyPlayer: boolean;

  /**
   * @property {boolean} isShowSubmission
   * Property to show/hide submission container
   */
  @Input() public sequenceId: number;
  @Output() public taskValidate: EventEmitter<{ index: number, isValid: boolean }> = new EventEmitter();

  /**
   * @property {string} updatedAnswerText
   * Property for updated task answer text
   */
  private updatedAnswerText: string;

  /**
   * @property {Array} taskUploads
   * Property for all newly uploaded and submitted task upload submissions
   */
  public taskUploads: Array<TaskFileUpload & File> = [];

  /**
   * @property {Array} taskUrls
   * Property for all newly added and submitted task url submissions
   */
  public taskUrls: Array<{ value: string; }> = [];

  /**
   * @property {OATaskSubmissionContext[]} uploadedSubmissions
   * Property for list of uploaed submission in request payload
   */
  private uploadedSubmissions: Array<OATaskSubmissionContext> = [];

  /**
   * @property {OATaskSubmissionContext[]} urlSubmissions
   * Property for list of url submission in request payload
   */
  private urlSubmissions: Array<OATaskSubmissionContext> = [];

  /**
   * Property for list of url submission in request payload
   */
  public mandatoryFileUpload: Array<{ type: string, mandatorySubmissionCount: number, isUploaded: boolean, pendingCount: number }>;

  /**
   * @property {boolean} isSaving
   * Property to check whether the task is saving or not
   */
  public isSaving = false;
  public isFileUpload: boolean;
  public isUrlUpload: boolean;
  public isAnswerText: boolean;
  public pendingUploadSubmissions: number;
  public submittedtFiles: number;
  public isSubmitted: boolean;
  public isShowSubmission = false;

  // -------------------------------------------------------------------------
  // Events
  public ngOnInit() {
    if (this.isPreview) {
      this.isShowSubmission = !this.isShowSubmission;
    } else {
      this.mandatoryFileUpload = [];
      this.pendingUploadSubmissions = 0;
      this.submittedtFiles = 0;
      this.isSubmitted = false;
      this.typeBasedMandatoryUploads();
    }
  }

  // -------------------------------------------------------------------------
  // Actions

  // Action triggered when select a file
  public onSelectFile(file) {
    file.isUploaded = false;
    this.isFileUpload = true;
    this.taskUploads.push(file);
    this.pendingUploadSubmissions = (this.pendingUploadSubmissions - 1);
  }

  // Action triggered when remove a file
  public onRemoveFile(fileSeq) {
    this.taskUploads.splice(fileSeq, 1);
    this.pendingUploadSubmissions = (this.pendingUploadSubmissions + 1);
    if (!this.taskUploads.length && !this.isUrlUpload) {
      this.isFileUpload = false;
    }
  }

  /**
   * @function onEnterAnswer
   * This method trigger when user answer text
   */
  public onEnterAnswer(event) {
    this.isAnswerText = !!event.target.value;
  }

  // Action triggered when push empty url object
  public onAddUrl() {
    this.taskUrls.push({ value: '' });
  }

  // Action triggered when click save task button
  public onSaveTask() {
    this.isSaving = true;
    this.uploadFilesToS3().then((uploadedFiles) => {
      this.playerApiProvider.submitOfflineActivityTask(this.getTaskSubmissionPayload()).then(() => {
        this.clearUploads();
        this.isShowSubmission = !this.isShowSubmission;
        this.isSaving = false;
        this.isSubmitted = true;
        this.checkValidation();
      });
    });

  }

  /**
   * @function typeBasedMandatoryUploads
   * This method is used to check mandatory file upload
   */
  public typeBasedMandatoryUploads() {
    this.mandatoryFileUpload = [];
    const oaTaskUploadSubmissions = this.task.oaTaskSubmissions;
    OA_TASK_SUBMISSION_TYPES.map((submissionType) => {
      const type = submissionType.value;
      const typeBasedSubmission = oaTaskUploadSubmissions.filter((taskSubmission) => taskSubmission.taskSubmissionSubType === type);
      if (typeBasedSubmission.length) {
        const typeBasedSubmissionCount = {
          type,
          mandatorySubmissionCount: typeBasedSubmission.length,
          isUploaded: false,
          pendingCount: typeBasedSubmission.length
        };
        this.pendingUploadSubmissions = (this.pendingUploadSubmissions + typeBasedSubmission.length);
        this.mandatoryFileUpload.push(typeBasedSubmissionCount);
      }
    });
    this.checkValidation();
  }

  /**
   * @function checkValidation
   * This method is used to check validation
   */
  public checkValidation() {
    const submissions = this.task.submissions;
    this.submittedtFiles = (submissions && submissions['uploaded']) ? submissions['uploaded'].length : 0;
    const isValid = this.pendingUploadSubmissions ? this.pendingUploadSubmissions <= this.submittedtFiles : this.isSubmitted ? true : this.answerText.length > 0;
    this.taskValidate.emit({ index: (this.sequenceId - 1), isValid });
    this.pendingUploadSubmissions = this.pendingUploadSubmissions > this.submittedtFiles ? this.pendingUploadSubmissions - this.submittedtFiles : 0;
  }

  /**
   * @function onEnterUrl
   * This method trigger when user enter url
   */
  public onEnterUrl(taskUrls) {
    const upload = taskUrls.find((task) => {
      return task.value;
    });
    if (upload) {
      this.isUrlUpload = true;
    } else if (!this.isFileUpload) {
      this.isUrlUpload = false;
    }
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function getTaskSubmissionPayload
   * @return {OATaskSubmissionPayload}
   * Method to construct task submission payload
   */
  private getTaskSubmissionPayload(): OATaskSubmissionPayload {
    const submissionPayload: OATaskSubmissionPayload = {
      student_id: this.session.userSession.user_id,
      class_id: this.playerContext.classId,
      oa_id: this.task.oaId,
      content_source: this.playerContext.source,
      submissions: [],
      time_spent: this.oaTimespent
    };
    const answerTextSubmission = [this.getSubmissionContext(this.updatedAnswerText || this.answerText)];
    const uploadedSubmissions = this.getUploadedSubmissions();
    const urlSubmissions = this.getUrlSubmissions();

    submissionPayload.submissions = answerTextSubmission.concat(uploadedSubmissions, urlSubmissions);
    if (this.isStudyPlayer) {
      submissionPayload.course_id = this.playerContext.courseId;
      submissionPayload.unit_id = this.playerContext.unitId;
      submissionPayload.lesson_id = this.playerContext.lessonId;
    } else {
      submissionPayload.oa_dca_id = Number(this.playerContext.caContentId);
    }

    return submissionPayload;
  }

  /**
   * @function getUploadedSubmissions
   * @return {OaTaskSubmissionModel[]}
   * Method to get uploaded submission request context
   */
  private getUploadedSubmissions(): Array<OATaskSubmissionContext> {
    this.taskUploads.map((fileData) => {
      if (fileData.uuidName) {
        this.uploadedSubmissions.push(this.getSubmissionContext(fileData.uuidName, 'uploaded', fileData.fileType));
      }
    });
    return this.uploadedSubmissions;
  }

  /**
   * @function getUrlSubmissions
   * @return {OaTaskSubmissionModel[]}
   * Method to get url submission request context
   */
  private getUrlSubmissions(): Array<OATaskSubmissionContext> {
    this.taskUrls.map((url) => {
      if (url.value && url.value !== '') {
        this.urlSubmissions.push(this.getSubmissionContext(url.value, 'remote', 'url'));
      }
    });
    return this.urlSubmissions;
  }

  /**
   * @function uploadFilesToS3
   * @return {Promise[]}
   * Method to upload selected files to s3
   */
  private uploadFilesToS3() {
    const filesPromise = this.taskUploads.map((file: TaskFileUpload & File) => {
      file.isUploading = true;
      return new Promise((resolve, reject) => {
        this.mediaService.uploadContentFile(file).then((filename: string) => {
          file.uuidName = filename;
          file.fileType = getFileType(file.name.substring(file.name.lastIndexOf('.') + 1));
          file.isUploading = false;
          file.isUploaded = true;
          resolve(file as File & TaskFileUpload);
        });
      });

    });
    return Promise.all(filesPromise);

  }

  /**
   * @function getSubmissionContext
   * @param {string} value
   * @param {string} type
   * @param {string} subtype
   * @return {OATaskSubmissionContext}
   * Method to upload selected files to s3
   */
  private getSubmissionContext(
    value: string,
    type: string = 'free-form-text',
    subtype: string = 'free-form-text'): OATaskSubmissionContext {
    const submissionContext: OATaskSubmissionContext = {
      task_id: this.task.id,
      submission_info: value,
      submission_type: type,
      submission_subtype: subtype
    };
    return submissionContext;
  }

  /**
   * @function clearUploads
   * Method to push uploads to submission object and reset uploads
   */
  private clearUploads(): void {
    if (!this.task.submissions) {
      this.task.submissions = [];
    }
    const submittedUploads = this.task.submissions['uploaded'] || [];
    const submittedUrls = this.task.submissions['remote'] || [];
    this.taskUploads.map((taskUpload) => {
      const uploadedsubmission: SubmissionTypeModel = {
        submissionInfo: this.session.userSession.cdn_urls.content_cdn_url + taskUpload.uuidName || '',
        submissionType: 'uploaded',
        submissionSubtype: taskUpload.fileType,
        submissionIcon: null,
        submittedOn: ''
      };
      submittedUploads.push(uploadedsubmission);
    });
    this.task.submissions['uploaded'] = submittedUploads;
    this.taskUrls.map((taskUrl) => {
      const urlSubmission: SubmissionTypeModel = {
        submissionInfo: taskUrl.value || '',
        submissionType: 'remote',
        submissionSubtype: 'url',
        submissionIcon: null,
        submittedOn: ''
      };
      submittedUrls.push(urlSubmission);
    });
    this.task.submissions['remote'] = submittedUrls;
    this.taskUploads = [];
    this.taskUrls = [{ value: '' }];
  }

}
