import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class TranslationService {

  // -------------------------------------------------------------------------
  // Properties

  private readonly DEFAULT_LANGUAGE = 'en';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private storage: Storage, private translate: TranslateService) { }

  /**
   * @function initTranslate
   * This Method is used to initialise the translation
   */
  public initTranslate() {
    this.getLanguage().then((language) => {
      this.translate.setDefaultLang(language);
      const browserLang = this.translate.getBrowserLang();
      if (browserLang) {
        if (browserLang === 'zh') {
          const browserCultureLang = this.translate.getBrowserCultureLang();
          if (browserCultureLang.match(/-CN|CHS|Hans/i)) {
            this.translate.use('zh-cmn-Hans');
          } else if (browserCultureLang.match(/-TW|CHT|Hant/i)) {
            this.translate.use('zh-cmn-Hant');
          }
        } else {
          this.translate.use(language);
        }
      } else {
        this.translate.use(language);
      }
    });
  }

  /**
   * @function getLanguage
   * This Method is used to get and set the language
   */
  public getLanguage() {
    return this.storage.get('nav_preferred_language').then((language) => {
      if (!language) {
        language = this.DEFAULT_LANGUAGE;
        this.setLanguage(this.DEFAULT_LANGUAGE);
      }
      return language;
    });
  }

  /**
   * @function setLanguage
   * This Method is used to store the selected language
   */
  public setLanguage(language) {
    this.storage.set('nav_preferred_language', language);
  }
}
