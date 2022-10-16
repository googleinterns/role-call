import { /* ComponentFixture, */ TestBed, waitForAsync
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MatFormFieldModule } from '@angular/material/form-field';

import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
// import { of } from 'rxjs';
// import { createSpyObjWithProps } from 'src/test-utils';

import { SegmentApi } from '../api/segment-api.service';

import { HttpClient } from '@angular/common/http';
import { HeaderUtilityService } from '../services/header-utility.service';
import { ResponseStatusHandlerService,
} from '../services/response-status-handler.service';
import { LoggingService } from '../services/logging.service';

import * as APITypes from 'src/api-types';
import { CrudApi } from '../api/crud-api.service';

import { ActionButtonsComponent,
} from '../common-components/action-buttons.component';
import { SegmentEditor } from './segment-editor.component';
import { SegmentModule } from './segment.module';

import { SuperBalletDisplayService,
} from '../services/super-ballet-display.service';
import { SegmentDisplayListService,
} from '../services/segment-display-list.service';

describe('SegmentEditorComponent', () => {
  const fakeActivatedRoute = { snapshot: { params: { uuid: 'testUUID' } }
    } as unknown as ActivatedRoute;
  const fakeLocation = {} as Location;
  const fakeResponseStatusHandlerService = {} as ResponseStatusHandlerService;
  const fakeSuperBalletDisplay = {} as SuperBalletDisplayService;
  const fakeSegmentDisplayList = {} as SegmentDisplayListService;
  // const mockSegmentApi = createSpyObjWithProps<SegmentApi>({
  //   baseName: 'mockSegmentApi',
  //   methods: { loadAllSegments: Promise.resolve([]) },
  //   props: { segmentEmitter: of([]) },
  // });

  const fakeHttpClient = {} as HttpClient;
  const fakeHeaderUtilityService = {} as HeaderUtilityService;
  const fakeRespHandler = {} as ResponseStatusHandlerService;
  const fakeLoggingService = {} as LoggingService;

  const crudApi = new CrudApi<APITypes.UserUUID>(
    fakeHttpClient,
    fakeHeaderUtilityService,
    fakeRespHandler,
    fakeLoggingService,
  );

  const segmentApi = new SegmentApi(crudApi);

  let component: SegmentEditor;
  // let fixture: ComponentFixture<SegmentEditor>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
        declarations: [
          ActionButtonsComponent,
          SegmentEditor,
        ],
        imports: [
          MatFormFieldModule,
          NoopAnimationsModule,
          SegmentModule,
        ],
        providers: [
          // { provide: ActivatedRoute, useValue: fakeActivatedRoute },
          // { provide: Location, useValue: fakeLocation },
          // {
          //   provide: ResponseStatusHandlerService,
          //   useValue: fakeResponseStatusHandlerService
          // },
          // { provide: SegmentApi, useValue: segmentApi },
          // {
          //   provide: SuperBalletDisplayService,
          //   useValue: fakeSuperBalletDisplay
          // },
          // {
          //   provide: SegmentDisplayListService,
          //   useValue: fakeSegmentDisplayList
          // },
        ]
      })
      .compileComponents();
  }));

  beforeEach(() => {
    // fixture = TestBed.createComponent(SegmentEditor);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
    component = new SegmentEditor(
      fakeActivatedRoute,
      fakeLocation,
      fakeResponseStatusHandlerService,
      segmentApi,
      fakeSuperBalletDisplay,
      fakeSegmentDisplayList,
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
