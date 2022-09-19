import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PullUpWithDynamicHeightComponent } from './pullup-with-dynamic-height.component';

describe('PullUpWithDynamicHeightComponent', () => {
  let component: PullUpWithDynamicHeightComponent;
  let fixture: ComponentFixture<PullUpWithDynamicHeightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PullUpWithDynamicHeightComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PullUpWithDynamicHeightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
