import {
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { File } from '@ionic-native/file/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { UtilsService } from '@shared/providers/service/utils/utils.service';

@Component({
  selector: 'audio-recorder',
  templateUrl: './audio-recorder.component.html',
  styleUrls: ['./audio-recorder.component.scss'],
})
export class AudioRecorderComponent implements OnChanges {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public isStartRecording: boolean;
  @Input() public isStopRecording: boolean;
  @Output() public recordedAudio: EventEmitter<{ audioUrl: SafeUrl, audioBlob: Blob }> = new EventEmitter();
  public audio: MediaObject;
  public cdvPath: string;
  public isIosDevice: boolean;
  public audioPath: string;

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private utilsService: UtilsService,
    private dom: DomSanitizer,
    private media: Media,
    private file: File,
    private ngZone: NgZone
  ) {
    this.isIosDevice = !this.utilsService.isAndroid();
  }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.isStartRecording && changes.isStartRecording.currentValue) {
      this.startRecording();
    }
    if (changes.isStopRecording && changes.isStopRecording.currentValue) {
      this.stopRecording();
    }
  }

  /**
   * @function startRecording
   * This method is used to start recording
   */
  public startRecording() {
    try {
      let fileName = 'record' + new Date().getTime();
      if (this.isIosDevice) {
        fileName = fileName + '.m4a';
        this.audioPath = this.file.tempDirectory + fileName;
        this.file.createFile(this.file.tempDirectory, fileName, true).then((filePath) => {
          this.audio = this.media.create(this.audioPath.replace(/^file:\/\//, ''));
          this.audio.startRecord();
          this.cdvPath = filePath.toInternalURL();
        });
      } else {
        fileName = fileName + '.mp3';
        this.audioPath = this.file.externalDataDirectory + fileName;
        this.file.createFile(this.file.externalDataDirectory, fileName, true).then((filePath) => {
          this.audio = this.media.create(this.audioPath.replace(/file:\/\//g, ''));
          this.audio.startRecord();
          this.cdvPath = filePath.toInternalURL();
        });
      }
    } catch (error) {
      // tslint:disable-next-line
      console.log(error);
    }
  }

  /**
   * @function stopRecording
   * This method is used to stop recording
   */
  public stopRecording() {
    if (this.audio) {
      this.audio.stopRecord();
      this.readAudio();
    }
  }

  /**
   * @function readAudio
   * This method is used to read audio
   */
  public readAudio() {
    try {
      this.audio = this.media.create(this.audioPath);
      this.readFileBlob();
    } catch (error) {
      // tslint:disable-next-line
      console.log(error);
    }
  }

  /**
   * @function readFileBlob
   * This method is used to read file blob
   */
  public readFileBlob() {
    this.makeFileIntoBlob(this.cdvPath).then((blob: Blob) => {
      this.ngZone.run(() => {
        const audioURL = URL.createObjectURL(blob);
        const audioUrl = this.dom.bypassSecurityTrustUrl(audioURL);
        const audioBlob: Blob = blob;
        this.recordedAudio.emit({ audioUrl, audioBlob });
      });
    });
  }

  /**
   * @function makeFileIntoBlob
   * This method is used to make file to blob
   */
  public makeFileIntoBlob(filePath) {
    return new Promise((resolve, reject) => {
      let fileName, fileExtension = '';
      this.file.resolveLocalFilesystemUrl(filePath)
        .then(fileEntry => {
          const { name, nativeURL } = fileEntry;
          const path = nativeURL.substring(0, nativeURL.lastIndexOf('/'));
          fileName = name;
          fileExtension = fileName.match(/\.[A-z0-9]+$/i)[0].slice(1);
          return this.file.readAsArrayBuffer(path, name);
        })
        .then(buffer => {
          const medBlob = new Blob([buffer], {
            type: `audio/${fileExtension}`
          });
          resolve(medBlob);
        })
        .catch(e => reject(e));
    });
  }
}
