import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-multi-select-input',
  templateUrl: './editable_multiselect_input.component.html',
  styleUrls: ['./editable_multiselect_input.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class EditableMultiSelectInput implements OnInit {

  @Input() valueName: string;
  @Input() bgColor: string;
  @Input() selectFrom: string[];
  @Input() setValues: EventEmitter<string[]>;
  @Input() displayNameMapping: any;
  @Output() valueChange: EventEmitter<[string, string[]]> = new EventEmitter();
  currentlySelected: string[] = [];

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnInit(): void {
    this.setValues.subscribe(val => {
      this.update(val);
    });
  }

  update = (values: string[]): void => {
    this.currentlySelected = values;
  };

  onChangeSelection = (selectedString: string, event: any): void => {
    if (!event.isUserInput) {
      return;
    }
    if (event.source.selected) {
      this.valueChange.emit(
          [this.valueName, [...this.currentlySelected, selectedString]]);
    } else {
      this.valueChange.emit([this.valueName,
        this.currentlySelected.filter(val => val !== selectedString)]);
    }
  };
}
