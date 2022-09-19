import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProficiencyPage } from './proficiency.page';

describe('ProficiencyPage', () => {
  let component: ProficiencyPage;
  let fixture: ComponentFixture<ProficiencyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProficiencyPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProficiencyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
