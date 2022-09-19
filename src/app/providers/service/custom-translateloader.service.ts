import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { TranslateLoader } from '@ngx-translate/core';
import { HttpService } from '@shared/providers/apis/http';
import { StorageService } from '@shared/providers/service/store.service';
import { Observable } from 'rxjs/Observable';

@Injectable({
  providedIn: 'root'
})
export class CustomTranslateLoader implements TranslateLoader {

  private namespace = 'api/nucleus/v2';

  constructor(
    private httpService: HttpService,
    private storageService: StorageService
  ) { }

  public getTranslation(lang: string) {
    const endpoint = `${this.namespace}/lookups/translation/labels`;
    const queryParams = {
      language: lang,
      app_id: environment.TRANSLATION_APP_ID
    };
    return new Observable((observer) => {
      if (lang === '') {
        observer.next({});
        observer.complete();
        return;
      }
      const translationKey = `translation_${lang}`;
      this.httpService.get(endpoint, queryParams).then((res) => {
        const translationLabels = res.data.translationLabels;
        this.storageService.setStorage(translationKey, translationLabels);
        observer.next(translationLabels);
        observer.complete();
      }, () => {
        this.storageService.getStorage(translationKey).then((translationLabels) => {
          observer.next(translationLabels);
          observer.complete();
        });
      });
    });
  }
}
