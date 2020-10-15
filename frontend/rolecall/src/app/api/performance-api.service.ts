import {HttpClient, HttpResponse} from '@angular/common/http';
import {EventEmitter, Injectable} from '@angular/core';
import * as APITypes from 'src/api_types';
import {environment} from 'src/environments/environment';

import {MockPerformanceBackend} from '../mocks/mock_performance_backend';
import {HeaderUtilityService} from '../services/header-utility.service';
import {LoggingService} from '../services/logging.service';
import {ResponseStatusHandlerService} from '../services/response-status-handler.service';

export type Performance = {
  uuid: string,
  status: APITypes.PerformanceStatus.DRAFT |
      APITypes.PerformanceStatus.PUBLISHED |
      APITypes.PerformanceStatus.CANCELED,
  step_1: {
    title: string,
    date: number,
    city: string,
    state: string,
    country: string,
    venue: string,
    description: string,
  },
  step_2: {
    segments: string[],
  },
  step_3: {
    segments: {
      id: string,
      segment: string,
      length: number,
      selected_group: number,
      custom_groups: {
        position_uuid: string,
        position_order: number,
        groups: {
          group_index: number,
          members: { uuid: string, position_number: number }[]
        }[]
      }[]
    }[]
  }
};

export type RawAllPerformancesResponse = {
  data: RawPerformance[];
  warnings: string[];
};

export type RawPerformance = {
  'id': number,
  'title': string,
  'description': string,
  'city': string,
  'state': string,
  'country': string,
  'venue': string,
  'dateTime': number,
  'status': string,
  'performanceSections':
      {
        'id'?: number,
        'sectionPosition': number,
        'primaryCast': number,
        'sectionId': number,
        'positions':
            {
              'positionId': number,
              'positionOrder': number,
              'casts':
                  {
                    'castNumber': number,
                    'members':
                        {
                          'id'?: number,
                          'order': number,
                          'userId': number,
                          'performing': boolean
                        }[]
                  }[]
            }[]
      }[]
};

export type AllPerformancesResponse = {
  data: {
    performances: Performance[]
  },
  warnings: string[]
};

export type OnePerformanceResponse = {
  data: {
    performance: Performance
  },
  warnings: string[]
};

/**
 * A service responsible for interfacing with the Performance APIs, as well
 * as maintaining the performance data.
 */
@Injectable({providedIn: 'root'})
export class PerformanceApi {

  /** Mock backend. */
  mockBackend: MockPerformanceBackend = new MockPerformanceBackend();

  constructor(
      private loggingService: LoggingService,
      private http: HttpClient,
      private headerUtil: HeaderUtilityService,
      private respHandler: ResponseStatusHandlerService) {
  }

