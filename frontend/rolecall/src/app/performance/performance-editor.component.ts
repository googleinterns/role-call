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

  performancesLoaded = false;
  dataLoaded = false;

  constructor(private performanceAPI: PerformanceApi) { }

  ngOnInit(): void {
    this.performanceAPI.getAllPerformances().then(val => this.onPerformanceLoad(val));
  }

  onPerformanceLoad(perfs: Performance[]) {
    this.allPerformanes = perfs;
    this.allPerformanes.push(...this.allPerformanes);
    this.allPerformanes.push(...this.allPerformanes);
    this.allPerformanes.push(...this.allPerformanes);
    this.selectedPerformance = perfs[0] ? perfs[0] : undefined;
    this.performancesLoaded = true;
    this.checkDataLoaded();
  }

  checkDataLoaded(): boolean {
    this.dataLoaded = this.performancesLoaded;
    return this.dataLoaded;
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

  allPerformanes: Performance[] = [];
  selectedPerformance: Performance;

  onSelectRecentPerformance(perf: Performance) {
    this.selectedPerformance = perf;
  }

  onStep1Input(field: string, value: any) {
    switch (field) {
      case "title":
        this.state.step_1.title = value;
      case "date":
        this.state.step_1.date = value;
      case "location":
        this.state.step_1.location = value;
      case "description":
        this.state.step_1.description = value;
    }
  }

  // --------------------------------------------------------------

  // Step 2 -------------------------------------------------------



  // --------------------------------------------------------------

  // Step 3 -------------------------------------------------------



  // --------------------------------------------------------------

  // Step 4 -------------------------------------------------------



  // --------------------------------------------------------------

}
