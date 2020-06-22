import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomepageBaseComponent } from './homepage_base.component';
import { MatIconModule } from '@angular/material/icon';

describe('HomepageBaseComponent', () => {
  let component: HomepageBaseComponent;
  let fixture: ComponentFixture<HomepageBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HomepageBaseComponent],
      imports: [
        MatIconModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomepageBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
