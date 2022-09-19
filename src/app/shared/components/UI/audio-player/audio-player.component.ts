import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

@Component({
  selector: 'audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
})
export class AudioPlayerComponent implements OnChanges {

  // -------------------------------------------------------------------------
  // Properties

  @Input() public isStopAudio: boolean;
  @Input() public isPlayAudio: boolean;
  @Input() public audioUrl: string;
  @Input() public audioIndex: number;
  @Input() public timerDuration: number;
  @Output() public audioEnded = new EventEmitter();

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private elementReference: ElementRef) { }

  // -------------------------------------------------------------------------
  // Methods

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.isStopAudio && changes.isStopAudio.currentValue) {
      this.stopAudio();
    }
    if (changes.isPlayAudio && changes.isPlayAudio.currentValue) {
      this.playAudio();
    }
  }

  /**
   * @function stopAudio
   * This method is used to start recording
   */
  public stopAudio() {
    const audioElementRef = this.getAudioElement();
    if (audioElementRef) {
      audioElementRef.pause();
    }
  }

  /**
   * @function playAudio
   * This method is used to stop recording
   */
  public playAudio() {
    const nativeElement = this.elementReference.nativeElement;
    const audioElementRef = this.getAudioElement();
    const progressBar = nativeElement.querySelector(`.audio-player-${this.audioIndex} .progress-filling`);
    audioElementRef.play();
    audioElementRef.addEventListener('ended', () => {
      progressBar.style.width = '0';
      this.audioEnded.emit();
    });
    const timerDuration = this.timerDuration;
    audioElementRef.ontimeupdate = function() {
      const duration = audioElementRef.duration === Infinity ? timerDuration : audioElementRef.duration;
      if (progressBar) {
        progressBar.style.width = `${audioElementRef.currentTime / duration * 100}%`;
      }
    };
  }

  /**
   * @function getAudioElement
   * This method is used to get audio element
   */
  public getAudioElement() {
    return this.elementReference.nativeElement.querySelector(`.audio-player-${this.audioIndex} .audio-container`);
  }
}
