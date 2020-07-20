import { Component, Input, Output, OnInit, EventEmitter, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-text-input',
  templateUrl: './editable_text_input.component.html',
  styleUrls: ['./editable_text_input.component.scss']
})
export class EditableTextInput implements OnInit {

  @Input() initValue: string;
  @Input() valueName: string;
  @Input() bgColor: string;
  @Input() type: string;
  @Output() valueChange: EventEmitter<[string, string]> = new EventEmitter();
  currentValue: string;

  ngOnInit() {
    this.currentValue = this.initValue;
  }
}
