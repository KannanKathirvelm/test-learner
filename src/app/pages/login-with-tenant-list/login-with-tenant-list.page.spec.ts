import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LoginWithTenantListPage } from './login-with-tenant-list.page';

describe('LoginWithTenantListPage', () => {
  let component: LoginWithTenantListPage;
  let fixture: ComponentFixture<LoginWithTenantListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginWithTenantListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginWithTenantListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
