import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { routerPath } from '@shared/constants/router-constants';
import { AppAuthGuard } from './app.auth.guard';
import { LoginAuthGuardService } from './login.auth.guard';


const routes: Routes = [
  {
    path: '',
    redirectTo: routerPath('login'),
    pathMatch: 'full'
  },
  {
    path: routerPath('login'),
    canActivate: [LoginAuthGuardService],
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: routerPath('loginWithUsername'),
    canActivate: [LoginAuthGuardService],
    loadChildren: () => import('@pages/login-with-username/login-with-username.module').then(m => m.LoginWithUsernamePageModule)
  },
  {
    path: routerPath('loginWithTenantUsername'),
    canActivate: [LoginAuthGuardService],
    loadChildren: () => import('@pages/login-with-tenant-username/login-with-tenant-username.module').then(m => m.LoginWithTenantUsernamePageModule)
  },
  {
    path: routerPath('loginWithTenantUrl'),
    canActivate: [LoginAuthGuardService],
    loadChildren: () => import('@pages/login-with-tenant-url/login-with-tenant-url.module').then(m => m.LoginWithTenantUrlPageModule)
  },
  {
    path: routerPath('deeplinkTenantLogin'),
    canActivate: [LoginAuthGuardService],
    loadChildren: () => import('@pages/login-with-tenant-url/login-with-tenant-url.module').then(m => m.LoginWithTenantUrlPageModule)
  },
  {
    path: routerPath('loginWithTenantList'),
    canActivate: [LoginAuthGuardService],
    loadChildren: () => import('@pages/login-with-tenant-list/login-with-tenant-list.module').then(m => m.LoginWithTenantListPageModule)
  },
  {
    path: routerPath('categoriesAndFacets'),
    loadChildren: () => import('@pages/categories-and-facets/categories-and-facets.module').then(m => m.CategoriesAndFacetsPageModule)
  },
  {
    path: routerPath('signUp'),
    canActivate: [LoginAuthGuardService],
    loadChildren: () => import('@pages/sign-up/sign-up.module').then(m => m.SignUpPageModule)
  },
  {
    path: routerPath('class'),
    canActivate: [AppAuthGuard],
    loadChildren: () => import('@shared/pages/class/class.module').then(m => m.ClassPageModule)
  },
  {
    path: routerPath('studentHome'),
    canActivate: [AppAuthGuard],
    loadChildren: () => import('@pages/student-home/student-home.module').then(m => m.StudentHomePageModule)
  },
  {
    path: routerPath('studyPlayer'),
    canActivate: [AppAuthGuard],
    loadChildren: () => import('@pages/study-player/study-player.module').then(m => m.StudyPlayerPageModule)
  },
  {
    path: routerPath('player'),
    // canActivate: [AppAuthGuard],
    loadChildren: () => import('@shared/pages/player/player.module').then(m => m.PlayerPageModule)
  },
  {
    path: routerPath('profile'),
    canActivate: [AppAuthGuard],
    loadChildren: () => import('@pages/profile/profile.module').then(m => m.ProfilePageModule)
  },
  {
    path: routerPath('myLearnerIdentity'),
    canActivate: [AppAuthGuard],
    loadChildren: () => import('@shared/pages/my-learner-identity/my-learner-identity.module').then(m => m.MyLearnerIdentityPageModule)
  },
  {
    path: routerPath('portfolio'),
    canActivate: [AppAuthGuard],
    loadChildren: () => import('@shared/pages/portfolio/portfolio.module').then(m => m.PortfolioPageModule)
  },
  {
    path: routerPath('forgotPassword'),
    loadChildren: () => import('@pages/forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule)
  },
  {
    path: routerPath('resetPassword'),
    loadChildren: () => import('@shared/pages/reset-password/reset-password.module').then(m => m.ResetPasswordPageModule)
  },
  {
    path: routerPath('emailVerify'),
    loadChildren: () => import('@shared/pages/email-verify/email-verify.module').then(m => m.EmailVerifyPageModule)
  },
  {
    path: routerPath('guardianInvites'),
    loadChildren: () => import('@shared/pages/guardian-invites/guardian-invites.module').then(m => m.GuardianInvitesPageModule)
  },
  {
    path: routerPath('navigator'),
    loadChildren: () => import('@pages/navigator/navigator.module').then(m => m.NavigatorPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRouterModule { }
