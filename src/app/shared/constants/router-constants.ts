const ROUTER_PATH = {
  login: 'login',
  loginWithUsername: 'login/username',
  loginWithTenantUsername: 'login/tenant-username',
  loginWithTenantList: 'login/tenant-list',
  loginWithTenantUrl: 'login/tenant-url',
  signUp: 'sign-up',
  categoriesAndFacets: 'categories-and-facets',
  class: 'class/:id',
  activities: 'activities',
  classActivityFullPath: 'class/:id/class-activity/activities',
  milestone: 'class/:id/milestone',
  home: 'class/:id/home',
  proficiency: 'class/:id/proficiency',
  studentHome: 'student-home',
  guardianHome: 'guardian-home',
  classSetupInComplete: 'class/:id/setup-not-completed',
  classActivity: 'class-activity',
  ItemsToGrade: 'items-to-grade',
  player: 'player',
  studyPlayer: 'study-player',
  profile: 'profile',
  myLearnerIdentity: 'my-learner-identity',
  portfolio: 'portfolio',
  aboutMe: 'about-me',
  following: 'following',
  preferences: 'preferences',
  forgotPassword: 'forgot-password',
  courseMap: 'class/:id/course-map',
  resetPassword: 'reset-password',
  emailVerify: 'email-verification',
  navigator: 'navigator',
  journey: 'class/:id/journey',
  guardian: 'guardian-profile',
  guardianInvites: 'invitees/approval',
  deeplinkTenantLogin: 'learner-login',
  universal: 'universal'
};

const ROUTER_EVENT_PATH = {
  login: 'login',
  username: 'loginWithUsername',
  tenant_username: 'loginWithTenantUsername',
  tenant_list: 'loginWithTenantList',
  tenant_url: 'loginWithTenantUrl',
  sign_up: 'signUp',
  categories_and_facets: 'categoriesAndFacets',
  class: 'class',
  activities: 'activities',
  milestone: 'milestone',
  home: 'home',
  proficiency: 'proficiency',
  student_home: 'studentHome',
  guardian_home: 'guardianHome',
  setup_not_completed: 'classSetupInComplete',
  class_activity: 'classActivity',
  items_to_grade: 'ItemsToGrade',
  player: 'player',
  study_player: 'studyPlayer',
  profile: 'profile',
  my_learner_identity: 'myLearnerIdentity',
  portfolio: 'portfolio',
  about_me: 'aboutMe',
  following: 'following',
  preferences: 'preferences',
  forgot_password: 'forgotPassword',
  course_map: 'courseMap',
  reset_password: 'resetPassword',
  email_verification: 'emailVerify',
  navigator: 'navigator',
  journey: 'journey',
  guardian: 'guardian-profile'
};

export function routerPath(pathname) {
  return ROUTER_PATH[pathname];
}

export function routerPathStartWithSlash(pathname) {
  return '/' + ROUTER_PATH[pathname];
}

export function routerPathIdReplace(pathname, id) {
  const path = ROUTER_PATH[pathname];
  return '/' + path.replace(':id', id);
}

export function routerEventPath(pathname) {
  let path = pathname;
  if (pathname.indexOf('-')) {
    path = pathname.replace('-', '_');
  }
  return ROUTER_EVENT_PATH[path];
}

export const PREDEFINED_ROUTERS = {
  CLASS_ACTIVITY: 'class-activity',
  MILESTONE: 'milestone',
  PROFICIENCY: 'proficiency',
  COURSEMAP: 'course-map'
};
