import { TenantListModel } from '@shared/models/auth/tenant';
export interface SessionModel {
  access_token: string;
  appId: string;
  partnerId: string;
  access_token_validity: number;
  cdn_urls: any;
  provided_at: number;
  user_id: string;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  user_category?: string;
  thumbnail?: string;
  refresh_token?: string;
  isRefreshToken?: boolean;
  tenant?: TenantListModel;
}

export interface CustomHTTPResponse {
  status: number;
  url?: string;
  data?: any;
  error?: string;
  message?: string;
  headers: {
    [key: string]: string;
  };
  request?: {
    [key: string]: string;
  };
}
