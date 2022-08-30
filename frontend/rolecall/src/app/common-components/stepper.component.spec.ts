import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Dashboard } from '../homepage/dashboard.component';
import { Stepper } from './stepper.component';

describe('StepperComponent', () => {
  let component: Stepper;
  let fixture: ComponentFixture<Stepper>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
          declarations: [
            Dashboard,
            Stepper,
          ],
          imports: [
            MatIconModule,
            MatFormFieldModule,
            NoopAnimationsModule,
          ]
        })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Stepper);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
