import { HttpClient, HttpResponse } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { APITypes } from 'src/types';
import { MockPerformanceBackend } from '../mocks/mock_performance_backend';
import { HeaderUtilityService } from '../services/header-utility.service';
import { LoggingService } from '../services/logging.service';
import { ResponseStatusHandlerService } from '../services/response-status-handler.service';


export type Performance = {
  uuid: string,
  step_1: {
    title: string,
    date: number,
    location: string,
    description: string,
  },
  step_2: {
    segments: string[],
  },
  step_3: {
    segments: {
      segment: string,
      type: "intermission" | "segment",
      length: number,
      selected_group: number,
      custom_groups: {
        position_uuid: string,
        groups: {
          group_index: number,
          members: { uuid: string, position_number: number }[]
        }[]
      }[]
    }[]
  }
}

export type RawAllPerformancesResponse = {
  data: RawPerformance[];
  warnings: string[];
}

export type RawPerformance = {
  "id": number,
  "title": string,
  "description": string,
  "location": string,
  "dateTime": number,
  "status": string,
  "PerformanceSections":
  {
    "id"?: number,
    "sectionPosition": number,
    "primaryCast": number,
    "sectionId": number,
    "positions":
    {
      "positionId": number,
      "casts":
      {
        "castNumber": number,
        "members":
        {
          "id"?: number,
          "order": number,
          "userId": number,
          "performing": boolean
        }[]
      }[]
    }[]
  }[]
}

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

@Injectable({
  providedIn: 'root'
})
export class PerformanceApi {


  /** Mock backend */
  mockBackend: MockPerformanceBackend = new MockPerformanceBackend();

  constructor(private loggingService: LoggingService, private http: HttpClient,
    private headerUtil: HeaderUtilityService, private respHandler: ResponseStatusHandlerService) { }

  convertRawToPerformance(raw: RawPerformance): Performance {
    return {
      uuid: String(raw.id),
      step_1: {
        title: raw.title,
        description: raw.description,
        date: raw.dateTime,
        location: raw.location
      },
      step_2: {
        segments: raw.PerformanceSections.map(val => val).sort((a, b) => {
          return a.sectionPosition < b.sectionPosition ? -1 : 1;
        }).map(val => String(val.sectionId))
      },
      step_3: {
        segments: raw.PerformanceSections.map(val => {
          return {
            segment: val.positions.length == 0 ? "intermission" : String(val.sectionId),
            type: val.positions.length == 0 ? "intermission" : "segment",
            length: 0,
            selected_group: val.primaryCast,
            custom_groups: val.positions.map(pos => {
              return {
                position_uuid: String(pos.positionId),
                groups: pos.casts.map(c => {
                  return {
                    group_index: c.castNumber,
                    members: c.members.map(mem => {
                      return {
                        uuid: String(mem.userId),
                        position_number: mem.order
                      }
                    })
                  }
                })

              }
            })
          }
        })
      }
    }
  }

  convertPerformanceToRaw(perf: Performance): RawPerformance {
    return {
      id: Number(perf.uuid),
      title: perf.step_1.title,
      description: perf.step_1.description,
      location: perf.step_1.location,
      dateTime: perf.step_1.date,
      status: "",
      PerformanceSections: perf.step_3.segments.map((seg, ind) => {
        return {
          sectionPosition: ind,
          primaryCast: seg.selected_group,
          sectionId: Number(seg.segment),
          positions: seg.custom_groups.map(cg => {
            return {
              positionId: Number(cg.position_uuid),
              casts: cg.groups.map(c => {
                return {
                  castNumber: c.group_index,
                  members: c.members.map(mem => {
                    return {
                      order: mem.position_number,
                      userId: Number(mem.uuid),
                      performing: c.group_index == seg.selected_group
                    }
                  })
                }
              })
            }
          })
        }

      })
    }
  }

  /** Hits backend with all performances GET request */
  async requestAllPerformances(): Promise<AllPerformancesResponse> {
    if (environment.mockBackend) {
      return this.mockBackend.requestAllPerformances();
    }
    let header = await this.headerUtil.generateHeader();
    return this.http.get<RawAllPerformancesResponse>(environment.backendURL + "api/performance", {
      headers: header,
      observe: "response",
      withCredentials: true
    }).toPromise().then((resp) => this.respHandler.checkResponse<RawAllPerformancesResponse>(resp)).then((val) => {
      return { data: { performances: val.data.map(val => this.convertRawToPerformance(val)) }, warnings: val.warnings };
    });
  }

