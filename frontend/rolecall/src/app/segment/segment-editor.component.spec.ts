import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MatFormFieldModule } from '@angular/material/form-field';

import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { createSpyObjWithProps } from 'src/test-utils';

import { SegmentApi } from '../api/segment-api.service';
import { ResponseStatusHandlerService,
} from '../services/response-status-handler.service';


import { ActionButtonsComponent,
} from '../common-components/action-buttons.component';
import { SegmentEditor } from './segment-editor.component';
import { SegmentModule } from './segment.module';

import { SuperBalletDisplayService,
} from '../services/super-ballet-display.service';
import { SegmentDisplayListService,
} from '../services/segment-display-list.service';

describe('SegmentEditorComponent', () => {
  const fakeActivatedRoute = {snapshot: {params: {uuid: 'testUUID'}}};
  const fakeLocation = {} as Location;
  const fakeResponseStatusHandlerService = {} as ResponseStatusHandlerService;
  const fakeSuperBalletDisplay = {} as SuperBalletDisplayService;
  const fakeSegmentDisplayList = {} as SegmentDisplayListService;
  const mockSegmentApi = createSpyObjWithProps<SegmentApi>({
    baseName: 'mockSegmentApi',
    methods: {getAllSegments: Promise.resolve([])},
    props: {segmentEmitter: of([])},
  });

  let component: SegmentEditor;
  let fixture: ComponentFixture<SegmentEditor>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
        declarations: [
          ActionButtonsComponent,
          SegmentEditor,
        ],
        imports: [
          MatFormFieldModule,
          NoopAnimationsModule,
          SegmentModule,
        ],
        providers: [
          {provide: ActivatedRoute, useValue: fakeActivatedRoute},
          {provide: SegmentApi, useValue: mockSegmentApi},
          {provide: Location, useValue: fakeLocation},
          {
            provide: ResponseStatusHandlerService,
            useValue: fakeResponseStatusHandlerService
          },
          {
            provide: SuperBalletDisplayService,
            useValue: fakeSuperBalletDisplay
          },
          {
            provide: SegmentDisplayListService,
            useValue: fakeSegmentDisplayList
          },
        ]
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SegmentEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
