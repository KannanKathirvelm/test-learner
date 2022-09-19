import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StudyPlayerPage } from './study-player.page';

describe('StudyPlayerPage', () => {
  let component: StudyPlayerPage;
  let fixture: ComponentFixture<StudyPlayerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyPlayerPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StudyPlayerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
