import { Directive, HostListener, Input } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { CollectionPlayerService } from '@shared/providers/service/player/collection-player.service';
import { UtilsService } from '@shared/providers/service/utils/utils.service';
import { checkUrlIsImage } from '@shared/utils/global';

@Directive({
  selector: '[inAppBrowser]'
})
export class InAppBrowserDirective {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public url: string;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private collectionPlayerService: CollectionPlayerService,
    private inAppBrowser: InAppBrowser,
    private utilsService: UtilsService
  ) {
  }

  // -------------------------------------------------------------------------
  // Actions

  @HostListener('click') public openInAppBrowser() {
    const isImageUrl = checkUrlIsImage(this.url);
    if (isImageUrl) {
      const target = '_blank';
      const options = this.collectionPlayerService.getInAppBrowserOptions();
      this.inAppBrowser.create(
        this.url,
        target,
        options
      );
    } else {
      this.utilsService.openPDFLink(this.url);
    }
  }
}
