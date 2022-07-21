import { TestBed, waitForAsync } from '@angular/core/testing';
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
          declarations: [UserEditor, EmptyStringIfUndefinedPipe],
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
