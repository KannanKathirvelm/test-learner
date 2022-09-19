import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { JoinClassCardComponent } from './join-class-card.component';

describe('JoinClassCardComponent', () => {
  let component: JoinClassCardComponent;
  let fixture: ComponentFixture<JoinClassCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JoinClassCardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(JoinClassCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
