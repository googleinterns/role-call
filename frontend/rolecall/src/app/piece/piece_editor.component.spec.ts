import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {of} from 'rxjs';
import {createSpyObjWithProps} from 'src/test_utils';

import {PieceApi} from '../api/piece_api.service';
import {ResponseStatusHandlerService} from '../services/response-status-handler.service';

import {PieceEditor} from './piece_editor.component';
import {PieceModule} from './piece.module';

describe('PieceEditorComponent', () => {
  const fakeActivatedRoute = {snapshot: {params: {uuid: 'testUUID'}}};
  const fakeLocation = {} as Location;
  const fakeResponseStatusHandlerService = {} as ResponseStatusHandlerService;
  const mockPieceApi = createSpyObjWithProps<PieceApi>({
    baseName: 'mockPieceApi',
    methods: {getAllPieces: Promise.resolve([])},
    props: {pieceEmitter: of([])},
  });

  let component: PieceEditor;
  let fixture: ComponentFixture<PieceEditor>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
          declarations: [PieceEditor],
          imports: [
            PieceModule,
          ],
          providers: [
            {provide: ActivatedRoute, useValue: fakeActivatedRoute},
            {provide: PieceApi, useValue: mockPieceApi},
            {provide: Location, useValue: fakeLocation},
            {
              provide: ResponseStatusHandlerService,
              useValue: fakeResponseStatusHandlerService
            },
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
