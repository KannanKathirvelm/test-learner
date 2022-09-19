import { environment } from '@environment/environment';
import { routerPathStartWithSlash } from '@shared/constants/router-constants';
import { formUrlQueryParameters } from '@shared/utils/global';
const DEEPLINK_ROUTES = [
  'player', 'emailVerify', 'resetPassword', 'guardianInvites', 'deeplinkTenantLogin'
];

export const NO_AUTHENTICATION_NEED_ROUTES = [
  routerPathStartWithSlash('emailVerify'),
  routerPathStartWithSlash('resetPassword'),
  routerPathStartWithSlash('guardianInvites'),
  routerPathStartWithSlash('deeplinkTenantLogin'),
];

export function deeplinkRoutes() {
  const deeplinkObj = {};
  DEEPLINK_ROUTES.forEach((item) => {
    const routePath = routerPathStartWithSlash(item);
    deeplinkObj[routePath] = null;
  });
  return deeplinkObj;
}

export function formShareUrl(pathName, context) {
  const routePath = routerPathStartWithSlash(pathName);
  const queryParams = formUrlQueryParameters(context);
  return `${environment.API_END_POINT}${routePath}?${queryParams}`;
}