  /**
   * Converts a raw performance response to the performance structure
   * for the performance editor.
   *
   * @param raw The raw performance from the backend
   */
  convertRawToPerformance(raw: RawPerformance): Performance {
    return {
      uuid: String(raw.id),
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
        state: raw.state
      },
      step_2: {
        segments: raw.performanceSections.map(val => val).sort((a, b) => {
          return a.sectionPosition < b.sectionPosition ? -1 : 1;
        }).map(val => String(val.sectionId))
      },
      step_3: {
        segments: raw.performanceSections.map(val => {
          return {
            id: String(val.id),
            segment: String(val.sectionId),
            length: 0,
            selected_group: val.primaryCast,
            custom_groups: val.positions.map((position, positionIx) => {
              return {
                position_uuid: String(position.positionId),
                position_order: position.positionOrder,
                groups: position.casts.map((sumCast, subCastIx) => {
                  return {
                    group_index: sumCast.castNumber,
                    members: sumCast.members.map(mem => {
                      return {
                        uuid: String(mem.userId),
                        position_number: mem.order
                      };
                    })
                  };
                })
              };
            })
          };
        })
      }
    };
  }

  /**
   * Converts a performance editor performance into a
   * backend performance to be set on the backend.
   *
   * @param perf The performance editor performance state
   */
  convertPerformanceToRaw(perf: Performance): RawPerformance {
    return {
      id: isNaN(Number(perf.uuid)) ? null : Number(perf.uuid),
      title: perf.step_1.title,
      description: perf.step_1.description,
      city: perf.step_1.city,
      country: perf.step_1.country,
      venue: perf.step_1.venue,
      state: perf.step_1.state,
      dateTime: perf.step_1.date,
      status: perf.status ? perf.status : APITypes.PerformanceStatus.DRAFT,
      performanceSections: perf.step_3.segments.map((seg, segIx) => {
        return {
          id: seg.id ? Number(seg.id) : undefined,
          sectionPosition: segIx,
          primaryCast: seg.selected_group,
          sectionId: Number(seg.segment),
          positions: seg.custom_groups.map((customGroup, customGroupIx) => {
            return {
              positionId: Number(customGroup.position_uuid),
              positionOrder: customGroup.position_order,
              casts: customGroup.groups.map((subCast, subCastIx) => {
                return {
                  castNumber: subCast.group_index,
                  members: subCast.members.map(mem => {
                    return {
                      order: mem.position_number,
                      userId: Number(mem.uuid),
                      performing: subCast.group_index === seg.selected_group
                    };
                  })
                };
              })
            };
          })
        };
      })
    };
  }

  /**
   * Takes a raw performance and calculates which performance sections
   * are missing from it since the last backend update, and resolves
   * the deleted sections to be marked for deletion on the backend
   * (since the backend requires a delete tag to remove objects rather
   * than simply omitting them).
   *
   * @param rawPerf The raw performance being patched
   */
  deletePreviousGroups(rawPerf: RawPerformance) {
    rawPerf.performanceSections.push(
        ...(rawPerf.performanceSections.map(sec => {
          const copy = JSON.parse(JSON.stringify(sec));
          copy['delete'] = true;
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
        .filter(
            val => {
              return rawPerf.performanceSections.find(
                  perfSec => String(perfSec.id) === val.id) === undefined;
            }
        );
    // Add the deleted sections with delete tags
    rawPerf.performanceSections.push(
        ...(deletedSections.map(sec => {
          return {
            delete: true,
            id: Number(sec.id),
            segment: Number(sec.segment),
            primaryCast: sec.selected_group,
            sectionId: Number(sec.id),
            sectionPosition: undefined,
            positions: []
          };
        }))
    );
    // If we are not deleting the section, meaning we are uploading it,
    // give it an undefined id to be set by the backend
    rawPerf.performanceSections = rawPerf.performanceSections.map(val => {
      if (!val['delete']) {
        val['id'] = undefined;
        return val;
      } else {
        return val;
      }
    }).filter(val => (!(val['delete'] && val['id'] === undefined)));
    // Ensure only 1 deleted perf section for each performance section to be
    // deleted
    const uuidSet: Set<number> = new Set();
    rawPerf.performanceSections = rawPerf.performanceSections.filter(pS => {
      if (pS.id === undefined || (!pS['delete'])) {
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
  }

  /** Hits backend with all performances GET request. */
  async requestAllPerformances(): Promise<AllPerformancesResponse> {
    if (environment.mockBackend) {
      return this.mockBackend.requestAllPerformances();
    }
    const header = await this.headerUtil.generateHeader();
    return this.http.get<RawAllPerformancesResponse>(
        environment.backendURL + 'api/performance', {
              headers: header,
              observe: 'response',
              withCredentials: true
            })
        .toPromise()
        .catch((errorResp) => errorResp)
        .then(
            (resp) =>
                this.respHandler.checkResponse<RawAllPerformancesResponse>(
                    resp))
        .then((rawAllPerformancesResponse) => {
          return {
            data: {
              performances: rawAllPerformancesResponse.data.map(
                  rawPerformance => {
                    return this.convertRawToPerformance(rawPerformance);
                  })
            }, warnings: rawAllPerformancesResponse.warnings
          };
        });
  }

  /** Hits backend with one performance GET request. */
  requestOnePerformance(uuid: APITypes.UserUUID):
      Promise<OnePerformanceResponse> {
    return this.mockBackend.requestOnePerformance(uuid);
  }

  /** Hits backend with create/edit performance POST request. */
  async requestPerformanceSet(performance: Performance):
      Promise<HttpResponse<any>> {
    if (environment.mockBackend) {
      return this.mockBackend.requestPerformanceSet(performance);
    }
    if (this.performances.has(performance.uuid)) {
      const header = await this.headerUtil.generateHeader();
      return this.http.patch<HttpResponse<any>>(
          environment.backendURL + 'api/performance',
          this.deletePreviousGroups(this.convertPerformanceToRaw(performance)),
          {
            headers: header,
            observe: 'response',
            withCredentials: true
          })
          .toPromise()
          .catch((errorResp) => errorResp)
          .then(
              (resp) => this.respHandler.checkResponse<HttpResponse<any>>(resp))
          .then(val => {
            return this.getAllPerformances().then(() => val);
          });
    } else {
      const header = await this.headerUtil.generateHeader();
      return this.http.post<HttpResponse<any>>(
          environment.backendURL + 'api/performance',
          this.convertPerformanceToRaw(performance),
          {
            headers: header,
            observe: 'response',
            withCredentials: true
          })
          .toPromise()
          .catch((errorResp) => errorResp)
          .then(
              (resp) => this.respHandler.checkResponse<HttpResponse<any>>(resp))
          .then(val => {
            return this.getAllPerformances().then(() => val);
          });
    }
  }

  /** Hits backend with delete performance POST request. */
  async requestPerformanceDelete(performance: Performance):
      Promise<HttpResponse<any>> {
    if (environment.mockBackend) {
      return this.mockBackend.requestPerformanceDelete(performance);
    }
    const header = await this.headerUtil.generateHeader();
    return this.http.delete(
        environment.backendURL + 'api/performance?performanceid='
        + performance.uuid,
        {
          headers: header,
          observe: 'response',
          withCredentials: true
        })
        .toPromise()
        .catch((errorResp) => errorResp)
        .then((resp) => this.respHandler.checkResponse<any>(resp));
  }

  /** All the loaded performances mapped by UUID. */
  performances: Map<APITypes.PerformanceUUID, Performance> =
      new Map<APITypes.PerformanceUUID, Performance>();

  /** Emitter that is called whenever performances are loaded. */
  performanceEmitter: EventEmitter<Performance[]> = new EventEmitter();

  /** Takes backend response, updates data structures for all performances. */
  private getAllPerformancesResponse(): Promise<AllPerformancesResponse> {
    return this.requestAllPerformances().then(val => {
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
  }

  /** Takes backend response, updates data structure for one performance. */
  private getOnePerformanceResponse(uuid: APITypes.PerformanceUUID):
      Promise<OnePerformanceResponse> {
    return this.requestOnePerformance(uuid).then(val => {
      // Update performance in map
      this.performances.set(val.data.performance.uuid, val.data.performance);
      // Log any warnings
      for (const warning of val.warnings) {
        this.loggingService.logWarn(warning);
      }
      return val;
    });
  }

  /** Sends backend request and awaits response. */
  private setPerformanceResponse(performance: Performance):
      Promise<HttpResponse<any>> {
    return this.requestPerformanceSet(performance);
  }

  /** Sends backend request and awaits response. */
  private deletePerformanceResponse(performance: Performance):
      Promise<HttpResponse<any>> {
    return this.requestPerformanceDelete(performance);
  }

  /** Gets all the performances from the backend and returns them. */
  getAllPerformances(): Promise<Performance[]> {
    return this.getAllPerformancesResponse().then(val => {
      this.performanceEmitter.emit(Array.from(this.performances.values()));
      return val;
    }).then(val => val.data.performances).catch(err => {
      return [];
    });
  }

  /** Gets a specific performance from the backend by UUID and returns it. */
  getPerformance(uuid: APITypes.PerformanceUUID): Promise<Performance> {
    return this.getOnePerformanceResponse(uuid).then(val => {
      this.performanceEmitter.emit(Array.from(this.performances.values()));
      return val;
    }).then(val => val.data.performance);
  }

  /**
   * Requests an update to the backend which may or may not be successful,
   * depending on whether or not the performance is valid, as well as if the
   * backend request fails for some other reason.
   */
  setPerformance(performance: Performance): Promise<APITypes.SuccessIndicator> {
    return this.setPerformanceResponse(performance).then(async val => {
      await this.getAllPerformances();
      return {
        successful: true
      };
    }).catch(reason => {
      return {
        successful: false,
        error: reason
      };
    });
  }

  /** Requests for the backend to delete the performance. */
  deletePerformance(performance: Performance):
      Promise<APITypes.SuccessIndicator> {
    return this.deletePerformanceResponse(performance).then(val => {
      this.getAllPerformances();
      return {
        successful: true
      };
    }).catch(reason => {
      return {
        successful: false,
        error: reason
      };
    });
  }
}
