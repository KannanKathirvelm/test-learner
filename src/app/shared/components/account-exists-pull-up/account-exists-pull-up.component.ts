import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { routerPathStartWithSlash as routerPath } from '@shared/constants/router-constants';

@Component({
  selector: 'account-exists-pull-up',
  templateUrl: './account-exists-pull-up.component.html',
  styleUrls: ['./account-exists-pull-up.component.scss']
})
export class AccountExistsPullupComponent {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public email: string;
  @Output() public closeAccountExistsPullUp = new EventEmitter();
  @Output() public login = new EventEmitter();

  constructor(private router: Router) { }

  /**
   * @function onCloseAccountExistsPullUp
   * This method used to close the pullup
   */
  public onCloseAccountExistsPullUp() {
    this.closeAccountExistsPullUp.emit();
  }

  /**
   * @function navigateToLogin
   * this Method is used to navigate to login page
   */
  public navigateToLogin() {
    this.closeAccountExistsPullUp.emit();
    this.router.navigate([routerPath('loginWithTenantList')], { queryParams: { email: this.email } });
  }
}
