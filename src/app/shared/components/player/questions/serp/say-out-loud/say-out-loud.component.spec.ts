import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SayOutLoudComponent } from './say-out-loud.component';

describe('SayOutLoudComponent', () => {
  let component: SayOutLoudComponent;
  let fixture: ComponentFixture<SayOutLoudComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SayOutLoudComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SayOutLoudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
