import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { YouTubePlayerFullscreenComponent } from './youtube-player-fullscreen.component';

describe('YouTubePlayerFullscreenComponent', () => {
  let component: YouTubePlayerFullscreenComponent;
  let fixture: ComponentFixture<YouTubePlayerFullscreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [YouTubePlayerFullscreenComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(YouTubePlayerFullscreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
