export interface FollowingModel {
  followers: Array<string>;
  followings: Array<string>;
  details: Array<FollowingDetailsModel>;
}

export interface FollowingDetailModel {
  details: Array<FollowingDetailsModel>;
  type: string;
}

export interface FollowingDetailsModel {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  thumbnail: string;
  school_district_id: number;
  school_district: string;
  country_id: number;
  country: string;
  followers_count: number;
  followings_count: number;
  isFollowers?: boolean;
  isFollowing?: boolean;
}
