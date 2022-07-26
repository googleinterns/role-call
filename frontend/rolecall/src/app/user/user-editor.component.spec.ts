import {TestBed, waitForAsync} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {FormsModule} from "@angular/forms";
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {EditableTextInput,
} from '../common_components/editable_text_input.component';
import {EditableDateInput,
} from '../common_components/editable_date_input.component';
import {EditableMultiSelectInput,
} from '../common_components/editable_multiselect_input.component';
import {LoadingSpinnerComponent,
} from '../common_components/loading-spinner.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';

import {ActivatedRoute} from '@angular/router';
import {of} from 'rxjs';
import {createSpyObjWithProps} from 'src/test_utils';
import {Location} from '@angular/common';

import {EmptyStringIfUndefinedPipe,
} from '../common_components/empty_string_if_undefined.pipe';
import {UserApi} from '../api/user_api.service';

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
