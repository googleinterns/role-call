import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-date-input',
  templateUrl: './editable_date_input.component.html',
  styleUrls: ['./editable_date_input.component.scss']
})
export class EditableDateInput implements OnInit, OnChanges {

  @Input() valueName: string;
  @Input() bgColor: string;
  @Input() initValue: number;
  @Output() valueChange: EventEmitter<[string, string]> = new EventEmitter();
  currentValue: Date;

  ngOnInit() {
    this.currentValue = new Date(this.initValue);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.currentValue = new Date(this.initValue);
  }

  update() {
    this.currentValue = new Date(this.initValue);
  }

  onDateChange(event: any) {
    this.valueChange.emit([this.valueName, event]);
  }
}
