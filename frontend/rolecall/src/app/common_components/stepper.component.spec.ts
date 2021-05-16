import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {Stepper} from './stepper.component';

describe('StepperComponent', () => {
  let component: Stepper;
  let fixture: ComponentFixture<Stepper>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
          declarations: [Stepper],
          imports: [
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
