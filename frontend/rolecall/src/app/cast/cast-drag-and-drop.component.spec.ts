import { /* ComponentFixture, */ TestBed, waitForAsync,
} from '@angular/core/testing';
// import { of } from 'rxjs';
// import { createSpyObjWithProps } from 'src/test-utils';

import { CrudApi } from '../api/crud-api.service';
import { PictureApi } from '../api/picture-api.service';
import { ChangeDetectorRef } from '@angular/core';
import { ContextService } from '../services/context.service';
import { SegmentApi } from '../api/segment-api.service';
import { CastApi } from '../api/cast-api.service';
import { UserApi } from '../api/user-api.service';
import { CsvGenerator } from '../services/csv-generator.service';

import { HttpClient } from '@angular/common/http';
import { HeaderUtilityService } from '../services/header-utility.service';
import { ResponseStatusHandlerService,
} from '../services/response-status-handler.service';
import { LoggingService } from '../services/logging.service';

import { CastDragAndDrop } from './cast-drag-and-drop.component';

describe('CastDragAndDropComponent', () => {
  const fakeChangeDetectorRef = {} as ChangeDetectorRef;
  const fakeCsvGenerator = {} as CsvGenerator;
  // const fakeSegmentApi = {} as SegmentApi;
  // const mockUserApi = createSpyObjWithProps<UserApi>({
  //   baseName: 'mockUserApi',
  //   methods: {loadAllUsers: Promise.resolve([])},
  //   props: {userEmitter: of([])},
  // });
  // const mockCastApi = createSpyObjWithProps<CastApi>({
  //   baseName: 'mockCastApi',
  //   methods: { loadAllCasts: Promise.resolve([]) },
  //   props: { castEmitter: of([]) },
  // });

  let component: CastDragAndDrop;
  // let fixture: ComponentFixture<CastDragAndDrop>;

  const fakeHttpClient = {} as HttpClient;
  const fakeHeaderUtilityService = {} as HeaderUtilityService;
  const fakeRespHandler = {} as ResponseStatusHandlerService;
  const fakeLoggingService = {} as LoggingService;
  const fakePictureApi = {} as PictureApi;

  const strCrudApi = new CrudApi<string>(
    fakeHttpClient,
    fakeHeaderUtilityService,
    fakeRespHandler,
    fakeLoggingService,
  );

  const g = new ContextService();

  const segmentApi = new SegmentApi(strCrudApi);
  const castApi = new CastApi(
    fakeHttpClient,
    fakeHeaderUtilityService,
    fakeRespHandler,
    segmentApi,
    g,
    strCrudApi);

  const userApi = new UserApi(strCrudApi, fakePictureApi);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
          declarations: [CastDragAndDrop],
          providers: [
            // { provide: ChangeDetectorRef, useValue: fakeChangeDetectorRef },
            // { provide: ContextService, useValue: g },
            // { provide: CsvGenerator, useValue: fakeCsvGenerator },
            // { provide: UserApi, useValue: userApi },
            // { provide: SegmentApi, useValue: segmentApi },
            // { provide: CastApi, useValue: castApi },
          ],
        })
        .compileComponents();
  }));

  beforeEach(() => {
    // fixture = TestBed.createComponent(CastDragAndDrop);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
    component = new CastDragAndDrop(
      fakeChangeDetectorRef,
      g,
      fakeCsvGenerator,
      userApi,
      segmentApi,
      castApi,
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
