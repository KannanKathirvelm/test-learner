export interface TenantListModel {
  tenantId: string;
  image_url?: string;
  login_type: string;
  tenant_name: string;
  short_name: string;
  tenant_short_name: string;
  settings?: {
    allow_multi_grade_class: string;
    enable_cls_video_conf_setup: string;
  };
}
