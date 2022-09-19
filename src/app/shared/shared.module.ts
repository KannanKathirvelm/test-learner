// Providers
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslationService } from '@providers/service/translation.service';
import { SharedComponentModule } from '@shared/components/shared.component.module';
import { SharedApplicationDirectivesModule } from '@shared/directives/shared-application-directives.module';
import { SharedApplicationPipesModule } from '@shared/pipes/shared-application-pipes.module';
import { HttpService } from '@shared/providers/apis/http';
import { NavigateProvider } from '@shared/providers/apis/navigate/navigate';
import { AppService } from '@shared/providers/service/app.service';
import { ClassActivityService } from '@shared/providers/service/class-activity/class-activity.service';
import { ClassService } from '@shared/providers/service/class/class.service';
import { LoadingService } from '@shared/providers/service/loader.service';
import { ModalService } from '@shared/providers/service/modal.service';
import { ParseService } from '@shared/providers/service/parse/parse.service';
import { CollectionPlayerService } from '@shared/providers/service/player/collection-player.service';
import { PlayerService } from '@shared/providers/service/player/player.service';
import { SessionService } from '@shared/providers/service/session/session.service';
import { StorageService } from '@shared/providers/service/store.service';
import { ToastService } from '@shared/providers/service/toast.service';
import { ShareStoreModule } from '@shared/stores/store.module';

// Modules
import { CalendarModule } from 'primeng/calendar';

// Ionic native providers
import { AppLauncher } from '@ionic-native/app-launcher/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { Device } from '@ionic-native/device/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Dialogs } from '@ionic-native/dialogs/ngx';
import { File } from '@ionic-native/file/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Market } from '@ionic-native/market/ngx';
import { Media } from '@ionic-native/media/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ShareStoreModule,
    SharedComponentModule,
    SharedApplicationPipesModule,
    CalendarModule,
    SharedApplicationDirectivesModule
  ],
  providers: [
    StorageService,
    HttpService,
    LoadingService,
    ModalService,
    ToastService,
    TranslationService,
    ClassActivityService,
    ClassService,
    ParseService,
    NavigateProvider,
    AppService,
    CollectionPlayerService,
    PlayerService,
    ScreenOrientation,
    Dialogs,
    SpinnerDialog,
    Market,
    SocialSharing,
    Deeplinks,
    AppLauncher,
    Clipboard,
    InAppBrowser,
    Device,
    Keyboard,
    StatusBar,
    SplashScreen,
    SessionService,
    HTTP,
    Media,
    File,
    Diagnostic
  ]
})
export class SharedModule { }
