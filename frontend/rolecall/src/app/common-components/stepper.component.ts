import {animate, state, style, transition, trigger,
} from '@angular/animations';
import {Component, EventEmitter, Input, OnChanges, OnInit, Output,
} from '@angular/core';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  animations: [
    trigger('openClose', [
      state('open', style({
        right: '80vw'
      })),
      state('closed', style({
        right: '100vw'
      })),
      transition('open => closed', [
        animate('0.15s')
      ]),
      transition('closed => open', [
        animate('0.15s')
      ]),
    ]),
    trigger('openCloseButton', [
      state('open', style({
        right: 'calc(80vw - 4rem)'
      })),
      state('closed', style({
        right: 'calc(100vw - 4rem)'
      })),
      transition('open => closed', [
        animate('0.15s')
      ]),
      transition('closed => open', [
        animate('0.15s')
      ]),
    ]),
    trigger('openCloseIcon', [
      state('open', style({
        transform: 'rotate(90deg)'
      })),
      state('closed', style({
        transform: 'rotate(270deg)'
      })),
      transition('open => closed', [
        animate('0.15s')
      ]),
      transition('closed => open', [
        animate('0.15s')
      ]),
    ]),
  ]
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class Stepper implements OnInit, OnChanges {

  @Input() stepperOptions: string[];
  @Output() stepChange: EventEmitter<[number, string]> = new EventEmitter();
  currentStepIndex = 0;
  showOptions = false;
  isStepperOpen = true;

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnInit(): void {
    this.updateShow();
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnChanges(): void {
    this.updateShow();
  }

  updateShow = (): void => {
    this.showOptions = this.stepperOptions && this.stepperOptions.length > 0;
  };

  toggleStepper = (e: Event): void => {
    e.preventDefault();
    this.isStepperOpen = !this.isStepperOpen;
  };

  closeStepper = (): void => {
    this.isStepperOpen = false;
  };

  navigate = (index: number): void => {
    this.currentStepIndex = index;
    this.emitStep();
  };

  hasNextStep = (): boolean => {
    return this.stepperOptions && this.stepperOptions.length !== 0
      && this.currentStepIndex !== this.stepperOptions.length - 1;
  }

  hasPrevStep = (): boolean => {
    return this.stepperOptions && this.stepperOptions.length !== 0
      && this.currentStepIndex !== 0;
  }

  nextStep = (): boolean => {
    if (!this.hasNextStep()) {
      return false;
    }
    this.currentStepIndex++;
    this.emitStep();
    return true;
  };

  prevStep = (): boolean => {
    if (!this.hasPrevStep()) {
      return false;
    }
    this.currentStepIndex--;
    this.emitStep();
    return true;
  };

  emitStep = (): void => {
    this.stepChange.emit(
      [this.currentStepIndex, this.stepperOptions[this.currentStepIndex]]);
  };

}
