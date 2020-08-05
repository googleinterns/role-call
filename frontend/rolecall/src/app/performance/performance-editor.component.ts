import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-performance-editor',
  templateUrl: './performance-editor.component.html',
  styleUrls: ['./performance-editor.component.scss']
})
export class PerformanceEditor implements OnInit {

  stepperOpts = ["Performance Details", "Pieces & Intermissions", "Fill Casts", "Finalize"]

  constructor() { }

  ngOnInit(): void {
  }

}
