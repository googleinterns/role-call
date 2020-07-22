import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { EmptyStringIfUndefinedPipe } from '../common_components/empty_string_if_undefined.pipe';
import { UserEditorComponent } from './user-editor.component';

let activatedRouteStub = {
  snapshot: {
    params: {
      uuid: "testUUID"
    }
  }
}

describe('UserEditorComponent', () => {
  let component: UserEditorComponent;
  let fixture: ComponentFixture<UserEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserEditorComponent, EmptyStringIfUndefinedPipe],
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
    fixture = TestBed.createComponent(UserEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
