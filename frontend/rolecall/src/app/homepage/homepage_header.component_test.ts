import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HomepageHeader } from './homepage_header.component';


describe('HomepageHeader', () => {
  let component: HomepageHeader;
  let fixture: ComponentFixture<HomepageHeader>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HomepageHeader]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomepageHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {

    expect(component).toBeTruthy();
  });
});
