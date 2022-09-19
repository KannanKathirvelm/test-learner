import { Injectable } from '@angular/core';
import { FollowingModel } from '@models/following/following';
import { FOLLOWERS, FOLLOWINGS, NO_PROFILE } from '@shared/constants/helper-constants';
import { HttpService } from '@shared/providers/apis/http';
import { SessionService } from '@shared/providers/service/session/session.service';

@Injectable({
  providedIn: 'root'
})
export class FollowingProvider {

  // -------------------------------------------------------------------------
  // Properties
  private followingNamespace = 'api/nucleus/v1/profiles';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private httpService: HttpService, private sessionService: SessionService) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchFollowingDetails
   * @param {String} userId
   * @param {Array} params
   * This method is used to fetch the Portfolio Offline Activity
   */
  public fetchFollowingDetails(userId, params) {
    const endpoint = `${this.followingNamespace}/${userId}/network`;
    return this.httpService.get<FollowingModel>(endpoint, params).then((response) => {
      if (response.data.details.length) {
        return this.serializeFollowingItems(response.data.details, params.details);
      }
    });
  }

  /**
   * @function serializeFollowingItems
   * @param {Object} followingDetails
   * @param {String} type
   * Method to serialize individual following details
   */
  public serializeFollowingItems(followingDetails, type) {
      const serializedFollowingItems = [];
      followingDetails.map(followingDetail => {
        serializedFollowingItems.push(
          this.serializeFollowingDetails(followingDetail, type)
        );
      });
      const followingItems = {
        details: serializedFollowingItems,
        type
      };
      return followingItems;
  }

  /**
   * @function serializeFollowingDetails
   * @param {Array} followingDetails
   * @param {String} type
   * Method to serialize portfolio activities
   */
  public serializeFollowingDetails(followingDetails, type) {
    let serializeFollowingItem = {};
    if (followingDetails) {
      const basePath = this.sessionService.userSession.cdn_urls.user_cdn_url;
      const thumbnailUrl = followingDetails.thumbnail ? basePath + followingDetails.thumbnail : NO_PROFILE;
      serializeFollowingItem = {
        id: followingDetails.id,
        username: followingDetails.username,
        first_name: followingDetails.first_name,
        last_name: followingDetails.last_name,
        thumbnail: thumbnailUrl,
        school_district_id: followingDetails.school_district_id,
        school_district: followingDetails.school_district,
        country_id: followingDetails.country_id,
        country: followingDetails.country,
        followers_count: followingDetails.followers_count,
        followings_count: followingDetails.followings_count,
        isFollowers: FOLLOWERS === type,
        isFollowing: FOLLOWINGS === type
      };
    }
    return serializeFollowingItem;
  }

  /**
   * @function postFollowingDetails
   * @param {String} userId
   * This method is used to post following details
   */
  public postFollowingDetails(userId) {
    const requestParam = { user_id: userId };
    const endpoint = `${this.followingNamespace}/follow`;
    return this.httpService.post(endpoint, requestParam);
  }

  /**
   * @function deleteFollowingDetails
   * @param {String} userId
   * This method is used to delete following details
   */
  public deleteFollowingDetails(userId) {
    const endpoint = `${this.followingNamespace}/${userId}/unfollow`;
    return this.httpService.delete(endpoint);
  }
}
