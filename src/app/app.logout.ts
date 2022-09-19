import { Store } from '@ngrx/store';
import { AuthProvider } from '@providers/apis/auth/auth';
import { LoadingService } from '@shared/providers/service/loader.service';
import { SessionService } from '@shared/providers/service/session/session.service';
import { Logout } from '@shared/stores/logout.reset';

export class AppLogout {

  constructor(
    private store: Store,
    private authProvider: AuthProvider,
    private sessionService: SessionService,
    private loader: LoadingService
  ) { }

  public execute() {
    this.loader.displayLoader();
    this.authProvider.revokeRefreshToken().then(() => {
      this.authProvider.signOut().then(() => {
        this.sessionService.sessionInValidate();
        this.store.dispatch(new Logout());
      });
    }).finally(() => {
      this.loader.dismissLoader();
    });
  }
}
