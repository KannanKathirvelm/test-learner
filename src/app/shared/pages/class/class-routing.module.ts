import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClassPage } from './class.page';

const routes: Routes = [
  {
    path: '',
    component: ClassPage,
    children: [
      {
        path: '',
        loadChildren: () => import('@shared/pages/class/class-activity/class-activity.module').then(m => m.ClassActivityPageModule)
      },
      {
        path: 'proficiency',
        loadChildren: () => import('@shared/pages/class/proficiency/proficiency.module').then(m => m.ProficiencyPageModule)
      }
    ]
  },
  {
    path: 'home',
    loadChildren: () => import('@shared/pages/class/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'journey',
    loadChildren: () => import('@shared/pages/class/journey/journey.module').then(m => m.JourneyPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class ClassPageRoutingModule { }
