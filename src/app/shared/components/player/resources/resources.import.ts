import { AudioResourceComponent } from '@shared/components/player/resources/audio-resource/audio-resource.component';
import { ImageResourceComponent } from '@shared/components/player/resources/image-resource/image-resource.component';
import { InteractiveResourceComponent } from '@shared/components/player/resources/interactive-resource/interactive-resource.component';
import { InteractiveSliderComponent } from '@shared/components/player/resources/interactive-slider/interactive-slider.component';
import { InteractiveVideosComponent } from '@shared/components/player/resources/interactive-videos/interactive-videos.component';
import { TextResourceComponent } from '@shared/components/player/resources/text-resource/text-resource.component';
import { VideoResourceComponent } from '@shared/components/player/resources/video-resource/video-resource.component';
import { WebpageResourceComponent } from '@shared/components/player/resources/webpage-resource/webpage-resource.component';

export const RESOURCES = [
  AudioResourceComponent,
  ImageResourceComponent,
  InteractiveResourceComponent,
  TextResourceComponent,
  WebpageResourceComponent,
  VideoResourceComponent,
  InteractiveSliderComponent,
  InteractiveVideosComponent
];


export const RESOURCE_TYPES = {
  audio_resource: AudioResourceComponent,
  image_resource: ImageResourceComponent,
  interactive_resource: InteractiveResourceComponent,
  text_resource: TextResourceComponent,
  webpage_resource: WebpageResourceComponent,
  video_resource: VideoResourceComponent,
  h5p_interactive_slide: InteractiveSliderComponent,
  h5p_interactive_video: InteractiveVideosComponent
};
