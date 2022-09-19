import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { IdentifyAccountPullupComponent } from './identify-account-pullup.component';

describe('IdentifyAccountPullupComponent', () => {
  let component: IdentifyAccountPullupComponent;
  let fixture: ComponentFixture<IdentifyAccountPullupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdentifyAccountPullupComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(IdentifyAccountPullupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
