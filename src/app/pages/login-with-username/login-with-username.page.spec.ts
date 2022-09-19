import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LoginWithUsernamePage } from './login-with-username.page';

describe('LoginWithUsernamePage', () => {
  let component: LoginWithUsernamePage;
  let fixture: ComponentFixture<LoginWithUsernamePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginWithUsernamePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginWithUsernamePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
