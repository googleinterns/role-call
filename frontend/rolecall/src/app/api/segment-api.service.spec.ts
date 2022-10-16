
import { TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import * as APITypes from 'src/api-types';
import { CrudApi } from './crud-api.service';

// import { HttpClient } from '@angular/common/http';

// import { LoggingService } from '../services/logging.service';
// import { HeaderUtilityService } from '../services/header-utility.service';
// import { ResponseStatusHandlerService,
// } from '../services/response-status-handler.service';

import { SegmentApi } from './segment-api.service';

describe('SegmentApiService', () => {
  const fakeCrudApi = {} as CrudApi<APITypes.SegmentUUID>;

  let service: SegmentApi;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
        declarations: [
          SegmentApi,
        ],
        imports: [
          MatFormFieldModule,
          NoopAnimationsModule,
        ]
      })
      .compileComponents();
    }));

  beforeEach(() => {
    service = new SegmentApi(
      fakeCrudApi,
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
