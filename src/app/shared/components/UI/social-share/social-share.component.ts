import { Component, Input } from '@angular/core';
// import { SocialSharing } from '@ionic-native/social-sharing/ngx';
// import { getQueryParamsByString } from '@shared/utils/global';

@Component({
  selector: 'social-share',
  templateUrl: './social-share.component.html',
  styleUrls: ['./social-share.component.scss'],
})
export class SocialShareComponent {
  // -------------------------------------------------------------------------
  // Properties
  @Input()
  public title: string;
  @Input()
  public shareUrl: string;
  @Input()
  public thumbnailImgUrl: string;
  //
  // constructor(private socialSharing: SocialSharing) { }
  //
  // // -------------------------------------------------------------------------
  // // Methods
  //
  // /**
  //  * @function share
  //  * This method is used to share in social media's
  //  */
  // public share() {
  //   const args = getQueryParamsByString(this.shareUrl);
  //   // const id = this.firebaseService.addDeeplinkUrl(args.queryParams);
  //   // const deeplinkUrl = `${args.urlString}?id=${id}`;
  //   // this.socialSharing.share(this.title, this.title, this.thumbnailImgUrl, deeplinkUrl);
  // }
}
