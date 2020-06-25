import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { HomepageBase } from './homepage_base.component';


describe('HomepageBase', () => {
  let component: HomepageBase;
  let fixture: ComponentFixture<HomepageBase>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HomepageBase],
      imports: [
        MatIconModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomepageBase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
