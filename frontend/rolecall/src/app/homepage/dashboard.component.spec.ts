import { TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';

import { HttpClient } from '@angular/common/http';
import { HeaderUtilityService } from '../services/header-utility.service';
import { ResponseStatusHandlerService,
} from '../services/response-status-handler.service';
import { LoggingService } from '../services/logging.service';

import { CrudApi } from '../api/crud-api.service';
import { ContextService } from '../services/context.service';

// import { of } from 'rxjs';

import { PerformanceApi } from '../api/performance-api.service';

import { Dashboard } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: Dashboard;

  const fakeHttpClient = {} as HttpClient;
  const fakeHeaderUtilityService = {} as HeaderUtilityService;
  const fakeRespHandler = {} as ResponseStatusHandlerService;
  const fakeLoggingService = {} as LoggingService;

  const strCrudApi = new CrudApi<string>(
    fakeHttpClient,
    fakeHeaderUtilityService,
    fakeRespHandler,
    fakeLoggingService,
  );

  const g = new ContextService();

  const perfApi = new PerformanceApi(g, strCrudApi);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
        declarations: [
          Dashboard,
        ],
        imports: [
          MatFormFieldModule,
          NoopAnimationsModule,
        ],
        // providers: [
        //   { provide: PerformanceApi, useValue: fakePerformanceApi },
        // ],
      })
      .compileComponents();
    }));

  // beforeEach(waitForAsync(() => {
  //   const fakePerformanceApi = {
  //     //dashPerformanceEmitter: of([]),
  //     // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  //     loadAllPerformances(): void {
  //     }
  //   } as PerformanceApi;

  //   TestBed.configureTestingModule({
  //         declarations: [Dashboard],
  //         providers: [
  //           { provide: PerformanceApi, useValue: perfApi },
  //         ],
  //       })
  //       .compileComponents();
  // }));

  beforeEach(() => {
    // const fixture = TestBed.createComponent(Dashboard);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
    component = new Dashboard(
      perfApi,
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
