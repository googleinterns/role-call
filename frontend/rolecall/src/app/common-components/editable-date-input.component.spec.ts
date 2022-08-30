import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { EditableDateInput } from './editable-date-input.component';


describe('EditableDateInput', () => {
  let component: EditableDateInput;
  let fixture: ComponentFixture<EditableDateInput>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
          declarations: [
            EditableDateInput,
          ],
          imports: [
            FormsModule,
            MatDatepickerModule,
            MatFormFieldModule,
            MatInputModule,
            MatNativeDateModule,
            NoopAnimationsModule,
          ]
        })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditableDateInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
