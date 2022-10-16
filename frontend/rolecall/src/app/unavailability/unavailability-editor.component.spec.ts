import { /* ComponentFixture, */ TestBed, waitForAsync,
} from '@angular/core/testing';
import { NoopAnimationsModule} from '@angular/platform-browser/animations';

import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { HttpClient } from '@angular/common/http';
import { HeaderUtilityService } from '../services/header-utility.service';
import { ResponseStatusHandlerService,
} from '../services/response-status-handler.service';
import { LoggingService } from '../services/logging.service';

import * as APITypes from 'src/api-types';
import { CrudApi } from '../api/crud-api.service';

import { of } from 'rxjs';
import { createSpyObjWithProps } from 'src/test-utils';

import { UnavailabilityApi } from '../api/unavailability-api.service';
import { UserApi } from '../api/user-api.service';

import { UnavailabilityEditor } from './unavailability-editor.component';
import { DateHeaderComponent,
} from '../common-components/date-header.component';
import { ActionButtonsComponent,
} from '../common-components/action-buttons.component';

describe('UnavailabilityEditorComponent', () => {
  const mockUserApi = createSpyObjWithProps<UserApi>({
    baseName: 'mockUserApi',
    methods: { loadAllUsers: Promise.resolve([]) },
    props: { userEmitter: of([]) },
  });

  const fakeHttpClient = {} as HttpClient;
  const fakeHeaderUtilityService = {} as HeaderUtilityService;
  const fakeRespHandler = {} as ResponseStatusHandlerService;
  const fakeLoggingService = {} as LoggingService;

  const crudApi = new CrudApi<APITypes.UnavailabilityUUID>(
    fakeHttpClient,
    fakeHeaderUtilityService,
    fakeRespHandler,
    fakeLoggingService,
  );

  const unavailabilityApi = new UnavailabilityApi(crudApi);

  let component: UnavailabilityEditor;
  // let fixture: ComponentFixture<UnavailabilityEditor>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
          declarations: [
            ActionButtonsComponent,
            DateHeaderComponent,
            UnavailabilityEditor,
          ],
          imports: [
            FormsModule,
            MatFormFieldModule,
            MatInputModule,
            MatIconModule,
            MatSelectModule,
            MatDatepickerModule,
            MatNativeDateModule,
            MatMenuModule,
            MatTooltipModule,
            NoopAnimationsModule,
          ],
          providers: [
            // { provide: UnavailabilityApi, useValue: mockUnavailabilityApi },
            // { provide: UnavailabilityApi, useValue: unavailabilityApi },
            // { provide: UserApi, useValue: mockUserApi },
          ],
        })
        .compileComponents();
  }));

  beforeEach(() => {
    // fixture = TestBed.createComponent(UnavailabilityEditor);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
    component = new UnavailabilityEditor(mockUserApi, unavailabilityApi);

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
