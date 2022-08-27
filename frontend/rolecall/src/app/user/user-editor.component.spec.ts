import {TestBed, waitForAsync} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {EditableTextInput,
} from '../common-components/editable-text-input.component';
import {EditableDateInput,
} from '../common-components/editable-date-input.component';
import {EditableMultiSelectInput,
} from '../common-components/editable-multiselect-input.component';
import {LoadingSpinnerComponent,
} from '../common-components/loading-spinner.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';

import {ActivatedRoute} from '@angular/router';
import {of} from 'rxjs';
import {createSpyObjWithProps} from 'src/test-utils';
import {Location} from '@angular/common';

import {EmptyStringIfUndefinedPipe,
} from '../common-components/empty-string-if-undefined.pipe';
import {UserApi} from '../api/user-api.service';

import {ActionButtonsComponent} from '../common-components/action-buttons.component';
import {UserEditor} from './user-editor.component';

describe('UserEditorComponent', () => {
  const fakeActivatedRoute = {snapshot: {params: {uuid: 'testUUID'}}};
  const fakeLocation = {} as Location;
  const mockUserApi = createSpyObjWithProps({
    baseName: 'mockUserApi',
    methods: {getAllUsers: of([])},
    props: {userEmitter: of([])},
  });

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
          {provide: ActivatedRoute, useValue: fakeActivatedRoute},
          {provide: UserApi, useValue: mockUserApi},
          {provide: Location, userValue: fakeLocation},
        ],
      })
      .compileComponents();
    }));

  beforeEach(() => {
    const fixture = TestBed.createComponent(UserEditor);
    userEditor = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(userEditor).toBeTruthy();
  });
});
