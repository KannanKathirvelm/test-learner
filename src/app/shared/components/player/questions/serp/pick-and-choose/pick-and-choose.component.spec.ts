import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PickAndChooseComponent } from './pick-and-choose.component';

describe('PickAndChooseComponent', () => {
  let component: PickAndChooseComponent;
  let fixture: ComponentFixture<PickAndChooseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PickAndChooseComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PickAndChooseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
