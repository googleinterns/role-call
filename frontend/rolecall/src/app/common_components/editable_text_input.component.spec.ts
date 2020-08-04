import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EditableTextInput } from './editable_text_input.component';


describe('EditableTextInput', () => {
  let component: EditableTextInput;
  let fixture: ComponentFixture<EditableTextInput>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditableTextInput]
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
