import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EmailVerifyPage } from './email-verify.page';

describe('EmailVerifyPage', () => {
  let component: EmailVerifyPage;
  let fixture: ComponentFixture<EmailVerifyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailVerifyPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EmailVerifyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
