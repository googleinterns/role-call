import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-text-input',
  templateUrl: './editable-text-input.component.html',
  styleUrls: ['./editable-text-input.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class EditableTextInput implements OnInit {

  @Input() initValue: string;
  @Input() valueName: string;
  @Input() bgColor: string;
  @Input() type: string;
  @Input() autoCompleteOptions: string[];
  @Input() isDisabled: boolean;
  @Output() valueChange: EventEmitter<[string, string]> = new EventEmitter();
  currentValue: string;

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnInit(): void {
    this.currentValue = this.initValue;
  }

  onValueChange = (event: any): void => {
    this.valueChange.emit([this.valueName, event]);
  };
}
