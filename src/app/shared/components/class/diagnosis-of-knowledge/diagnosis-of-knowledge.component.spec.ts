import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DiagnosisOfKnowledgeComponent } from './diagnosis-of-knowledge.component';

describe('DiagnosisOfKnowledgeComponent', () => {
  let component: DiagnosisOfKnowledgeComponent;
  let fixture: ComponentFixture<DiagnosisOfKnowledgeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiagnosisOfKnowledgeComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DiagnosisOfKnowledgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
