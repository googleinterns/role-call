import { HttpClient, HttpResponse } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import * as APITypes from 'src/api-types';
import { environment } from 'src/environments/environment';
import { lastValueFrom } from 'rxjs';

import { MockSegmentBackend } from '../mocks/mock-segment-backend';
import { HeaderUtilityService } from '../services/header-utility.service';
import { LoggingService } from '../services/logging.service';
import { ResponseStatusHandlerService,
} from '../services/response-status-handler.service';

type RawPosition = {
  id: number;
  name: string;
  notes: string;
  order: number;
  siblingId: number;
  size: number;
};

type RawSegment = {
  id: number;
  name: string;
  notes: string;
  siblingId: number;
  type: SegmentType;
  length: number;
  positions: RawPosition[];
};

type RawAllSegmentsResponse = {
  data: RawSegment[];
  warnings: string[];
};

export type Position = {
  id?: number;
  uuid: string;
  name: string;
  notes: string;
  order: number;
  siblingId: number;
  size: number;
};

export type SegmentType = 'SEGMENT' | 'BALLET' | 'SUPER' | 'UNDEF';

export type Segment = {
  uuid: string;
  name: string;
  isOpen: boolean;
  siblingId: number;
  type: SegmentType;
  positions: Position[];
  deletePositions: Position[];
  // For frontend use only. Is not saved.
  hasAbsence?: boolean;
};

export type AllSegmentsResponse = {
  data: {
    segments: Segment[];
  };
  warnings: string[];
};

export type OneSegmentResponse = {
  data: {
    segment: Segment;
  };
  warnings: string[];
};

/**
 * A service responsible for interfacing with the Sections API and
 * maintaining section data.
 */
@Injectable({providedIn: 'root'})
export class SegmentApi {
  /** Mock backend. */
  mockBackend: MockSegmentBackend = new MockSegmentBackend();

  /** All the loaded segments mapped by UUID. */
  segments: Map<APITypes.SegmentUUID, Segment> =
      new Map<APITypes.SegmentUUID, Segment>();

  /** The raw segment structures given by the backend. */
  rawSegments: RawSegment[] = [];

  /** Emitter that is called whenever segments are loaded. */
  segmentEmitter: EventEmitter<Segment[]> = new EventEmitter();

  constructor(
      private loggingService: LoggingService,
      private http: HttpClient,
      private respHandler: ResponseStatusHandlerService,
      private headerUtil: HeaderUtilityService,
  ) {
  }

  /** Hits backend with all segments GET request. */
  requestAllSegments = async (): Promise<AllSegmentsResponse> => {
    if (environment.mockBackend) {
      return this.mockBackend.requestAllSegments();
    }
    const header = await this.headerUtil.generateHeader();
    return lastValueFrom(this.http.get<RawAllSegmentsResponse>(
        environment.backendURL + 'api/section', {
          headers: header,
          observe: 'response',
          withCredentials: true
        }))
        .catch(errorResp => errorResp)
        .then(resp => this.respHandler.checkResponse<RawAllSegmentsResponse>(
            resp)).then(val => {
          this.rawSegments = val.data;
          return {
            data: {
              segments: val.data.map(section => ({
                  uuid: String(section.id),
                  name: section.name,
                  isOpen: false,
                  siblingId: section.siblingId,
                  type: section.type,
                  positions: section.positions.sort(
                      (a, b) => a.order < b.order ? -1 : 1)
                      .map(pos => ({
                          ...pos,
                          uuid: String(pos.id),
                        })
                      ),
                  deletePositions: []
                })
              )
            },
            warnings: val.warnings
          };
        });
  };

