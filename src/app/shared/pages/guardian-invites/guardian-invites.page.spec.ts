import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GuardianInvitesPage } from './guardian-invites.page';

describe('GuardianInvitesPage', () => {
  let component: GuardianInvitesPage;
  let fixture: ComponentFixture<GuardianInvitesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuardianInvitesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GuardianInvitesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
