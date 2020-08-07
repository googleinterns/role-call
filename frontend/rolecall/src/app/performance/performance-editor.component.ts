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
    this.state = this.createNewPerformance();
    this.performanceAPI.getAllPerformances().then(val => this.onPerformanceLoad(val));
  }

  onPerformanceLoad(perfs: Performance[]) {
    this.allPerformanes = perfs;
    this.allPerformanes.push(...this.allPerformanes);
    this.allPerformanes.push(...this.allPerformanes);
    this.allPerformanes.push(...this.allPerformanes);
    this.onSelectRecentPerformance(perfs[0] ? perfs[0] : undefined);
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
  dateStr: string;

  onSelectRecentPerformance(perf: Performance) {
    this.selectedPerformance = perf;
    this.updateDateString();
  }

  updateDateString() {
    let timeZoneOffset = new Date().getTimezoneOffset() * 60000;
    let iso = new Date(this.state.step_1.date - timeZoneOffset).toISOString();
    let isoSplits = iso.slice(0, iso.length - 1).split(":");
    this.dateStr = isoSplits[0] + ":" + isoSplits[1];
    console.log(this.dateStr);
  }

  onStep1Input(field: string, value: any) {
    if (field == "title") {
      let val = value as InputEvent;
      this.state.step_1.title = val.target['value'];
    }
    if (field == "location") {
      let val2 = value as InputEvent;
      this.state.step_1.location = val2.target['value'];
    }
    if (field == "date") {
      let val3 = value as InputEvent;
      this.state.step_1.date = Date.parse(val3.target['value'])
      this.updateDateString();
    }
    if (field == "description") {
      let val4 = value as InputEvent;
      this.state.step_1.description = val4.target['value'];
    }
  }

  duplicatePerformance(perf: Performance) {
    this.state = JSON.parse(JSON.stringify(perf));
    this.updateDateString();
  }

  resetPerformance() {
    this.state = this.createNewPerformance();
    this.updateDateString();
  }

  // --------------------------------------------------------------

  // Step 2 -------------------------------------------------------



  // --------------------------------------------------------------

  // Step 3 -------------------------------------------------------



  // --------------------------------------------------------------

  // Step 4 -------------------------------------------------------



  // --------------------------------------------------------------

}
