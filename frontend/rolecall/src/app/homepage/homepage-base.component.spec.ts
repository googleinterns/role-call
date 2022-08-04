import {TestBed, waitForAsync} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MatIconModule} from '@angular/material/icon';
import {Dashboard} from './dashboard.component';

import {Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';

import {MatDialogModule, MAT_DIALOG_DATA, MatDialogRef,
} from '@angular/material/dialog';

import {LoadingSpinnerComponent,
} from '../common-components/loading-spinner.component';

import {HomepageBase} from './homepage-base.component';

describe('HomepageBase', () => {
  let component: HomepageBase;
  let router: Router;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
        declarations: [
          Dashboard,
          LoadingSpinnerComponent,
          HomepageBase,
        ],
        imports: [
          NoopAnimationsModule,
          MatIconModule,
          HttpClientTestingModule,
          RouterTestingModule,
          MatDialogModule,
        ],
        providers: [
          { provide: MAT_DIALOG_DATA, useValue: {} },
          { provide: MatDialogRef, useValue: {} },
        ],
      })
      .compileComponents();

      router = TestBed.inject(Router);
      router.initialNavigation();
    }));

  beforeEach(() => {
    const fixture = TestBed.createComponent(HomepageBase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
