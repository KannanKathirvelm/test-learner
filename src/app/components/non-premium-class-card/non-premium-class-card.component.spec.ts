import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NonPremiumClassCardComponent } from './non-premium-class-card.component';

describe('NonPremiumClassCardComponent', () => {
  let component: NonPremiumClassCardComponent;
  let fixture: ComponentFixture<NonPremiumClassCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NonPremiumClassCardComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NonPremiumClassCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
