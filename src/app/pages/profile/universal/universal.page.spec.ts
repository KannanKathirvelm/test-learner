import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UniversalPage } from './universal.page';

describe('UniversalPage', () => {
  let component: UniversalPage;
  let fixture: ComponentFixture<UniversalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UniversalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UniversalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
