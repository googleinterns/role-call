import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {of} from 'rxjs';
import {RouterTestingModule} from '@angular/router/testing';
import {createSpyObjWithProps} from 'src/test_utils';
import {Location} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {ChangeDetectorRef} from '@angular/core';

import {CsvGenerator} from '../services/csv-generator.service';
import {PerformanceApi} from '../api/performance-api.service';
import {UserApi} from '../api/user_api.service';
import {PieceApi} from '../api/piece_api.service';
import {CastApi} from '../api/cast_api.service';
import {ResponseStatusHandlerService} from '../services/response-status-handler.service';

import {PerformanceEditor} from './performance-editor.component';
import {PerformanceModule} from './performance.module';

describe('PerformanceEditorComponent', () => {
  const fakeResponseStatusHandlerService = {} as ResponseStatusHandlerService;
  const fakeChangeDetectorRef = {} as ChangeDetectorRef;
  const fakeActivatedRoute = {snapshot: {params: {uuid: 'testUUID'}}};
  const fakeCsvGenerator = {} as CsvGenerator;
  const mockPerformanceApi = createSpyObjWithProps<PerformanceApi>({
    baseName: 'mockUserApi',
    methods: {getAllPerformances: Promise.resolve([])},
    props: {performanceEmitter: of([])},
  });
  const mockUserApi = createSpyObjWithProps<UserApi>({
    baseName: 'mockUserApi',
    methods: {getAllUsers: Promise.resolve([])},
    props: {userEmitter: of([])},
  });
  const mockPieceApi = createSpyObjWithProps<PieceApi>({
    baseName: 'mockPieceApi',
    methods: {getAllPieces: Promise.resolve([])},
    props: {pieceEmitter: of([])},
  });
  const mockCastApi = createSpyObjWithProps<CastApi>({
    baseName: 'mockCastApi',
    methods: {getAllCasts: Promise.resolve([])},
    props: {castEmitter: of([])},
  });
  const mockLocation = jasmine.createSpyObj<Location>('mockLocation',
      ['replaceState']);

  let component: PerformanceEditor;
  let fixture: ComponentFixture<PerformanceEditor>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
          declarations: [PerformanceEditor],
          imports: [
            PerformanceModule,
            RouterTestingModule,
          ],
          providers: [
            {provide: PerformanceApi, useValue: mockPerformanceApi},
            {provide: UserApi, useValue: mockUserApi},
            {provide: PieceApi, useValue: mockPieceApi},
            {provide: CastApi, useValue: mockCastApi},
            {
              provide: ResponseStatusHandlerService,
              useValue: fakeResponseStatusHandlerService
            },
            {provide: ChangeDetectorRef, useValue: fakeChangeDetectorRef},
            {provide: ActivatedRoute, useValue: fakeActivatedRoute},
            {provide: Location, useValue: mockLocation},
            {provide: CsvGenerator, useValue: fakeCsvGenerator},
          ]
        })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
