import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReefComponent } from './reef.component';

describe('ReefComponent', () => {
  let component: ReefComponent;
  let fixture: ComponentFixture<ReefComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReefComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
