import { Component, OnInit, ViewChild } from '@angular/core';
import { Performance, PerformanceApi } from '../api/performance-api.service';
import { Stepper } from '../common_components/stepper.component';

@Component({
  selector: 'app-performance-editor',
  templateUrl: './performance-editor.component.html',
  styleUrls: ['./performance-editor.component.scss']
})
export class PerformanceEditor implements OnInit {

  @ViewChild('stepper') stepper: Stepper;
  stepperOpts = ["Performance Details", "Pieces & Intermissions", "Fill Casts", "Finalize"];

  state: Performance;

  constructor(private performanceAPI: PerformanceApi) { }

  ngOnInit(): void {
  }

  // All Steps ----------------------------------------------------

  createNewPerformance(): Performance {
    return {
      uuid: "performance" + Date.now(),
      step_1: {
        title: "Program Title",
        date: Date.now(),
        location: "Location",
        description: ""
      },
      step_2: {
        segments: []
      },
      step_3: {
        segments: []
      }
    };
  }

  onSaveDraft() {
    this.performanceAPI.setPerformance(this.state).then(val => {
      if (val.successful) {

      } else {

      }
    })
  }

  onNextClick() {
    this.stepper.nextStep();
  }

  onPrevClick() {
    this.stepper.prevStep();
  }

  // --------------------------------------------------------------

  // Step 1 -------------------------------------------------------



  // --------------------------------------------------------------

  // Step 2 -------------------------------------------------------



  // --------------------------------------------------------------

  // Step 3 -------------------------------------------------------



  // --------------------------------------------------------------

  // Step 4 -------------------------------------------------------



  // --------------------------------------------------------------

}
