import { createAction, props } from '@ngrx/store';
import { TenantSettingsModel } from '@shared/models/tenant/tenant-settings';
export const setTenantSettings = createAction(
  '[TenantSettings] SetTenantSettings',
  props<{ data: TenantSettingsModel; }>()
);
