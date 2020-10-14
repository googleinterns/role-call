import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {EditableDateInput} from './editable_date_input.component';


describe('EditableDateInput', () => {
  let component: EditableDateInput;
  let fixture: ComponentFixture<EditableDateInput>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
          declarations: [EditableDateInput]
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
