/* eslint-disable @typescript-eslint/naming-convention */

import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import * as APITypes from 'src/api-types';
import { environment } from 'src/environments/environment';
import { lastValueFrom } from 'rxjs';

import { MockPerformanceBackend } from '../mocks/mock-performance-backend';
import { HeaderUtilityService } from '../services/header-utility.service';
import { LoggingService } from '../services/logging.service';
import { ResponseStatusHandlerService,
} from '../services/response-status-handler.service';
import { GlobalsService } from '../services/globals.service';

type Group = {
  group_index: number;
  members: {
    uuid: string;
    position_number: number;
  }[];
  memberNames?: string[];
};

type CustomGroup = {
  position_uuid: string;
  position_order: number;
  groups: Group[];
  name?: string;
};

export type PerformanceSegment = {
  id: string;
  segment: string;
  length: number;
  selected_group: number;
  custom_groups: CustomGroup[];
  name?: string;
};

export type Performance = {
  uuid: string;
  // Should be removed?
  dateTime?: number;
  status: APITypes.PerformanceStatus.DRAFT |
      APITypes.PerformanceStatus.PUBLISHED |
      APITypes.PerformanceStatus.CANCELED;
  step_1: {
    title: string;
    date: number;
    city: string;
    state: string;
    country: string;
    venue: string;
    description: string;
  };
  step_2: {
    segments: string[];
  };
  step_3: {
    segments: PerformanceSegment[];
  };
  // For frontend use only. Is not saved.
  hasAbsence?: boolean;
};

export type RawAllPerformancesResponse = {
  data: RawPerformance[];
  warnings: string[];
};

export type RawPerformance = {
  id: number;
  title: string;
  description: string;
  city: string;
  state: string;
  country: string;
  venue: string;
  dateTime: number;
  status: string;
  hasAbsence?: boolean;
  performanceSections: {
    id?: number;
    // may not exist. Only set on way to server.
    delete?: boolean;
    sectionPosition: number;
    primaryCast: number;
    sectionId: number;
    positions: {
      positionId: number;
      positionOrder: number;
      casts: {
        castNumber: number;
        members: {
          id?: number;
          order: number;
          userId: number;
          performing: boolean;
          hasAbsence?: boolean;
        }[];
      }[];
    }[];
  }[];
};

export type AllPerformancesResponse = {
  data: {
    performances: Performance[];
  };
  warnings: string[];
};

export type OnePerformanceResponse = {
  data: {
    performance: Performance;
  };
  warnings: string[];
};

/**
 * A service responsible for interfacing with the Performance APIs, as well
 * as maintaining the performance data.
 */
@Injectable({providedIn: 'root'})
export class PerformanceApi {
  /** Mock backend. */
  mockBackend: MockPerformanceBackend = new MockPerformanceBackend();

  /** All the loaded performances mapped by UUID. */
  performances: Map<APITypes.PerformanceUUID, Performance> =
      new Map<APITypes.PerformanceUUID, Performance>();

  /** Emitter that is called whenever performances are loaded. */
  performanceEmitter: EventEmitter<Performance[]> = new EventEmitter();

  constructor(
      private loggingService: LoggingService,
      private http: HttpClient,
      private headerUtil: HeaderUtilityService,
      private respHandler: ResponseStatusHandlerService,

      public g: GlobalsService,
  ) {
  }

  /**
   * Converts a raw performance response to the performance structure
   * for the performance editor.
   *
   * @param raw The raw performance from the backend
   */
  convertRawToPerformance = (raw: RawPerformance): Performance => ({
      uuid: String(raw.id),
      dateTime: raw.dateTime,
      hasAbsence: raw.hasAbsence,
      status: (raw.status === 'DRAFT' || raw.status === 'PUBLISHED'
               || raw.status
               === 'CANCELED')
          ? APITypes.PerformanceStatus[raw.status] :
          APITypes.PerformanceStatus.DRAFT,
      step_1: {
        title: raw.title,
        description: raw.description,
        date: raw.dateTime,
        city: raw.city,
        venue: raw.venue,
        country: raw.country,
        state: raw.state,
      },
      step_2: {
        segments: raw.performanceSections.map(val => val).sort((a, b) =>
          (a.sectionPosition < b.sectionPosition ? -1 : 1)
        ).map(val => String(val.sectionId))
      },
      step_3: {
        segments: raw.performanceSections.map(val => ({
            id: String(val.id),
            segment: String(val.sectionId),
            length: 0,
            selected_group: val.primaryCast,
            custom_groups: val.positions.map(position => ({
                position_uuid: String(position.positionId),
                position_order: position.positionOrder,
                groups: position.casts.map(sumCast => ({
                    group_index: sumCast.castNumber,
                    members: sumCast.members.map(mem => ({
                        uuid: String(mem.userId),
                        position_number: mem.order,
                        hasAbsence: mem.hasAbsence
                      })
                    )
                  })
                )
              })
            )
          })
        )
      }
    });


