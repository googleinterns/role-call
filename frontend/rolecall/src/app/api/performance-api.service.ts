import { HttpClient, HttpResponse } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { APITypes } from 'src/types';
import { MockPerformanceBackend } from '../mocks/mock_performance_backend';
import { LoggingService } from '../services/logging.service';


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
      uses_premade_group: boolean,
      premade_group_uuid: string,
      custom_groups: {
        position_uuid: string,
        groups: {
          position_uuid: string,
          group_index: number,
          members: { uuid: string, position_number: number }[]
        }[]
      }[]
    }[]
  }
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

  constructor(private loggingService: LoggingService, private http: HttpClient) { }

  /** Hits backend with all performances GET request */
  requestAllPerformances(): Promise<AllPerformancesResponse> {
    if (environment.mockBackend) {
      return this.mockBackend.requestAllPerformances();
    }
    return this.mockBackend.requestAllPerformances();
  }

  /** Hits backend with one performance GET request */
  requestOnePerformance(uuid: APITypes.UserUUID): Promise<OnePerformanceResponse> {
    return this.mockBackend.requestOnePerformance(uuid);
  };

  /** Hits backend with create/edit performance POST request */
  requestPerformanceSet(performance: Performance): Promise<HttpResponse<any>> {
    if (environment.mockBackend) {
      return this.mockBackend.requestPerformanceSet(performance);
    }
    return this.mockBackend.requestPerformanceSet(performance);
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
