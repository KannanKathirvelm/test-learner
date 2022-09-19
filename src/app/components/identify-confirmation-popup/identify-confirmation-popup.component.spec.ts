import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { IdentifyConfirmationPopupComponent } from './identify-confirmation-popup.component';

describe('IdentifyConfirmationPopupComponent', () => {
  let component: IdentifyConfirmationPopupComponent;
  let fixture: ComponentFixture<IdentifyConfirmationPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdentifyConfirmationPopupComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(IdentifyConfirmationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
