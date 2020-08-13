import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PieceEditor } from './piece_editor.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('PieceEditorComponent', () => {
  let component: PieceEditor;
  let fixture: ComponentFixture<PieceEditor>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PieceEditor,
        RouterTestingModule,
      ]
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
