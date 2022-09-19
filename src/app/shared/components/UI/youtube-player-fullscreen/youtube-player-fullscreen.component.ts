import { Component, OnInit } from '@angular/core';
import { environment } from '@environment/environment';
import { ModalController, NavParams } from '@ionic/angular';
import { CollectionPlayerService } from '@shared/providers/service/player/collection-player.service';
import Player from '@vimeo/player';

@Component({
  selector: 'youtube-player-fullscreen',
  templateUrl: './youtube-player-fullscreen.component.html',
  styleUrls: ['./youtube-player-fullscreen.component.scss']
})
export class YouTubePlayerFullscreenComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Properties

  public videoId: string;
  public currentPlayTime: number;
  public player: Player;

  constructor(private modalCtrl: ModalController, private navParams: NavParams, private collectionPlayerService: CollectionPlayerService) {
    this.videoId = this.navParams.get('videoId');
    this.currentPlayTime = this.navParams.get('currentPlayTime');
  }

  // -------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    this.init();
  }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function init
   * This method is used to initialize the youtube player
   */
  public init() {
    const doc = document;
    const tag = doc.createElement('script');
    tag.src = environment.YOUTUBE_IFRAME_API;
    const firstScriptTag = doc.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    this.startVideo();
  }

  /**
   * @function startVideo
   * This method triggered when the youTube api is ready
   */
  public startVideo() {
    this.collectionPlayerService.getYoutubePlayer().then((YT) => {
      this.player = new YT['Player']('player', {
        videoId: this.videoId,
        playerVars: {
          fs: 0,
          rel: 0,
          autoplay: 1,
          playsinline: 1,
          start: this.currentPlayTime,
          controls: 1,
          showinfo: 0
        }
      });
    });
  }

  /**
   * @function onClose
   * This method triggered when the user close the model
   */
  public onClose() {
    const currentPlayTime = Math.round(this.player.getCurrentTime());
    this.modalCtrl.dismiss({
      currentPlayTime
    });
  }
}
