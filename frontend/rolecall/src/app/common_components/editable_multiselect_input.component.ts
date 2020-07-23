import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-multi-select-input',
  templateUrl: './editable_multiselect_input.component.html',
  styleUrls: ['./editable_multiselect_input.component.scss']
})
export class EditableMultiSelectInput implements OnInit {

  @Input() valueName: string;
  @Input() bgColor: string;
  @Input() selectFrom: string[];
  @Input() setValues: EventEmitter<string[]>;
  @Input() displayNameMapping: any;
  @Output() valueChange: EventEmitter<[string, string[]]> = new EventEmitter();
  currentlySelected: string[] = [];

  ngOnInit() {
    this.setValues.subscribe((val) => {
      this.update(val);
    });
  }

  update(values: string[]) {
    this.currentlySelected = values;
  }

  onChangeSelection(selectedString: string, event: any) {
    if (event.source.selected) {
      this.valueChange.emit([this.valueName, [...this.currentlySelected, selectedString]]);
    } else {
      this.valueChange.emit([this.valueName, this.currentlySelected.filter((val) => val != selectedString)]);
    }
  }
}
