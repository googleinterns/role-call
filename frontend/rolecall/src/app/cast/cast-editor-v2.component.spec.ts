import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {of} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {createSpyObjWithProps} from 'src/test_utils';

import {CastApi} from '../api/cast_api.service';
import {PieceApi} from '../api/piece_api.service';
import {UserApi} from '../api/user_api.service';
import {LoggingService} from '../services/logging.service';
import {CsvGenerator} from '../services/csv-generator.service';

import {CastEditorV2} from './cast-editor-v2.component';
import {CastModule} from './cast.module';

import {SuperBalletDisplayService} from '../services/super-ballet-display.service';
import {SegmentDisplayListService} from '../services/segment-display-list.service';

describe('CastEditorV2Component', () => {
  const fakeLoggingService = {} as LoggingService;
  const fakeCsvGenerator = {} as CsvGenerator;
  const fakeActivatedRoute = {snapshot: {params: {uuid: 'testUUID'}}};
  const fakeLocation = {} as Location;
  const fakeSuperBalletDisplay = {} as SuperBalletDisplayService;
  const mockCastApi = createSpyObjWithProps<CastApi>({
    baseName: 'mockCastApi',
    methods: {
      getAllCasts: Promise.resolve([]),
      hasCast: false,
    },
    props: {castEmitter: of([])},
  });
  const mockPieceApi = createSpyObjWithProps<PieceApi>({
    baseName: 'mockPieceApi',
    methods: {getAllPieces: Promise.resolve([])},
    props: {pieceEmitter: of([])},
  });
  const mockUserApi = createSpyObjWithProps<UserApi>({
    baseName: 'mockUserApi',
    methods: {getAllUsers: Promise.resolve([])},
    props: {userEmitter: of([])},
  });
  const mockSegmentDisplayList =
  jasmine.createSpyObj('mockSegmentDisplayList', ['buildDisplayList']);

  let component: CastEditorV2;
  let fixture: ComponentFixture<CastEditorV2>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
          declarations: [CastEditorV2],
          imports: [
            CastModule,
          ],
          providers: [
            {provide: CastApi, useValue: mockCastApi},
            {provide: PieceApi, useValue: mockPieceApi},
            {provide: ActivatedRoute, useValue: fakeActivatedRoute},
            {provide: Location, useValue: fakeLocation},
            {provide: UserApi, useValue: mockUserApi},
            {provide: LoggingService, useValue: fakeLoggingService},
            {provide: CsvGenerator, useValue: fakeCsvGenerator},
            {
              provide: SuperBalletDisplayService,
              useValue: fakeSuperBalletDisplay
            },
            {
              provide: SegmentDisplayListService,
              useValue: mockSegmentDisplayList
            },
          ]
        })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CastEditorV2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
