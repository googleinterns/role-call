import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginBase } from './login_base.component';


describe('LoginBase', () => {
  let component: LoginBase;
  let fixture: ComponentFixture<LoginBase>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoginBase]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginBase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
