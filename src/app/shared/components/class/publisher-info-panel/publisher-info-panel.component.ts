import { Component, OnInit } from '@angular/core';
import { LearningContentsModel } from '@shared/models/milestone/milestone';
import { ProfileModel } from '@shared/models/profile-portfolio/profile-portfolio';
import { ProfileProvider } from '@shared/providers/apis/profile/profile';
import { ModalService } from '@shared/providers/service/modal.service';
import { CollectionPlayerService } from '@shared/providers/service/player/collection-player.service';

@Component({
  selector: 'nav-publisher-info-panel',
  templateUrl: './publisher-info-panel.component.html',
  styleUrls: ['./publisher-info-panel.component.scss'],
})
export class PublisherInfoPanelComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public taxonomyList: any;
  public publisherInfoContent: LearningContentsModel;
  public resourceType: string;
  public resourceThumbnail: string;
  public creatorDetails: ProfileModel;
  public showMore: boolean;

  constructor(
    private modalService: ModalService,
    private collectionPlayerService: CollectionPlayerService,
    private profileProvider: ProfileProvider
  ) { }


  public ngOnInit() {
    this.fetchCreatorInfo();
    const resourceType = this.publisherInfoContent.contentSubtype;
    this.resourceType = resourceType.replace('_', ' ');
    const fwCompCode = this.publisherInfoContent.fwCompCode;
    const fwCompDisplayCode = this.publisherInfoContent.fwCompDisplayCode;
    if (fwCompCode && fwCompDisplayCode) {
      this.taxonomyList = {
        [fwCompCode]: {
          code: fwCompDisplayCode
        }
      };
    }
  }

  /**
   * @function fetchCreatorInfo
   * This method is used to fetch creator info
   */
  private async fetchCreatorInfo() {
    if (this.publisherInfoContent.creatorId !== '') {
      this.creatorDetails = await this.profileProvider.fetchProfileDetails(this.publisherInfoContent.creatorId);
    }
  }

  /**
   * @function playAlternateResource
   * This method is used to play resource
   */
  public playAlternateResource() {
    this.collectionPlayerService.playRelatedResourceContent(this.publisherInfoContent);
  }

  /**
   * @function dismissModal
   * This method is used to dismiss modal
   */
  public dismissModal() {
    this.modalService.dismiss();
  }
}
