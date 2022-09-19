export interface SignUpModel {
  access_token: string;
  access_token_validity: number;
  cdn_urls: any;
  provided_at: number;
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_category: string;
  thumbnail: string;
  tenant: string;
}
export interface ProfileModel {
  country: string;
  country_id: string;
  email: string;
}
export interface CountryModel {
  code: string;
  id: string;
  name: string;
}
export interface KnowMoreQuestionDetailModel {
  question: string;
  storeKey: string;
  seqId: number;
  defaultValue: string;
  isEditable: boolean;
  inputFormat: string;
  options: [{
    key: string,
    value: string
  }];
  additionalInfo?: {
    framework_code: string,
    subject_code: string
  };
}