  /**
   * Converts a performance editor performance into a
   * backend performance to be set on the backend.
   *
   * @param perf The performance editor performance state
   */
  convertPerformanceToRaw = (perf: Performance): RawPerformance => ({
      id: isNaN(Number(perf.uuid)) ? null : Number(perf.uuid),
      title: perf.step_1.title,
      description: perf.step_1.description,
      city: perf.step_1.city,
      country: perf.step_1.country,
      venue: perf.step_1.venue,
      state: perf.step_1.state,
      dateTime: perf.step_1.date,
      status: perf.status ? perf.status : APITypes.PerformanceStatus.DRAFT,
      performanceSections: perf.step_3.segments.map((seg, segIx) => ({
          id: seg.id ? Number(seg.id) : undefined,
          sectionPosition: segIx,
          primaryCast: seg.selected_group,
          sectionId: Number(seg.segment),
          positions: seg.custom_groups.map(customGroup => ({
              positionId: Number(customGroup.position_uuid),
              positionOrder: customGroup.position_order,
              casts: customGroup.groups.map(subCast => ({
                  castNumber: subCast.group_index,
                  members: subCast.members.map(mem => ({
                      order: mem.position_number,
                      userId: Number(mem.uuid),
                      performing: subCast.group_index === seg.selected_group
                    })
                  )
                })
              )
            })
          )
        })
      )
    });


  /**
   * Takes a raw performance and calculates which performance sections
   * are missing from it since the last backend update, and resolves
   * the deleted sections to be marked for deletion on the backend
   * (since the backend requires a delete tag to remove objects rather
   * than simply omitting them).
   *
   * @param rawPerf The raw performance being patched
   */
  deletePreviousGroups = (rawPerf: RawPerformance): RawPerformance => {
    rawPerf.performanceSections.push(
        ...(rawPerf.performanceSections.map(sec => {
          const copy = JSON.parse(JSON.stringify(sec));
          copy.delete = true;
          copy.sectionPosition = undefined;
          copy.positions = [];
          return copy;
        }))
    );
    // Using the original data in the map, find the deleted sections
    // in the performance
    const deletedSections = this.performances.get(String(rawPerf.id))
        .step_3
        .segments
        .filter(val =>
              rawPerf.performanceSections.find(
                  perfSec => String(perfSec.id) === val.id) === undefined
        );
    // Add the deleted sections with delete tags
    rawPerf.performanceSections.push(
        ...(deletedSections.map(sec => ({
            delete: true,
            id: Number(sec.id),
            segment: Number(sec.segment),
            primaryCast: sec.selected_group,
            sectionId: Number(sec.id),
            sectionPosition: undefined,
            positions: [],
          })
        ))
    );
    // If we are not deleting the section, meaning we are uploading it,
    // give it an undefined id to be set by the backend
    rawPerf.performanceSections = rawPerf.performanceSections.map(val => {
      if (!val.delete) {
        val.id = undefined;
        return val;
      } else {
        return val;
      }
    }).filter(val => (!(val.delete && val.id === undefined)));
    // Ensure only 1 deleted perf section for each performance section to be
    // deleted
    const uuidSet: Set<number> = new Set();
    rawPerf.performanceSections = rawPerf.performanceSections.filter(pS => {
      if (pS.id === undefined || (!pS.delete)) {
        return true;
      }
      if (uuidSet.has(pS.id)) {
        return false;
      } else {
        uuidSet.add(pS.id);
        return true;
      }
    });
    return rawPerf;
  };

  /** Hits backend with all performances GET request. */
  requestAllPerformances = async (
  ): Promise<AllPerformancesResponse> => {
    if (environment.mockBackend) {
      return this.mockBackend.requestAllPerformances();
    }
    const header = await this.headerUtil.generateHeader();
    const params = new HttpParams().append('checkUnavs',
        `${this.g.checkUnavs}`);
    return lastValueFrom(this.http.get<RawAllPerformancesResponse>(
        environment.backendURL + 'api/performance', {
          headers: header,
          observe: 'response',
          withCredentials: true,
          params,
        }))
        .catch(errorResp => errorResp)
        .then(resp =>
            this.respHandler.checkResponse<RawAllPerformancesResponse>(
                resp))
        .then(rawAllPerformancesResponse => ({
            data: {
              performances: rawAllPerformancesResponse.data.map(
                  rawPerformance =>
                    this.convertRawToPerformance(rawPerformance)
                  )
            }, warnings: rawAllPerformancesResponse.warnings
          })
        );
  };

  /** Hits backend with one performance GET request. */
  requestOnePerformance = async (
    uuid: APITypes.UserUUID,
  ): Promise<OnePerformanceResponse> =>
    this.mockBackend.requestOnePerformance(uuid);


