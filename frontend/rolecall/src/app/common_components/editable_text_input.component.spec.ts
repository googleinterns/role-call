import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {EditableTextInput} from './editable_text_input.component';
import {CommonComponentsModule} from './common_components.module';

describe('EditableTextInput', () => {
  let component: EditableTextInput;
  let fixture: ComponentFixture<EditableTextInput>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
          declarations: [EditableTextInput],
          imports: [
            CommonComponentsModule,
            NoopAnimationsModule,
          ]
        })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditableTextInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
