import { Injectable } from '@angular/core';
import { NO_PROFILE } from '@app/shared/constants/helper-constants';
import { environment } from '@environment/environment';
import { GuardianProfileModel, ProfileModel, UniversalUserModel } from '@shared/models/profile-portfolio/profile-portfolio';
import { HttpService } from '@shared/providers/apis/http';
import { SessionService } from '@shared/providers/service/session/session.service';

@Injectable({
  providedIn: 'root'
})

export class ProfileProvider {

  // -------------------------------------------------------------------------
  // Properties

  private namespace = 'api/nucleus/v2/profiles';
  private searchNamespace = 'api/nucleus/v2/profiles/search';
  private authNamespace = 'api/nucleus-auth/v2';
  private profileNamespace = 'api/nucleus-auth/v1';
  private guardianNamespace = 'api/guardian/v1';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private sessionService: SessionService, private httpService: HttpService) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function deleteProfile
   * This method is to delete user profile
   */
   public deleteProfile() {
    const endpoint = `${this.namespace}?appId=${environment.TRANSLATION_APP_ID}`;
    return this.httpService.delete<string>(endpoint);
  }

  /**
   * @function fetchProfilePreference
   * This method is profile preferences
   */
  public fetchProfilePreference(): Promise<Array<string>> {
    const endpoint = `${this.namespace}/preference`;
    return this.httpService.get<Array<string>>(endpoint).then((res) => {
      return res.data;
    });
  }

  /**
   * @function verifyEmail
   * This method is used to verify email
   */
  public verifyEmail(email) {
    const endpoint = `${this.searchNamespace}`;
    const params = {
      email
    };
    return this.httpService.get(endpoint, params);
  }

  /**
   * @function forgotPassword
   * This Method is used to reset the forgot password
   */
  public forgotPassword(email, tenantId) {
    const postData = {
      email,
      tenant_id: tenantId
    };
    const endpoint = `${this.authNamespace}/users/reset-password`;
    return this.httpService.post(endpoint, postData);
  }

  /**
   * @function linkUniveralUsers
   * This Method is used to link tha univeral users
   */
  public linkUniveralUsers(params: {user_ids: Array<string>}) {
    const endpoint = `${this.profileNamespace}/user/verify/init`;
    return this.httpService.post(endpoint, params);
  }

  /**
   * @function searchUniveralUsers
   * This Method is used to fetch the univeral user lists
   */
  public searchUniveralUsers(params: {text: string}) {
    const endpoint = `${this.namespace}/user/search`;
    return this.httpService.get(endpoint, params).then(response => {
      return this.normalizeUniversalUsers(response.data);
    });
  }

  /**
   * @function normalizeUniversalUsers
   * This Method is used to normalize users list
   */
  public normalizeUniversalUsers(payload: any): Array<UniversalUserModel> {
    const users = payload.users || [];
    const basePath = this.sessionService.userSession.cdn_urls.users_cdn_url;
    return users.map(user => {
      const thumbnailUrl = user.thumbnail ? `${basePath}/${user.thumbnail}` : NO_PROFILE;
      return {
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        status: user.status,
        tenantName: user.tenant_name,
        thumbnail: thumbnailUrl,
        username: user.username,
        id: user.id
      } as UniversalUserModel;
    });
  }

  /**
   * @function resetPassword
   * This Method is used to reset the password
   */
  public resetPassword(password, token) {
    const params = {
      password,
      token
    };
    const endpoint = `${this.authNamespace}/users/reset-password`;
    return this.httpService.put(endpoint, params);
  }

  /**
   * @function fetchProfileDetails
   * This method is used to get profile details
   */
  public fetchProfileDetails(profileUserId?): Promise<ProfileModel> {
    const userId = profileUserId ? profileUserId : this.sessionService.userSession.user_id;
    const params = {
      userids: userId
    };
    const endpoint = `${this.namespace}/search`;
    return this.httpService.get<ProfileModel>(endpoint, params).then((res) => {
      return this.normalizeProfile(res.data.users[0]);
    });
  }

  /**
   * @function normalizeProfile
   * This method is used to normalize profile
   */
  private normalizeProfile(payload) {
    const userDetails: ProfileModel = {
      about: payload.about,
      birthDate: payload.birth_date,
      country: payload.country,
      countryId: payload.country_id,
      course: payload.course,
      createdAt: payload.created_at,
      email: payload.email,
      firstName: payload.first_name,
      followers: payload.followers,
      followings: payload.followings,
      gender: payload.gender,
      id: payload.id,
      isFollowing: payload.isFollowing,
      lastName: payload.last_name,
      loginType: payload.login_type,
      metadata: payload.metadata,
      parentUserId: payload.parent_user_id,
      referenceId: payload.reference_id,
      rosterGlobalUserid: payload.roster_global_userid,
      rosterId: payload.roster_id,
      school: payload.school,
      schoolDistrict: payload.school_district,
      schoolDistrictId: payload.school_district_id,
      schoolId: payload.school_id,
      state: payload.state,
      stateId: payload.state_id,
      thumbnail: payload.thumbnail,
      updatedAt: payload.updated_at,
      userCategory: payload.user_category,
      username: payload.username,
      deletionTriggerDate: payload.deletion_trigger_date,
      info: payload.info,
      enableForcePasswordChange: payload.enable_force_password_change
    };
    return userDetails;
  }

  /**
   * @function verifyUserEmail
   * This method is used to verify user email id
   */
  public verifyUserEmail(emailId: string, token: string) {
    const endpoint = `${this.authNamespace}/users/send-email-verify`;
    const params = {
      email: emailId
    };
    const headers = this.httpService.getTokenHeaders(token);
    const reqOpts = { headers };
    return this.httpService.post<string>(endpoint, params, reqOpts);
  }

  /**
   * @function updateEmailVerification
   * This Method is used to update the email verification
   */
  public updateEmailVerification(token: string) {
    const endpoint = `${this.profileNamespace}/users/email-verify`;
    const params = { token };
    return this.httpService.put(endpoint, params);
  }

  /**
   * @function resendEmail
   * This Method is used to resend the email
   */
  public resendEmail(params: {user_id: string}) {
    const endpoint = `${this.profileNamespace}/user/verify/email/resend`;
    return this.httpService.post(endpoint, params);
  }

  /**
   * @function cancelUniversalRequest
   * This Method is used to cancel the univeral request
   */
  public cancelUniversalRequest(params: {user_id: string, mode: string}) {
    const endpoint = `${this.namespace}/user/universal-profile/cancel`;
    return this.httpService.put(endpoint, params);
  }

  /**
   * @function fetchRoleRelationshipList
   * this method is used to fetch relationship list
   */
  public fetchRoleRelationshipList() {
    const endpoint = `${this.guardianNamespace}/nav-users/relationships`;
    return this.httpService.get(endpoint).then((response) => {
      return response.data.relationships;
    });
  }

  /**
   * @function addGuardian
   * this method is used to add guardian for login user
   */
  public addGuardian(params) {
    const userId = this.sessionService.userSession.user_id;
    const endpoint = `${this.guardianNamespace}/nav-users/users/${userId}/guardians`;
    return this.httpService.post(endpoint, params);
  }

  /**
   * @function fetchGuardianList
   * This method is used to fetch guardian list
   */
  public fetchGuardianList() {
    const endpoint = `${this.guardianNamespace}/nav-users/list/guardians`;
    return this.httpService.get<Array<GuardianProfileModel>>(endpoint).then((response) => {
      return this.normalizeGuardianList(response.data.guardians);
    });
  }

  /**
   * @function approveGuardian
   * This method is used to approve guardian
   */
  public approveGuardian(token: string) {
    const endpoint = `${this.guardianNamespace}/nav-users/guardians/approve`;
    const params = { token };
    return this.httpService.put(endpoint, params);
  }

  /**
   * @function acceptGuardianRequest
   * This method is used to accept guardian request
   */
  public acceptGuardianRequest(guardianId: number) {
    const endpoint = `${this.guardianNamespace}/nav-users/accept/guardians`;
    const params = { guardianId };
    return this.httpService.put(endpoint, params);
  }

  /**
   * @function normalizeGuardianList
   * This method is used to normalize guardian list
   */
  private normalizeGuardianList(payload): Array<GuardianProfileModel> {
    const basePath = this.sessionService.userSession.cdn_urls.content_cdn_url;
    return payload.map((item) => {
      const guardian: GuardianProfileModel = {
        firstName: item.firstName,
        id: item.id,
        lastName: item.lastName,
        username: `${item.firstName} ${item.lastName}`,
        relationId: item.relationId,
        relationType: item.relationType,
        status: item.status,
        invitedBy: item.invitedBy,
        inviteStatus: item.inviteStatus,
        thumbnail: item.thumbnail ? `${basePath}/${item.thumbnail}` : null
      };
      return guardian;
    });
  }
}
