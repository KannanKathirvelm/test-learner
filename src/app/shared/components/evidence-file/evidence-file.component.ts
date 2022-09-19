import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EvidenceModel } from '@app/shared/models/performance/performance';
import { MediaAPI } from '@app/shared/providers/apis/media/media';
import { CollectionPlayerService } from '@app/shared/providers/service/player/collection-player.service';
import { SessionService } from '@app/shared/providers/service/session/session.service';
import { validateUrl } from '@app/shared/utils/global';
import { environment } from '@environment/environment';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'nav-evidence-file',
  templateUrl: './evidence-file.component.html',
  styleUrls: ['./evidence-file.component.scss'],
})
export class EvidenceFileComponent implements OnInit {
  // -------------------------------------------------------------------------
  // Properties
  public evidenceFileUploads = [];
  public previewFile = false;
  public previewImage: string;
  @Output() public evidenceUploadFile = new EventEmitter();
  @Input() public reportViewMode: boolean;
  @Input() public evidenceList: Array<EvidenceModel>;
  public evidenceUrl: string;
  public isValidUrl: boolean;
  public isEnableUploadUrl: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private mediaAPI: MediaAPI,
    private sessionService: SessionService,
    private collectionPlayerService: CollectionPlayerService,
    private inAppBrowser: InAppBrowser
  ) {}

  public ngOnInit() {
    if (this.reportViewMode) {
      this.evidenceFileUploads = [...this.evidenceList];
    }
  }

  /*
   * @function onClickUpload
   * This method is used to upload multiple file
   */
  public onClickUpload(event) {
    const image = event.target.files[0];
    const environmentCdnUrl = environment.CDN_URL + '/';
    const cdnUrl = this.sessionService.userSession.cdn_urls
      ? this.sessionService.userSession.cdn_urls.content_cdn_url
      : environmentCdnUrl;
    if (image) {
      this.mediaAPI.uploadContentFile(image).then((uploadFile) => {
        uploadFile.data.url = cdnUrl + uploadFile.data.filename;
        this.evidenceFileUploads.push(uploadFile.data);
        this.evidenceUploadFile.emit(this.evidenceFileUploads);
        event.target.value = '';
      });
    }
  }

  /*
   * @function deleteUploadFile
   * This method is used to delete the upload file
   */
  public deleteUploadFile(fileIndex) {
    this.evidenceFileUploads.splice(fileIndex, 1);
  }

  /*
   * @function onClickUploadUrl
   * This method is used to upload multiple url links
   */
  public onClickUploadUrl() {
    this.isEnableUploadUrl = true;
    this.isValidUrl = validateUrl(this.evidenceUrl);
    if (this.isValidUrl) {
      const evidenceData = {
        url: this.evidenceUrl,
      };
      this.evidenceFileUploads.push(evidenceData);
      this.evidenceUploadFile.emit(this.evidenceFileUploads);
      this.evidenceUrl = '';
    }
  }

  /*
   * @function openEvidenceImage
   * This method is open evidence image in inappbrowser
   */
  public openEvidenceImage(url) {
    const target = '_blank';
    const options = this.collectionPlayerService.getInAppBrowserOptions();
    this.inAppBrowser.create(url, target, options);
  }
}
