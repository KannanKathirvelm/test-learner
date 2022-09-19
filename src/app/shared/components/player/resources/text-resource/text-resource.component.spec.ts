import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TextResourceComponent } from './text-resource.component';

describe('TextResourceComponent', () => {
  let component: TextResourceComponent;
  let fixture: ComponentFixture<TextResourceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextResourceComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TextResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
