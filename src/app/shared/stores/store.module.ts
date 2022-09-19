import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { clearState } from '@shared/stores/logout.reset';
import { reducers } from '@shared/stores/reducers';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forRoot(reducers, { metaReducers: [clearState] })
  ],
  declarations: [],
})
export class ShareStoreModule { }
