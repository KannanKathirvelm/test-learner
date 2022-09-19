import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AccountExistsPullupComponent } from './account-exists-pull-up.component';

describe('AccountExistsPullupComponent', () => {
  let component: AccountExistsPullupComponent;
  let fixture: ComponentFixture<AccountExistsPullupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountExistsPullupComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountExistsPullupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
