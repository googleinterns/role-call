import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';

import {of} from 'rxjs';
import {createSpyObjWithProps} from 'src/test_utils';

import {UnavailabilityApi} from '../api/unavailability-api.service';
import {UserApi} from '../api/user_api.service';

import {UnavailabilityEditor} from './unavailability-editor.component';

describe('UnavailabilityEditorComponent', () => {
  const mockUnavailabilityApi = createSpyObjWithProps<UnavailabilityApi>({
    baseName: 'mockUnavailabilityApi',
    methods: {getAllUnavailabilities: Promise.resolve([])},
    props: {unavailabilityEmitter: of([])}
  });
  const mockUserApi = createSpyObjWithProps<UserApi>({
    baseName: 'mockUserApi',
    methods: {getAllUsers: Promise.resolve([])},
    props: {userEmitter: of([])},
  });

  let component: UnavailabilityEditor;
  let fixture: ComponentFixture<UnavailabilityEditor>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
          declarations: [
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
            NoopAnimationsModule,
          ],
          providers: [
            {provide: UnavailabilityApi, useValue: mockUnavailabilityApi},
            {provide: UserApi, useValue: mockUserApi},
          ],
        })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnavailabilityEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
