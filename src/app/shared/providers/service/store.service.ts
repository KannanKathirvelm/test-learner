import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class StorageService {
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private storage: Storage) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function setStorage
   * This Method is used to set the storage data
   */
  public setStorage(storagekey, translation) {
    this.storage.set(storagekey, translation);
  }

  /**
   * @function getStorage
   * This Method is used to get the the storage data
   */
  public getStorage(storagekey) {
    return this.storage.get(storagekey);
  }
}
