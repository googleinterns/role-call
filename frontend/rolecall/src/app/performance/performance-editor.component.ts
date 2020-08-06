import { Component, OnInit } from '@angular/core';
import { Performance, PerformanceApi } from '../api/performance-api.service';

@Component({
  selector: 'app-performance-editor',
  templateUrl: './performance-editor.component.html',
  styleUrls: ['./performance-editor.component.scss']
})
export class PerformanceEditor implements OnInit {

  stepperOpts = ["Performance Details", "Pieces & Intermissions", "Fill Casts", "Finalize"];
  currentStep = 0;

  state: Performance;

  constructor(private performanceAPI: PerformanceApi) { }

  ngOnInit(): void {
  }

  onStepChange(indexName: [number, string]) {
    this.currentStep = indexName[0];
    console.log(this.currentStep);
  }

}
