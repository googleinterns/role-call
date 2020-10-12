import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';

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
export class Stepper implements OnInit, OnChanges {

  @Input() stepperOptions: string[];
  @Output() stepChange: EventEmitter<[number, string]> = new EventEmitter();
  currentStepIndex = 0;
  showOptions = false;
  isStepperOpen = true;

  ngOnInit() {
    this.updateShow();
  }

  ngOnChanges() {
    this.updateShow();
  }

  updateShow() {
    this.showOptions = this.stepperOptions && this.stepperOptions.length > 0;
  }

  toggleStepper(e) {
    e.preventDefault();
    this.isStepperOpen = !this.isStepperOpen;
  }
  closeStepper() {
    this.isStepperOpen = false;
  }
  navigate(index: number) {
    this.currentStepIndex = index;
    this.emitStep();
  }

  nextStep(): boolean {
    if (!this.stepperOptions || this.stepperOptions.length == 0 || this.currentStepIndex == this.stepperOptions.length - 1) {
      return false;
    }
    this.currentStepIndex++;
    this.emitStep();
    return true;
  }

  prevStep(): boolean {
    if (!this.stepperOptions || this.stepperOptions.length == 0 || this.currentStepIndex == 0) {
      return false;
    }
    this.currentStepIndex--;
    this.emitStep();
    return true;
  }

  emitStep() {
    this.stepChange.emit([this.currentStepIndex, this.stepperOptions[this.currentStepIndex]]);
  }

}
