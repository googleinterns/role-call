import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PieceEditor } from './piece_editor.component';


describe('PieceEditorComponent', () => {
  let component: PieceEditor;
  let fixture: ComponentFixture<PieceEditor>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PieceEditor]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PieceEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
