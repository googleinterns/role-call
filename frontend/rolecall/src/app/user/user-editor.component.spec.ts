import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute} from '@angular/router';
import {EmptyStringIfUndefinedPipe} from '../common_components/empty_string_if_undefined.pipe';
import {UserEditor} from './user-editor.component';

let activatedRouteStub = {
  snapshot: {
    params: {
      uuid: "testUUID"
    }
  }
}

describe('UserEditorComponent', () => {
  let component: UserEditor;
  let fixture: ComponentFixture<UserEditor>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
          declarations: [UserEditor, EmptyStringIfUndefinedPipe],
          providers: [
            {
              provide: ActivatedRoute,
              useValue: activatedRouteStub
            }
          ]
        })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
