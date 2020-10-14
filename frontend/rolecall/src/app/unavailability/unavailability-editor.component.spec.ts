import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {UnavailabilityEditor} from './unavailability-editor.component';


describe('UnavailabilityEditorComponent', () => {
  let component: UnavailabilityEditor;
  let fixture: ComponentFixture<UnavailabilityEditor>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
          declarations: [UnavailabilityEditor]
        })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnavailabilityEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
