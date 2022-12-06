import { Component, EventEmitter, Input, OnChanges, OnInit, Output,
} from '@angular/core';


@Component({
  selector: 'app-date-input',
  templateUrl: './editable-date-input.component.html',
  styleUrls: ['./editable-date-input.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class EditableDateInput implements OnInit, OnChanges {

  @Input() valueName: string;
  @Input() bgColor: string;
  @Input() appearance: string;
  @Input() initValue: number;
  @Output() valueChange: EventEmitter<[string, string]> = new EventEmitter();
  currentValue: Date;

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnInit(): void {
    this.currentValue = new Date(this.initValue);
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnChanges(): void {
    this.currentValue = new Date(this.initValue);
  }

  update = (): void => {
    this.currentValue = new Date(this.initValue);
  };

  onDateChange = (event: any): void => {
    this.valueChange.emit([this.valueName, event]);
  };
}