  /** Hits backend with one performance GET request */
  requestOnePerformance(uuid: APITypes.UserUUID): Promise<OnePerformanceResponse> {
    return this.mockBackend.requestOnePerformance(uuid);
  };

  /** Hits backend with create/edit performance POST request */
  async requestPerformanceSet(performance: Performance): Promise<HttpResponse<any>> {
    if (environment.mockBackend) {
      return this.mockBackend.requestPerformanceSet(performance);
    }
    let header = await this.headerUtil.generateHeader();
    console.log(header);
    return this.http.post<HttpResponse<any>>(environment.backendURL + "api/performance",
      this.convertPerformanceToRaw(performance),
      {
        headers: header,
        observe: "response",
        withCredentials: true
      }).toPromise().then((resp) => this.respHandler.checkResponse<HttpResponse<any>>(resp)).then(val => {
        return this.getAllPerformances().then(() => val);
      });
  }
  /** 
   * Hits backend with delete performance POST request */
  requestPerformanceDelete(performance: Performance): Promise<HttpResponse<any>> {
    if (environment.mockBackend) {
      return this.mockBackend.requestPerformanceDelete(performance);
    }
    return this.mockBackend.requestPerformanceDelete(performance);
  }

  /** All the loaded performances mapped by UUID */
  performances: Map<APITypes.PerformanceUUID, Performance> = new Map<APITypes.PerformanceUUID, Performance>();

  /** Emitter that is called whenever performances are loaded */
  performanceEmitter: EventEmitter<Performance[]> = new EventEmitter();

  /** Takes backend response, updates data structures for all users */
  private getAllPerformancesResponse(): Promise<AllPerformancesResponse> {
    return this.requestAllPerformances().then(val => {
      // Update the performances map
      this.performances.clear();
      for (let performance of val.data.performances) {
        this.performances.set(performance.uuid, performance);
      }
      // Log any warnings
      for (let warning of val.warnings) {
        this.loggingService.logWarn(warning);
      }
      return val;
    });
  }

  /** Takes backend response, updates data structure for one performance */
  private getOnePerformanceResponse(uuid: APITypes.PerformanceUUID): Promise<OnePerformanceResponse> {
    return this.requestOnePerformance(uuid).then(val => {
      // Update performance in map
      this.performances.set(val.data.performance.uuid, val.data.performance);
      // Log any warnings
      for (let warning of val.warnings) {
        this.loggingService.logWarn(warning);
      }
      return val;
    })
  }

  /** Sends backend request and awaits reponse */
  private setPerformanceResponse(performance: Performance): Promise<HttpResponse<any>> {
    return this.requestPerformanceSet(performance);
  }

  /** Sends backend request and awaits reponse */
  private deletePerformanceResponse(performance: Performance): Promise<HttpResponse<any>> {
    return this.requestPerformanceDelete(performance);
  }

  /** Gets all the performances from the backend and returns them */
  getAllPerformances(): Promise<Performance[]> {
    return this.getAllPerformancesResponse().then(val => {
      this.performanceEmitter.emit(Array.from(this.performances.values()));
      return val;
    }).then(val => val.data.performances);
  }

  /** Gets a specific performance from the backend by UUID and returns it */
  getPerformance(uuid: APITypes.PerformanceUUID): Promise<Performance> {
    return this.getOnePerformanceResponse(uuid).then(val => {
      this.performanceEmitter.emit(Array.from(this.performances.values()));
      return val;
    }).then(val => val.data.performance);
  }

  /** Requests an update to the backend which may or may not be successful,
   * depending on whether or not the performance is valid, as well as if the backend
   * request fails for some other reason.
   */
  setPerformance(performance: Performance): Promise<APITypes.SuccessIndicator> {
    return this.setPerformanceResponse(performance).then(val => {
      if (val.status == 200) {
        this.getAllPerformances();
        return {
          successful: true
        }
      } else {
        return {
          successful: false,
          error: "Server failed, try again."
        }
      }
    });
  }

  /** Requests for the backend to delete the performance */
  deletePerformance(performance: Performance): Promise<APITypes.SuccessIndicator> {
    return this.deletePerformanceResponse(performance).then(val => {
      this.getAllPerformances();
      if (val.status == 200) {
        return {
          successful: true
        }
      } else {
        return {
          successful: false,
          error: "Server failed, try again."
        }
      }
    });
  }


}
