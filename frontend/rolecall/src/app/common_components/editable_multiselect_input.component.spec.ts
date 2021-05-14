import {EventEmitter} from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {EditableMultiSelectInput} from './editable_multiselect_input.component';


describe('EditableMultiSelectInput', () => {
  let component: EditableMultiSelectInput;
  let fixture: ComponentFixture<EditableMultiSelectInput>;

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
