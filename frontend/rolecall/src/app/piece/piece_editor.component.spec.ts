import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {of} from 'rxjs';
import {createSpyObjWithProps} from 'src/test_utils';

import {PieceApi} from '../api/piece_api.service';
import {ResponseStatusHandlerService,
} from '../services/response-status-handler.service';

import {PieceEditor} from './piece_editor.component';
import {PieceModule} from './piece.module';

import {SuperBalletDisplayService,
} from '../services/super-ballet-display.service';
import {SegmentDisplayListService,
} from '../services/segment-display-list.service';

describe('PieceEditorComponent', () => {
  const fakeActivatedRoute = {snapshot: {params: {uuid: 'testUUID'}}};
  const fakeLocation = {} as Location;
  const fakeResponseStatusHandlerService = {} as ResponseStatusHandlerService;
  const fakeSuperBalletDisplay = {} as SuperBalletDisplayService;
  const fakeSegmentDisplayList = {} as SegmentDisplayListService;
  const mockPieceApi = createSpyObjWithProps<PieceApi>({
    baseName: 'mockPieceApi',
    methods: {getAllPieces: Promise.resolve([])},
    props: {pieceEmitter: of([])},
  });

  let component: PieceEditor;
  let fixture: ComponentFixture<PieceEditor>;

  beforeEach(waitForAsync(() => {
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
          {
            provide: SuperBalletDisplayService,
            useValue: fakeSuperBalletDisplay
          },
          {
            provide: SegmentDisplayListService,
            useValue: fakeSegmentDisplayList
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
