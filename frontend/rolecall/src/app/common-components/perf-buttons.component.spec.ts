import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfButtonsComponent } from './perf-buttons.component';

describe('PerfButtonsComponent', () => {
  let component: PerfButtonsComponent;
  let fixture: ComponentFixture<PerfButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PerfButtonsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
