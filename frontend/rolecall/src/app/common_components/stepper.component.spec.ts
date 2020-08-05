import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Stepper } from './stepper.component';


describe('StepperComponent', () => {
  let component: Stepper;
  let fixture: ComponentFixture<Stepper>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [Stepper]
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
