import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { MAX_FILE_UPLOAD_SIZE, OA_TASK_SUBMISSION_TYPES } from '@shared/constants/helper-constants';
import { TaskFileUpload } from '@shared/models/offline-activity/offline-activity';

@Component({
  selector: 'nav-file-picker',
  templateUrl: './nav-file-picker.component.html',
  styleUrls: ['./nav-file-picker.component.scss'],
})
export class NavFilePickerComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Dependencies
  constructor(private alertController: AlertController) { }

  /**
   * @property {boolean} isImageFile
   * Property to check whether it's an image file or not
   */
  get isImageFile(): boolean {
    return this.fileType === 'image';
  }

  /**
   * @property {string} faIconClass
   * Property for favicon class name based on file type
   */
  get faIconClass(): string {
    const fileExtension = this.file && this.file.size ? this.file.name.substring(this.file.name.lastIndexOf('.') + 1) : null;
    const submissionType = OA_TASK_SUBMISSION_TYPES.find((type) => {
      return this.fileType === type.value || type.validExtensions.includes(fileExtension);
    });
    return submissionType ? submissionType.icon : 'fa-file';
  }

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Object} selectFile
   * Instance property of EventEmitter
   */
  @Output() public selectFile = new EventEmitter();

  /**
   * @property {Object} removeFile
   * Instance property of EventEmitter
   */
  @Output() public removeFile = new EventEmitter();

  /**
   * @property {boolean} isPreview
   * Property to show/hide file preview
   */
  @Input() public isPreview: boolean;

  /**
   * @property {string} fileUri
   * Property for file URI
   */
  @Input() public fileUri: string | ArrayBuffer;

  /**
   * @property {File & TaskFileUpload} file
   * Property for file object
   */
  @Input() public file: File & TaskFileUpload;

  /**
   * @property {number} key
   * Property for unique key for file upload
   */
  @Input() public key: number;

  /**
   * @property {string} fileType
   * Property for file type
   */
  @Input() public fileType: string;

  // -------------------------------------------------------------------------
  // Events
  public ngOnInit() {
    this.showImageFilePreview();
  }


  // -------------------------------------------------------------------------
  // Actions

  // Action triggered when select a file
  public onFileChange($event): void {
    const file = $event.target.files[0];
    if (file && file.size) {
      if (file.size > MAX_FILE_UPLOAD_SIZE) {
        this.presentAlert();
      } else {
        this.selectFile.emit(file);
      }
    }
  }

  // Action triggered when remove a file
  public onRemoveFile(): void {
    this.removeFile.emit(this.key);
  }

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @function showImageFilePreview
   * Method to show image file preview by converting the file base64
   */
  private showImageFilePreview(): void {
    if (this.file && this.file.size) {
      const reader = new FileReader();
      const component = this;
      component.fileType = this.file.type.substring(0, this.file.type.lastIndexOf('/'));
      if (component.fileType === 'image') {
        reader.readAsDataURL(this.file);
        reader.onload = (e) => {
          component.fileUri = reader.result;
        };
      }

    }
  }

  /**
   * @function presentAlert
   * Method to show an alert popup while uploading file size exceed allowed size
   */
  public async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Alert',
      message: 'Maximum allowed file size is 3MB',
      buttons: ['OK']
    });

    await alert.present();
  }
}