  /** Hits backend with create/edit segment POST request. */
  requestSegmentSet = async (
    segment: Segment,
  ): Promise<HttpResponse<any>> => {
    if (environment.mockBackend) {
      return this.mockBackend.requestSegmentSet(segment);
    }
    // If we already have the segment by UUID (i.e. it exists on the backend),
    // then do a PATCH, else do a POST
    if (this.segments.has(segment.uuid)) {
      // Do patch
      const header = await this.headerUtil.generateHeader();
      return lastValueFrom(this.http.patch(
        environment.backendURL + 'api/section', {
            name: segment.name,
            id: Number(segment.uuid),
            siblingId: segment.siblingId,
            type: segment.type ? segment.type : 'BALLET',
            positions: segment.positions.map(val => ({
                ...val,
                delete: false
              })
            ).concat(segment.deletePositions.map(val => ({
                ...val,
                delete: true
              })
            ))
          }, {
            headers: header,
            observe: 'response',
            withCredentials: true
          }))
          .catch(errorResp => errorResp)
          .then(resp => this.respHandler.checkResponse<any>(resp));
    } else {
      // Do post
      const header = await this.headerUtil.generateHeader();
      return lastValueFrom(this.http.post(
        environment.backendURL + 'api/section', {
            name: segment.name,
            siblingId: segment.siblingId,
            type: segment.type ? segment.type : 'BALLET',
            positions: segment.positions
          }, {
            headers: header,
            observe: 'response',
            withCredentials: true
          }))
          .catch(errorResp => errorResp)
          .then(resp => this.respHandler.checkResponse<any>(resp));
    }
  };

  /** Hits backend with delete segment POST request. */
  requestSegmentDelete = async (
    segment: Segment,
  ): Promise<HttpResponse<any>> => {
    if (environment.mockBackend) {
      return this.mockBackend.requestSegmentDelete(segment);
    }
    const header = await this.headerUtil.generateHeader();
    return lastValueFrom(this.http.delete(
        environment.backendURL + 'api/section?sectionid=' + segment.uuid, {
          headers: header,
          observe: 'response',
          withCredentials: true,
        }))
        .catch(errorResp => errorResp)
        .then(resp => this.respHandler.checkResponse<any>(resp));
  };


  /** Gets all the segments from the backend and returns them. */
  getAllSegments = async (): Promise<Segment[]> =>
    this.getAllSegmentsResponse().then(val => {
      this.segmentEmitter.emit(Array.from(this.segments.values()));
      return val;
    }).then(val => val.data.segments).catch(() =>
      []
    );


  /**
   * Requests an update to the backend which may or may not be successful,
   * depending on whether or not the segment is valid, as well as if the backend
   * request fails for some other reason.
   */
  setSegment = async (
    segment: Segment,
  ): Promise<APITypes.SuccessIndicator> =>
    this.setSegmentResponse(segment).then(() => {
      this.getAllSegments();
      return {
        successful: true,
      };
    }).catch(reason => ({
        successful: false,
        error: reason,
      })
    );


  /** Requests for the backend to delete the segment. */
  deleteSegment = async (
    segment: Segment,
  ): Promise<APITypes.SuccessIndicator> =>
    this.deleteSegmentResponse(segment).then(() => {
      this.getAllSegments();
      return {
        successful: true,
      };
    }).catch(reason => ({
        successful: false,
        error: reason,
      })
    );


  // Private methods

  /** Takes backend response, updates data structures for all segments. */
  private getAllSegmentsResponse = async (
  ): Promise<AllSegmentsResponse> =>
    this.requestAllSegments().then(val => {
      // Update the segments map
      this.segments.clear();
      for (const segment of val.data.segments) {
        this.segments.set(segment.uuid, segment);
      }
      // Log any warnings
      for (const warning of val.warnings) {
        this.loggingService.logWarn(warning);
      }
      return val;
    });


  /** Sends backend request and awaits response. */
  private setSegmentResponse = async (
    segment: Segment,
  ): Promise<HttpResponse<any>> =>
    this.requestSegmentSet(segment);


  /** Sends backend request and awaits response. */
  private deleteSegmentResponse = async (
    segment: Segment,
  ): Promise<HttpResponse<any>> =>
    this.requestSegmentDelete(segment);


}
