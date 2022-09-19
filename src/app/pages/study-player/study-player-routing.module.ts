import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StudyPlayerPage } from './study-player.page';

const routes: Routes = [
  {
    path: '',
    component: StudyPlayerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudyPlayerPageRoutingModule {}
