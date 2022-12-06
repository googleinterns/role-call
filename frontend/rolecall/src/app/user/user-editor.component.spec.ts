import { /* ComponentFixture, */ TestBed, waitForAsync
} from '@angular/core/testing';
import { NoopAnimationsModule} from '@angular/platform-browser/animations';

// import { HttpClientModule, /* HttpClient */} from '@angular/common/http';
// import { MatDialogModule } from '@angular/material/dialog';
// import { RouterTestingModule } from '@angular/router/testing';

import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EditableTextInput,
} from '../common-components/editable-text-input.component';
import { EditableDateInput,
} from '../common-components/editable-date-input.component';
import { EditableMultiSelectInput,
} from '../common-components/editable-multiselect-input.component';
import { LoadingSpinnerComponent,
} from '../common-components/loading-spinner.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { HttpClient } from '@angular/common/http';
import { HeaderUtilityService } from '../services/header-utility.service';
import { ResponseStatusHandlerService,
} from '../services/response-status-handler.service';
import { LoggingService } from '../services/logging.service';

import * as APITypes from 'src/api-types';
import { CrudApi } from '../api/crud-api.service';

import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
// import { of } from 'rxjs';
// import { createSpyObjWithProps } from 'src/test-utils';

import { EmptyStringIfUndefinedPipe,
} from '../common-components/empty-string-if-undefined.pipe';
import { UserApi } from '../api/user-api.service';
import { PictureApi } from '../api/picture-api.service';
import { NgxImageCompressService } from 'ngx-image-compress';

import { UserEditor } from './user-editor.component';
import { ActionButtonsComponent,
} from '../common-components/action-buttons.component';

describe('UserEditorComponent', () => {

  const fakeActivatedRoute = { snapshot: { params: { uuid: 'testUUID' } }
    } as unknown as ActivatedRoute;
  const fakeLocation = {} as Location;
  const fakePictureApi = {} as PictureApi;
  const fakeImageCompress = {} as NgxImageCompressService;

  // const mockCache = createSpyObjWithProps<DataCache<APITypes.UserUUID>>({
  //   baseName: 'mockCache',
  //   methods: { loadAll: Promise.resolve([]) },
  //   props: { loadedAll: of([]) },
  // });
  // const mockUserApi = createSpyObjWithProps<UserApi>({
  //   baseName: 'mockUserApi',
  //   methods: { loadAllUsers: Promise.resolve([]) },
  //   props: { userEmitter: of([]) },
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

  const userApi = new UserApi(crudApi, fakePictureApi);

  let userEditor: UserEditor;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
        declarations: [
          ActionButtonsComponent,
          EditableTextInput,
          EditableDateInput,
          EditableMultiSelectInput,
          LoadingSpinnerComponent,
          EmptyStringIfUndefinedPipe,
          UserEditor,
        ],
        imports: [
          NoopAnimationsModule,
          FormsModule,
          MatFormFieldModule,
          MatInputModule,
          MatAutocompleteModule,
          MatIconModule,
          MatDatepickerModule,
          MatNativeDateModule,
          MatSelectModule,
          MatTooltipModule,
        ],
        providers: [
          // { provide: ActivatedRoute, useValue: fakeActivatedRoute },
          // { provide: Location, userValue: fakeLocation },
          // { provide: UserApi, useValue: userApi },
        ],
      })
      .compileComponents();
    }));

  beforeEach(() => {
    // const fixture = TestBed.createComponent(UserEditor);
    // userEditor = fixture.componentInstance;
    // fixture.detectChanges();
    userEditor = new UserEditor(
      fakeActivatedRoute,
      fakeLocation,
      userApi,
      fakePictureApi,
      fakeImageCompress,
    );
  });

  it('should create', () => {
    expect(userEditor).toBeTruthy();
  });
});
