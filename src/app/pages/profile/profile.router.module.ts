import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { routerPath } from '@shared/constants/router-constants';

import { ProfilePage } from './profile.page';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage,
    children: [
      {
        path: routerPath('aboutMe'),
        loadChildren: () => import('@pages/profile/about-me/about-me.module').then(m => m.AboutMePageModule)
      },
      {
        path: routerPath('preferences'),
        loadChildren: () => import('@pages/profile/preferences/preferences.module').then(m => m.PreferencesPageModule)
      },
      {
        path: routerPath('guardian'),
        loadChildren: () => import('@pages/profile/guardian/guardian.module').then(m => m.GuardianPageModule)
      },
      {
        path: routerPath('universal'),
        loadChildren: () => import('@pages/profile/universal/universal.module').then(m => m.UniversalPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilePageRouterModule { }
