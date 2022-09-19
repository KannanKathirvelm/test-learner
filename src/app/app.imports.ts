// Providers
import { AuthProvider } from '@providers/apis/auth/auth';
import { FeedbackService } from '@shared/providers/service/feedback/feedback.service';
import { PopoverService } from '@shared/providers/service/popover.service';
import { AppAuthGuard } from './app.auth.guard';
import { AppLogout } from './app.logout';

// Modules
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentsModule } from '@components/components.module';
import { ApplicationPipesModule } from '@pipes/application-pipes.module';
import { SharedModule } from '@shared/shared.module';
import { ShareStoreModule } from '@shared/stores/store.module';
import { DragulaModule, DragulaService } from 'ng2-dragula';
import { AppRouterModule } from './app.router.module';

export const MODULES = [
  BrowserModule,
  AppRouterModule,
  HttpClientModule,
  ApplicationPipesModule,
  ComponentsModule,
  BrowserAnimationsModule,
  ShareStoreModule,
  SharedModule,
  DragulaModule
];

export const PROVIDERS = [
  // Rest Client providers
  AuthProvider,
  AppLogout,
  AppAuthGuard,
  FeedbackService,
  PopoverService,
  DragulaService
];
