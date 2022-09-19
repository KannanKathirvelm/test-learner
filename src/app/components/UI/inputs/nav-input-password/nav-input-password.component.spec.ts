import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NavInputPasswordComponent } from './nav-input-password.component';

describe('GruInputPasswordComponent', () => {
    let component: NavInputPasswordComponent;
    let fixture: ComponentFixture<NavInputPasswordComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [NavInputPasswordComponent],
            imports: [IonicModule.forRoot()],
        }).compileComponents();

        fixture = TestBed.createComponent(NavInputPasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
