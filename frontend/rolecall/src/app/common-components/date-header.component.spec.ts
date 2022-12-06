import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DateHeaderComponent } from './date-header.component';

describe('DateHeaderComponent', () => {
  let component: DateHeaderComponent;
  let fixture: ComponentFixture<DateHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DateHeaderComponent ],
      imports: [
        MatMenuModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatTooltipModule,
      ],
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
