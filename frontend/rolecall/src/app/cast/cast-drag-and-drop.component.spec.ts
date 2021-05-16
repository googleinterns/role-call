import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {of} from 'rxjs';
import {createSpyObjWithProps} from 'src/test_utils';

import {LoggingService} from '../services/logging.service';
import {PieceApi} from '../api/piece_api.service';
import {CastApi} from '../api/cast_api.service';
import {UserApi} from '../api/user_api.service';
import {CsvGenerator} from '../services/csv-generator.service';

import {CastDragAndDrop} from './cast-drag-and-drop.component';

describe('CastDragAndDropComponent', () => {
  const fakeLoggingService = {} as LoggingService;
  const fakeCsvGenerator = {} as CsvGenerator;
  const fakePieceApi = {} as PieceApi;
  const mockUserApi = createSpyObjWithProps<UserApi>({
    baseName: 'mockUserApi',
    methods: {getAllUsers: Promise.resolve([])},
    props: {userEmitter: of([])},
  });
  const mockCastApi = createSpyObjWithProps<CastApi>({
    baseName: 'mockCastApi',
    methods: {getAllCasts: Promise.resolve([])},
    props: {castEmitter: of([])},
  });

  let component: CastDragAndDrop;
  let fixture: ComponentFixture<CastDragAndDrop>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
          declarations: [CastDragAndDrop],
          providers: [
            {provide: PieceApi, useValue: fakePieceApi},
            {provide: CastApi, useValue: mockCastApi},
            {provide: UserApi, useValue: mockUserApi},
            {provide: LoggingService, useValue: fakeLoggingService},
            {provide: CsvGenerator, useValue: fakeCsvGenerator},
          ],
        })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CastDragAndDrop);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
