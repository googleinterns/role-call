import { Component, EventEmitter, Input, OnDestroy, OnInit, Output,
} from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-multi-select-input',
  templateUrl: './editable-multiselect-input.component.html',
  styleUrls: ['./editable-multiselect-input.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class EditableMultiSelectInput implements OnInit, OnDestroy {

  @Input() valueName: string;
  @Input() bgColor: string;
  @Input() appearance: string;
  @Input() selectFrom: string[];
  @Input() setValues: EventEmitter<string[]>;
  @Input() displayNameMapping: any;
  @Output() valueChange: EventEmitter<[string, string[]]> = new EventEmitter();

  currentlySelected: string[] = [];
  setValueSubscription: Subscription;

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnInit(): void {
    this.setValueSubscription = this.setValues.subscribe(val => {
      this.update(val);
    });
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnDestroy(): void {
    this.setValueSubscription.unsubscribe();
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
