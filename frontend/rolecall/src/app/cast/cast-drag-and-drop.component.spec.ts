import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {of} from 'rxjs';
import {createSpyObjWithProps} from 'src/test-utils';

import {LoggingService} from '../services/logging.service';
import {SegmentApi} from '../api/segment-api.service';
import {CastApi} from '../api/cast-api.service';
import {UserApi} from '../api/user-api.service';
import {CsvGenerator} from '../services/csv-generator.service';

import {CastDragAndDrop} from './cast-drag-and-drop.component';

describe('CastDragAndDropComponent', () => {
  const fakeLoggingService = {} as LoggingService;
  const fakeCsvGenerator = {} as CsvGenerator;
  const fakeSegmentApi = {} as SegmentApi;
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
            {provide: SegmentApi, useValue: fakeSegmentApi},
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
