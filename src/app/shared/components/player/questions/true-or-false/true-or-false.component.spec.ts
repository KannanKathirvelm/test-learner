import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TrueOrFalseComponent } from './true-or-false.component';

describe('TrueOrFalseComponent', () => {
  let component: TrueOrFalseComponent;
  let fixture: ComponentFixture<TrueOrFalseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrueOrFalseComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TrueOrFalseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