  /** Hits backend with create/edit performance POST request. */
  requestPerformanceSet = async (
    performance: Performance,
  ): Promise<HttpResponse<any>> => {
    if (environment.mockBackend) {
      return this.mockBackend.requestPerformanceSet(performance);
    }
    if (this.performances.has(performance.uuid)) {
      const header = await this.headerUtil.generateHeader();
      return lastValueFrom(this.http.patch<HttpResponse<any>>(
          environment.backendURL + 'api/performance',
          this.deletePreviousGroups(this.convertPerformanceToRaw(performance)),
          {
            headers: header,
            observe: 'response',
            withCredentials: true
          }))
          .catch(errorResp => errorResp)
          .then(resp => this.respHandler.checkResponse<HttpResponse<any>>(resp))
          .then(val =>
            this.getAllPerformances().then(() => val)
          );
    } else {
      const header = await this.headerUtil.generateHeader();
      return lastValueFrom(this.http.post<HttpResponse<any>>(
          environment.backendURL + 'api/performance',
          this.convertPerformanceToRaw(performance),
          {
            headers: header,
            observe: 'response',
            withCredentials: true
          }))
          .catch(errorResp => errorResp)
          .then(resp => this.respHandler.checkResponse<HttpResponse<any>>(resp))
          .then(val =>
            this.getAllPerformances().then(() => val)
          );
    }
  };

  /** Hits backend with delete performance POST request. */
  requestPerformanceDelete = async (
    performance: Performance,
  ): Promise<HttpResponse<any>> => {
    if (environment.mockBackend) {
      return this.mockBackend.requestPerformanceDelete(performance);
    }
    const header = await this.headerUtil.generateHeader();
    return lastValueFrom(this.http.delete(
        environment.backendURL + 'api/performance?performanceid='
        + performance.uuid,
        {
          headers: header,
          observe: 'response',
          withCredentials: true
        }))
        .catch(errorResp => errorResp)
        .then(resp => this.respHandler.checkResponse<any>(resp));
  };

  /** Gets all the performances from the backend and returns them. */
  getAllPerformances = async (): Promise<Performance[]> =>
    this.getAllPerformancesResponse().then(val => {
      this.performanceEmitter.emit(Array.from(this.performances.values()));
      return val;
    }).then(val => val.data.performances).catch(() =>
      []
    );


  /** Gets a specific performance from the backend by UUID and returns it. */
  getPerformance = async (
    uuid: APITypes.PerformanceUUID,
  ): Promise<Performance> =>
    this.getOnePerformanceResponse(uuid).then(val => {
      this.performanceEmitter.emit(Array.from(this.performances.values()));
      return val;
    }).then(val => val.data.performance);


  /**
   * Requests an update to the backend which may or may not be successful,
   * depending on whether or not the performance is valid, as well as if the
   * backend request fails for some other reason.
   */
  setPerformance = async (
    performance: Performance,
  ): Promise<APITypes.SuccessIndicator> =>
    this.setPerformanceResponse(performance).then(async () => {
      await this.getAllPerformances();
      return {
        successful: true
      };
    }).catch(reason => ({
        successful: false,
        error: reason
      })
    );


  /** Requests for the backend to delete the performance. */
  deletePerformance = async (
    performance: Performance,
  ): Promise<APITypes.SuccessIndicator> =>
    this.deletePerformanceResponse(performance).then(() => {
      this.getAllPerformances();
      return {
        successful: true
      };
    }).catch(reason => ({
        successful: false,
        error: reason
      })
    );


  // Private methods

  /** Takes backend response, updates data structures for all performances. */
  private getAllPerformancesResponse = async (
  ): Promise<AllPerformancesResponse> =>
    this.requestAllPerformances().then(val => {
      // Update the performances map
      this.performances.clear();
      for (const performance of val.data.performances) {
        this.performances.set(performance.uuid, performance);
      }
      // Log any warnings
      for (const warning of val.warnings) {
        this.loggingService.logWarn(warning);
      }
      return val;
    });


  /** Takes backend response, updates data structure for one performance. */
  private getOnePerformanceResponse = async (
    uuid: APITypes.PerformanceUUID,
  ): Promise<OnePerformanceResponse> =>
    this.requestOnePerformance(uuid).then(val => {
      // Update performance in map
      this.performances.set(val.data.performance.uuid, val.data.performance);
      // Log any warnings
      for (const warning of val.warnings) {
        this.loggingService.logWarn(warning);
      }
      return val;
    });


  /** Sends backend request and awaits response. */
  private setPerformanceResponse = async (
    performance: Performance,
  ): Promise<HttpResponse<any>> =>
    this.requestPerformanceSet(performance);


  /** Sends backend request and awaits response. */
  private deletePerformanceResponse = async (
    performance: Performance,
  ): Promise<HttpResponse<any>> =>
    this.requestPerformanceDelete(performance);


}
