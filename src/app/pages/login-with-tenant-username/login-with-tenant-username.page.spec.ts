import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LoginWithTenantUsernamePage } from './login-with-tenant-username.page';

describe('LoginWithTenantUsernamePage', () => {
  let component: LoginWithTenantUsernamePage;
  let fixture: ComponentFixture<LoginWithTenantUsernamePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginWithTenantUsernamePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginWithTenantUsernamePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
