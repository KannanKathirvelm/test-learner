import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyLearnerIdentityPage } from './my-learner-identity.page';

describe('MyLearnerIdentityPage', () => {
  let component: MyLearnerIdentityPage;
  let fixture: ComponentFixture<MyLearnerIdentityPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyLearnerIdentityPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyLearnerIdentityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
