import { CdkDragDrop, copyArrayItem, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Performance, PerformanceApi } from '../api/performance-api.service';
import { Piece, PieceApi } from '../api/piece_api.service';
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
  piecesLoaded = false;
  dataLoaded = false;

  constructor(private performanceAPI: PerformanceApi, private piecesAPI: PieceApi) { }

  ngOnInit(): void {
    this.state = this.createNewPerformance();
    this.performanceAPI.getAllPerformances().then(val => this.onPerformanceLoad(val));
    this.piecesAPI.getAllPieces().then(val => this.onPieceLoad(val));
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

  onPieceLoad(pieces: Piece[]) {
    let intermissionPiece: Piece = {
      uuid: "intermission",
      name: "Intermission",
      positions: [],
      deletePositions: []
    }
    this.step2PickFrom = [intermissionPiece];
    this.step2PickFrom.push(...pieces.map(val => val));
    this.step2Data = [];
    this.initStep2Data();
    this.piecesLoaded = true;
    this.checkDataLoaded();
  }

  checkDataLoaded(): boolean {
    this.dataLoaded = this.performancesLoaded && this.piecesLoaded;
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
    this.updateBasedOnStep();
  }

  onPrevClick() {
    this.stepper.prevStep();
    this.updateBasedOnStep();
  }

  onStepChange(step) {
    this.updateBasedOnStep();
  }

  updateBasedOnStep() {
    if (this.stepper.currentStepIndex == 1) {
      this.initStep2Data();
      this.updateStep2State();
    }
    if (this.stepper.currentStepIndex == 2) {
    }
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
    this.initStep2Data();
  }

  resetPerformance() {
    this.state = this.createNewPerformance();
    this.updateDateString();
    this.initStep2Data();
  }

  // --------------------------------------------------------------

  // Step 2 -------------------------------------------------------

  step2Data: Piece[];
  step2PickFrom: Piece[];

  deletePiece(piece: Piece, index: number) {
    this.step2Data = this.step2Data.filter((val, ind) => val.uuid != piece.uuid || ind != index);
    this.updateStep2State();
  }

  initStep2Data() {
    this.step2Data = this.state.step_2.segments.map(val => this.step2PickFrom.find(x => x.uuid == val)).filter(val => val != undefined);
  }

  updateStep2State() {
    this.state.step_2.segments = this.step2Data.map(val => val.uuid);
  }

  step2Drop(event: CdkDragDrop<Piece[]>) {
    if (event.container.id == "program-list" && event.previousContainer.id == "program-list") {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      this.step2Data = event.container.data;
    }
    else if (event.previousContainer.id == "piece-list" && event.container.id == "program-list") {
      let itemArr = [event.item.data];
      copyArrayItem(itemArr, event.container.data, 0, event.currentIndex);
      this.step2Data = event.container.data;
    }
    this.updateStep2State();
  }

  // --------------------------------------------------------------

  // Step 3 -------------------------------------------------------



  // --------------------------------------------------------------

  // Step 4 -------------------------------------------------------



  // --------------------------------------------------------------

}
