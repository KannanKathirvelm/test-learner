import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CompetencyCompletionStatsComponent } from './competency-completion-stats.component';

describe('CompetencyCompletionStatsComponent', () => {
  let component: CompetencyCompletionStatsComponent;
  let fixture: ComponentFixture<CompetencyCompletionStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompetencyCompletionStatsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CompetencyCompletionStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
