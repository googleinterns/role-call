import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { EditableMultiSelectInput,
} from './editable-multiselect-input.component';


describe('EditableMultiSelectInput', () => {
  let component: EditableMultiSelectInput;
  let fixture: ComponentFixture<EditableMultiSelectInput>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
        declarations: [
          EditableMultiSelectInput,
        ],
        imports: [
          FormsModule,
          MatFormFieldModule,
          MatSelectModule,
          NoopAnimationsModule,
        ]
      })
      .compileComponents();
    }));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
          declarations: [EditableMultiSelectInput]
        })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditableMultiSelectInput);
    component = fixture.componentInstance;
    component.setValues = new EventEmitter<string[]>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
