import { EventEmitter } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EditableMultiSelectInput } from './editable_multiselect_input.component';


describe('EditableMultiSelectInput', () => {
  let component: EditableMultiSelectInput;
  let fixture: ComponentFixture<EditableMultiSelectInput>;

  beforeEach(async(() => {
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
