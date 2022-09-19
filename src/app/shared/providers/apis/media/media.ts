import { Injectable } from '@angular/core';
import { HttpService } from '@shared/providers/apis/http';
@Injectable({
  providedIn: 'root'
})

export class MediaAPI {

  constructor(private http: HttpService) { }

  // Properties
  /**
   * @property {string} namespace
   * Property for uploads namespace
   */
  private namespace = 'api/nucleus-media/v1/uploads';

  public uploadContentFile(file: any, type: string = 'content', isAudio = false) {
    const formData = new FormData();
    if (isAudio) {
      formData.append('file', file, 'blob.mp3');
    } else {
      formData.append('file', file);
    }
    formData.append('entity_type', type);
    return this.http.postUsingAxios(this.namespace, formData);
  }
}
