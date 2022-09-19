import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { UtilsService } from '@shared/providers/service/utils/utils.service';

@Injectable()
export class LoadingService {

  // -------------------------------------------------------------------------
  // Properties

  public loading: HTMLIonLoadingElement;
  private isLoaderPresent: boolean;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private loadingCtrl: LoadingController,
    private utilsService: UtilsService
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function displayLoader
   * This Method is used to display the loader
   */
  public async displayLoader() {
    if (!this.utilsService.isBrowser()) {
      if (!this.isLoaderPresent) {
        this.isLoaderPresent = true;
        this.loading = await this.loadingCtrl.create({
          cssClass: 'nav-loader'
        });
        await this.loading.present();
      }
    }
  }

  /**
   * @function dismissLoader
   * This Method is used to hide the loader
   */
  public dismissLoader() {
    if (this.loading) {
      this.isLoaderPresent = false;
      return this.loading.dismiss().then(() => {
        this.loading = null;
        return null;
      });
    }
  }
}
