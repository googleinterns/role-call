import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CastingEditor } from './casting_editor.component';


describe('CastingEditorComponent', () => {
  let component: CastingEditor;
  let fixture: ComponentFixture<CastingEditor>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CastingEditor]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CastingEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
