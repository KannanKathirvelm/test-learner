import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LoginWithTenantUrlPage } from './login-with-tenant-url.page';

describe('LoginWithTenantUrlPage', () => {
  let component: LoginWithTenantUrlPage;
  let fixture: ComponentFixture<LoginWithTenantUrlPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginWithTenantUrlPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginWithTenantUrlPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
