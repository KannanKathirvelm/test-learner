import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GuardianPage } from './guardian.page';

describe('GuardianPage', () => {
  let component: GuardianPage;
  let fixture: ComponentFixture<GuardianPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuardianPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GuardianPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
