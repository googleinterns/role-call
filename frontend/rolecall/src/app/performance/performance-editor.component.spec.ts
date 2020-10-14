import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {PerformanceEditor} from './performance-editor.component';


describe('PerformanceEditorComponent', () => {
  let component: PerformanceEditor;
  let fixture: ComponentFixture<PerformanceEditor>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
          declarations: [PerformanceEditor]
        })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
