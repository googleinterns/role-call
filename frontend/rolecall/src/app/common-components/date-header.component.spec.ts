import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateHeaderComponent } from './date-header.component';

describe('ActionButtonsComponent', () => {
  let component: DateHeaderComponent;
  let fixture: ComponentFixture<DateHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DateHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DateHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
