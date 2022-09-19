import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { NavController } from '@ionic/angular';
import { routerPathStartWithSlash as routerPath } from '@shared/constants/router-constants';
import { SessionService } from '@shared/providers/service/session/session.service';

@Injectable({
  providedIn: 'root'
})
export class LoginAuthGuardService implements CanActivate {

  constructor(private navCtrl: NavController, private sessionService: SessionService) { }

  public canActivate() {
    return this.sessionService.isAuthenticated().then((authenticated) => {
      if (authenticated) {
        this.navCtrl.navigateForward(routerPath('studentHome'));
      }
      return !authenticated;
    });
  }
}
