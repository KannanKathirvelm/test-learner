import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { FirebaseDynamicLinks } from '@ionic-native/firebase-dynamic-links/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomTranslateLoader } from '@providers/service/custom-translateloader.service';
import { HttpService } from '@shared/providers/apis/http';
import { SessionService } from '@shared/providers/service/session/session.service';
import { StorageService } from '@shared/providers/service/store.service';
import { AppComponent } from './app.component';
import { MODULES, PROVIDERS } from './app.imports';
import { GlobalErrorHandler } from './global-error';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    MODULES,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: CustomTranslateLoader,
        deps: [HttpService, StorageService]
      }
    }),
    BrowserAnimationsModule
  ],
  providers: [
    PROVIDERS,
    {
      provide: APP_INITIALIZER,
      useFactory: (sessionService: SessionService) => function() {
        return sessionService.initSession();
      },
      deps: [SessionService],
      multi: true
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    },
    FirebaseDynamicLinks
  ],
  exports: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
