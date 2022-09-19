import { Component, EventEmitter, Input, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { TranslateService } from '@ngx-translate/core';
import { CollectionsModel } from '@shared/models/collection/collection';
import { LearningToolsModel } from '@shared/models/learning-tools/learning-tools';
import { PlayerContextModel } from '@shared/models/player/player';
import { CollectionPlayerService } from '@shared/providers/service/player/collection-player.service';
import { ToastService } from '@shared/providers/service/toast.service';
import { roundMilliseconds } from '@shared/utils/global';
import * as moment from 'moment';

@Component({
  selector: 'assessment-external',
  templateUrl: './assessment-external.component.html',
  styleUrls: ['./assessment-external.component.scss'],
})
export class AssessmentExternalComponent implements OnInit {
  // -------------------------------------------------------------------------
  // Properties
  @Input() public context: PlayerContextModel;
  @Input() public collection: CollectionsModel;
  @Input() public disableConfirmBtn: boolean;
  @Input() public isLuContent: boolean;
  @Input() public learningTools: LearningToolsModel;
  @Input() public eventId: string;
  public onLUContentStart: EventEmitter<string> = new EventEmitter();
  public onConfirmAnswer: EventEmitter<string> = new EventEmitter();
  public showScoreEntry: boolean;
  public isConfirmed: boolean;
  public performanceEntryForm: FormGroup;

  // -------------------------------------------------------------------------
  // Dependency
  constructor(private zone: NgZone, private inAppBrowser: InAppBrowser, private collectionPlayerService: CollectionPlayerService,
              private formBuilder: FormBuilder, private toastService: ToastService, private translate: TranslateService) {
    this.showScoreEntry = false;
    this.isConfirmed = false;
    this.performanceEntryForm = this.formBuilder.group({
      score: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      minutes: ['', [Validators.required, Validators.min(0), Validators.max(60)]],
      seconds: ['', [Validators.required, Validators.min(0), Validators.max(60)]]
    });
  }

  public ngOnInit() {
    if (!this.collection.url) {
      this.displayMessage('EXTERNAL_COLLECTION_PLAY_ERROR');
    }
  }

  /*
   * This method is used to display the error message
   */
  public displayMessage(errorMessageKey) {
    this.translate.get(errorMessageKey).subscribe((value) => {
      this.toastService.presentToast(value);
    });
  }

  /**
   * @function onPlay
   * This method will trigger when user clicks on play
   */
  public onPlay() {
    if (this.isLuContent) {
      this.onLUContentStart.emit(this.collection.id);
    } else {
      const startTime = moment().valueOf();
      const browser = this.inAppBrowser.create(this.collection.url, '_blank');
      browser.on('exit').subscribe(() => {
        this.zone.run(() => {
          this.showScoreEntry = true;
        });
        const endTime = moment().valueOf();
        const totalMs = startTime - endTime;
        const duration = moment.duration(totalMs);
        const minutes = Math.abs(duration.minutes());
        const seconds = Math.abs(duration.seconds());
        this.performanceEntryForm.controls.minutes.setValue(minutes);
        this.performanceEntryForm.controls.seconds.setValue(seconds);
      });
    }
  }

  /**
   * @function onConfirm
   * This method will trigger when user clicks on confirm
   */
  public onConfirm() {
    this.isConfirmed = true;
    if (this.performanceEntryForm.valid) {
      const minutes = this.performanceEntryForm.get('minutes').value;
      const seconds = this.performanceEntryForm.get('seconds').value;
      const score = this.performanceEntryForm.get('score').value;
      const timespent = roundMilliseconds(minutes, seconds);
      this.collectionPlayerService.postSelfReport(this.collection, this.context, score, timespent).then((sessionId) => {
        this.onConfirmAnswer.emit(sessionId);
      });
    }
  }
}
