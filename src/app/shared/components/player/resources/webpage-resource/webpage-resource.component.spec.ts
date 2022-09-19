import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WebpageResourceComponent } from './webpage-resource.component';

describe('WebpageResourceComponent', () => {
  let component: WebpageResourceComponent;
  let fixture: ComponentFixture<WebpageResourceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebpageResourceComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(WebpageResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
