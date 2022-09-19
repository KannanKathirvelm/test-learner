import { Injectable } from '@angular/core';
import { ProfileModel, RoleModel } from '@shared/models/profile-portfolio/profile-portfolio';
import { ProfileProvider } from '@shared/providers/apis/profile/profile';
import { SessionService } from '@shared/providers/service/session/session.service';
import { cloneObject } from '@shared/utils/global';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  // -------------------------------------------------------------------------
  // Properties
  private preferencesSubject: BehaviorSubject<Array<string>>;
  public roleRelationshipList: BehaviorSubject<Array<RoleModel>>;
  private userProfileDetailSubject: BehaviorSubject<ProfileModel>;
  public readonly USER_PROFILE_UPDATE = 'profile_image_update';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private profileProvider: ProfileProvider,
    private sessionService: SessionService
  ) {
    this.preferencesSubject = new BehaviorSubject<Array<string>>(null);
    this.roleRelationshipList = new BehaviorSubject<Array<RoleModel>>(null);
    this.userProfileDetailSubject = new BehaviorSubject<ProfileModel>(null);
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchProfilePreference
   * This method is used to fetch profile preference.
   */
  public fetchProfilePreference() {
    this.profileProvider.fetchProfilePreference().then((preference) => {
      this.preferencesSubject.next(preference);
    });
  }

  get profilePreferences() {
    return this.preferencesSubject ? cloneObject(this.preferencesSubject.value) : null;
  }

  /**
   * @function resetPassword
   * This method is used to reset the password
   */
  public resetPassword(password, token) {
    return this.profileProvider.resetPassword(password, token);
  }

  /**
   * @function updateEmailVerification
   * this method used to verify email
   */
  public updateEmailVerification(token) {
    return this.profileProvider.updateEmailVerification(token);
  }

  /**
   * @function fetchProfileDetail
   * this method is used to fetch profile detail of given user id
   */
  public fetchProfileDetail(userId?) {
    return this.profileProvider.fetchProfileDetails(userId).then((profileDetails) => {
      this.userProfileDetailSubject.next(profileDetails);
      return profileDetails;
    });
  }

  get currentUserProfileDetail() {
    return this.userProfileDetailSubject ? cloneObject(this.userProfileDetailSubject.value) : null;
  }

  public verifyEmailWithoutToken(emailId) {
    return this.sessionService.getAccessToken().then((token) => {
      return this.verifyUserEmail(emailId, token);
    });
  }

  public verifyUserEmail(emailId, token) {
    return this.profileProvider.verifyUserEmail(emailId, token);
  }

  /**
   * @function searchUniveralUsers
   * this method is used fetch the univeral user
   */
  public searchUniveralUsers(params) {
    return this.profileProvider.searchUniveralUsers(params);
  }

  /**
   * @function linkUniveralUsers
   * this method is used to link the univeral users
   */
  public linkUniveralUsers(params) {
    return this.profileProvider.linkUniveralUsers(params);
  }

  /**
   * @function fetchRoleRelationshipList
   * this method is used to fetch relationship list
   */
  public fetchRoleRelationshipList() {
    return this.profileProvider.fetchRoleRelationshipList().then((roles) => {
      this.roleRelationshipList.next(roles);
      return roles;
    });
  }

  get relationshipList() {
    return this.roleRelationshipList ? cloneObject(this.roleRelationshipList.value) : null;
  }

  /**
   * @function addGuardian
   * this method is used to add guardian for login user
   */
  public addGuardian(params) {
    return this.profileProvider.addGuardian(params);
  }

  /**
   * @function fetchGuardianList
   * this method is used to fetch guardian list
   */
  public fetchGuardianList() {
    return this.profileProvider.fetchGuardianList();
  }

  /**
   * @function approveGuardian
   * this method is used to approve guardian
   */
  public approveGuardian(token) {
    return this.profileProvider.approveGuardian(token);
  }

  /**
   * @function acceptGuardianRequest
   * this method is used to accept request from guardian
   */
  public acceptGuardianRequest(guardianId) {
    return this.profileProvider.acceptGuardianRequest(guardianId);
  }
}
