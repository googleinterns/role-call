import { /* ComponentFixture, */ TestBed, waitForAsync,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MatFormFieldModule } from '@angular/material/form-field';

import { HttpClient } from '@angular/common/http';
import { HeaderUtilityService } from '../services/header-utility.service';
import { ResponseStatusHandlerService,
} from '../services/response-status-handler.service';
import { LoggingService } from '../services/logging.service';

// import { of } from 'rxjs';
// import { createSpyObjWithProps } from 'src/test-utils';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

import { CrudApi } from '../api/crud-api.service';
import { PictureApi } from '../api/picture-api.service';

import { CsvGenerator } from '../services/csv-generator.service';
import { PerformanceApi } from '../api/performance-api.service';
import { SegmentApi } from '../api/segment-api.service';
import { CastApi } from '../api/cast-api.service';
import { UserApi } from '../api/user-api.service';
import { UnavailabilityApi } from '../api/unavailability-api.service';

import { ContextService } from '../services/context.service';

import { PerfButtonsComponent,
} from '../common-components/perf-buttons.component';
import { PerformanceEditor } from './performance-editor.component';
import { PerformanceModule } from './performance.module';
// Needed to be imported for ng test to run
import { HttpClientTestingModule } from '@angular/common/http/testing';


describe('PerformanceEditorComponent', () => {
  const fakeChangeDetectorRef = {} as ChangeDetectorRef;
  const fakeActivatedRoute = { snapshot: { params: {uuid: 'testUUID' } }
    } as unknown as ActivatedRoute;
  const fakeCsvGenerator = {} as CsvGenerator;

  const mockLocation = jasmine.createSpyObj<Location>('mockLocation',
      ['replaceState']);

  // const mockPerformanceApi = createSpyObjWithProps<PerformanceApi>({
  //   baseName: 'mockPerformanceApi',
  //   methods: {loadAllPerformances: Promise.resolve([])},
  //   props: {performanceEmitter: of([])},
  // });
  // const mockUserApi = createSpyObjWithProps<UserApi>({
  //   baseName: 'mockUserApi',
  //   methods: {loadAllUsers: Promise.resolve([])},
  //   props: {userEmitter: of([])},
  // });
  // const mockSegmentApi = createSpyObjWithProps<SegmentApi>({
  //   baseName: 'mockSegmentApi',
  //   methods: {loadAllSegments: Promise.resolve([])},
  //   props: {segmentEmitter: of([])},
  // });
  // const mockCastApi = createSpyObjWithProps<CastApi>({
  //   baseName: 'mockCastApi',
  //   methods: {loadAllCasts: Promise.resolve([])},
  //   props: {castEmitter: of([])},
  // });

  const fakeHttpClient = {} as HttpClient;
  const fakeHeaderUtilityService = {} as HeaderUtilityService;
  const fakeRespHandler = {} as ResponseStatusHandlerService;
  const fakeLoggingService = {} as LoggingService;
  const fakePictureApi = {} as PictureApi;

  const numCrudApi = new CrudApi<number>(
    fakeHttpClient,
    fakeHeaderUtilityService,
    fakeRespHandler,
    fakeLoggingService,
  );

  const strCrudApi = new CrudApi<string>(
    fakeHttpClient,
    fakeHeaderUtilityService,
    fakeRespHandler,
    fakeLoggingService,
  );

  const g = new ContextService();

  const perfApi = new PerformanceApi(g, strCrudApi);
  const segmentApi = new SegmentApi(strCrudApi);
  const castApi = new CastApi(
    fakeHttpClient,
    fakeHeaderUtilityService,
    fakeRespHandler,
    segmentApi,
    g,
    strCrudApi);
  const userApi = new UserApi(strCrudApi, fakePictureApi);
  const unavApi = new UnavailabilityApi(numCrudApi);

  let component: PerformanceEditor;
  // let fixture: ComponentFixture<PerformanceEditor>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
        declarations: [
          PerfButtonsComponent,
          PerformanceEditor,
        ],
        imports: [
          MatFormFieldModule,
          NoopAnimationsModule,
          PerformanceModule,
          RouterTestingModule,
          HttpClientTestingModule,
        ],

        providers: [
          // { provide: Context, useValue: g },
          // { provide: ActivatedRoute, useValue: fakeActivatedRoute },
          // { provide: Location, useValue: mockLocation },
          // { provide: ChangeDetectorRef, useValue: fakeChangeDetectorRef },
          // { provide: PerformanceApi, useValue: mockPerformanceApi },
          // { provide: SegmentApi, useValue: mockSegmentApi },
          // { provide: CastApi, useValue: mockCastApi} ,
          // { provide: UserApi, useValue: mockUserApi },
          // { provide: UnavailabilityApi, useValue: unavApi },
          // { provide: CsvGenerator, useValue: fakeCsvGenerator },
        ]
      })
      .compileComponents();
    }));

  beforeEach(() => {
    // fixture = TestBed.createComponent(PerformanceEditor);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
    component = new PerformanceEditor(
      g,
      fakeActivatedRoute,
      mockLocation,
      fakeChangeDetectorRef,
      perfApi,
      segmentApi,
      castApi,
      userApi,
      unavApi,
      fakeCsvGenerator,
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
