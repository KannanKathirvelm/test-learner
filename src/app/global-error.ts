import { ErrorHandler, Injectable } from '@angular/core';
import { ERROR_TYPES } from '@shared/constants/helper-constants';
import { ParseService } from '@shared/providers/service/parse/parse.service';
import { SessionService } from '@shared/providers/service/session/session.service';

@Injectable()
export class GlobalErrorHandler extends ErrorHandler {
  // -------------------------------------------------------------------------
  // Dependency Injection
  constructor(
    private parseService: ParseService,
    private sessionService: SessionService
  ) {
    super();
  }

  /**
   * @function handleError
   * This Method is used to log the error in the parse server
   */
  public handleError(error) {
    const userSession = this.sessionService.userSession;
    const userMessage = userSession
      ? `User ${userSession.user_id}`
      : 'User not logged in';
    let errorMessage = `${userMessage} - Error: `;
    if (error.message) {
      errorMessage = `${errorMessage}${error.message}`;
    } else {
      errorMessage = `${errorMessage} Unknow Error`;
    }
    // tslint:disable-next-line
    console.error(error);
    const isFatalError = error.message && !error.message.includes('HttpError');
    const errorType = isFatalError ? ERROR_TYPES.FATAL : ERROR_TYPES.NON_FATAL;
    this.parseService.trackErrorLog(errorType, errorMessage);
  }
}
