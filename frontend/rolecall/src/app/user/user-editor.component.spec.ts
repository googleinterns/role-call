import {async, TestBed} from '@angular/core/testing';
import {ActivatedRoute} from '@angular/router';
import {EmptyStringIfUndefinedPipe} from '../common_components/empty_string_if_undefined.pipe';
import {UserEditor} from './user-editor.component';

const activatedRouteStub = {
  snapshot: {params: {uuid: 'testUUID'}}
};

describe('UserEditorComponent', () => {
  let userEditor: UserEditor;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
          declarations: [UserEditor, EmptyStringIfUndefinedPipe],
          providers: [{provide: ActivatedRoute, useValue: activatedRouteStub}]
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
