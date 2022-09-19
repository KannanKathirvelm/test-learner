import { Component, OnInit } from '@angular/core';
import { FollowingDetailModel } from '@models/following/following';
import { TranslateService } from '@ngx-translate/core';
import { FollowingProvider } from '@providers/apis/following/following';
import { FOLLOWERS, FOLLOWINGS } from '@shared/constants/helper-constants';
import { LoadingService } from '@shared/providers/service/loader.service';
import { SessionService } from '@shared/providers/service/session/session.service';
import { ToastService } from '@shared/providers/service/toast.service';
import axios from 'axios';

@Component({
  selector: 'following',
  templateUrl: './following.page.html',
  styleUrls: ['./following.page.scss'],
})
export class FollowingPage implements OnInit {

  // -------------------------------------------------------------------------
  // Properties
  public userId: string;
  public followingDetails: Array<FollowingDetailModel>;
  public noFollowing: boolean;
  public noFollowers: boolean;
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private followingProvider: FollowingProvider,
    private loader: LoadingService,
    private sessionService: SessionService,
    private toastService: ToastService,
    private translate: TranslateService
  ) {
    this.userId = this.sessionService.userSession.user_id;
  }

  // -------------------------------------------------------------------------
  // Actions

  public ngOnInit() {
    this.fetchFollowingData();
  }

  /**
   * @function fetchFollowingData
   * This method is used to load the following data
   */
  public fetchFollowingData() {
    this.loader.displayLoader();
    return axios.all([
      this.fetchFollowingDetails(FOLLOWERS),
      this.fetchFollowingDetails(FOLLOWINGS),
    ]).then(axios.spread((followers: Array<FollowingDetailModel>, followings: Array<FollowingDetailModel>) => {
      this.followingDetails = [];
      this.noFollowing = !followings;
      this.noFollowers = !followers;
      if (followers || followings) {
        this.followingDetails = this.followingDetails.concat(followers, followings);
      }
      this.loader.dismissLoader();
    }), (error) => {
      this.followingDetails = [];
      this.loader.dismissLoader();
    });
  }

  /**
   * @function fetchFollowingDetails
   * @param {String} type
   * This method is used to fetch following details
   */
  public fetchFollowingDetails(type) {
    return new Promise((resolve, reject) => {
      const requestParam = { details: type };
      return this.followingProvider.fetchFollowingDetails(this.userId, requestParam).then((followingContents) => {
        resolve(followingContents);
      }, (error) => {
        resolve([]);
      });
    });
  }

  /**
   * @function onClickFollow
   * @param {String} userId
   * This method is used to follow the user
   */
  public onClickFollow(userId) {
    this.followingDetails.forEach((following) => {
      if (following.type === FOLLOWINGS) {
        const followingData = following.details.find((followingId) => {
          return followingId.id === userId;
        });
        if (followingData) {
          this.translate.get('ALREADY_FOLLOWING')
            .subscribe(value => {
              this.toastService.presentToast(value);
            });
        } else {
          this.followingProvider.postFollowingDetails(userId)
            .then(() => {
              this.fetchFollowingData();
            });
        }
      }
    });
  }

  /**
   * @function onClickUnFollow
   * @param {String} userId
   * This method is used to Unfollow the user
   */
  public onClickUnFollow(userId) {
    this.followingProvider.deleteFollowingDetails(userId)
      .then(() => {
        this.fetchFollowingData();
      });
  }
}
