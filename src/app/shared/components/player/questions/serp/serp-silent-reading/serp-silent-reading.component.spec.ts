import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SerpSilentReadingComponent } from './serp-silent-reading.component';

describe('SerpSilentReadingComponent', () => {
  let component: SerpSilentReadingComponent;
  let fixture: ComponentFixture<SerpSilentReadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SerpSilentReadingComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SerpSilentReadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
