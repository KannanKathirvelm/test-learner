import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SubProgramComponent } from './sub-program.component';

describe('SubProgramComponent', () => {
  let component: SubProgramComponent;
  let fixture: ComponentFixture<SubProgramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubProgramComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SubProgramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
