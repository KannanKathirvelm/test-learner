import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OaTaskSubmissionsComponent } from './oa-task-submissions.component';

describe('OaTaskSubmissions', () => {
    let component: OaTaskSubmissionsComponent;
    let fixture: ComponentFixture<OaTaskSubmissionsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OaTaskSubmissionsComponent],
            imports: [IonicModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(OaTaskSubmissionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
