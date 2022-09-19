import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { routerPath } from '@shared/constants/router-constants';
import { ClassActivityPage } from './class-activity.page';

const routes: Routes = [
  {
    path: routerPath('classActivity'),
    component: ClassActivityPage,
    children: [
      {
        path: routerPath('activities'),
        loadChildren: () => import('@shared/pages/class/class-activity/class-activities/class-activities.module').then(m => m.ClassActivityListModule)
      },
      {
        path: routerPath('ItemsToGrade'),
        loadChildren: () => import('@shared/pages/class/class-activity/items-to-grade/items-to-grade.module').then(m => m.ItemsToGradePageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClassActivityPageRoutingModule { }
