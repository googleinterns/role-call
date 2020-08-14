import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { MockDashboardBackend } from '../mocks/mock_dashboard_backend';
import { HeaderUtilityService } from '../services/header-utility.service';
import { LoggingService } from '../services/logging.service';
import { ResponseStatusHandlerService } from '../services/response-status-handler.service';

export type DashPerformance = {
  id: number,
  title: string,
  decsription: string,
  location: string,
  dateTime: number,
  status: "CANCELED"
};

export type AllDashResponse = {
  data: {
    performances: DashPerformance[]
  },
  warnings: string[]
};


/**
 * A service responsible for interfacing with the User API and
 * keeping track of all users by ID
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardApi {

  /** Mock backend */
  mockBackend: MockDashboardBackend = new MockDashboardBackend();

  constructor(private loggingService: LoggingService, private http: HttpClient,
    private headerUtil: HeaderUtilityService, private respHandler: ResponseStatusHandlerService) { }

  /** Hits backend with all dash GET request */
  async requestAllDashboard(): Promise<AllDashResponse> {
    if (environment.mockBackend) {
      return this.mockBackend.requestAllDashboard();
    }
    return this.http.get<AllDashResponse>(environment.backendURL + "api/dashboard", {
      headers: await this.headerUtil.generateHeader(),
      observe: "response",
      withCredentials: true
    }).toPromise().catch((errorResp) => errorResp).then((resp) => this.respHandler.checkResponse<AllDashResponse>(resp)).then((val) => {
      return val;
    });
  }

  /** All the loaded dashboard performances mapped by UUID */
  dashPerformances: Map<number, DashPerformance> = new Map<number, DashPerformance>();

  /** Emitter that is called whenever dashboard performances are loaded */
  dashPerformanceEmitter: EventEmitter<DashPerformance[]> = new EventEmitter();

  /** Takes backend response, updates data structures for all dash performances */
  private getAllDashResponse(): Promise<AllDashResponse> {
    return this.requestAllDashboard().then(val => {
      // Update the dashboard performance map
      this.dashPerformances.clear();
      for (let dashPerf of val.data.performances) {
        this.dashPerformances.set(dashPerf.id, dashPerf);
      }
      // Log any warnings
      for (let warning of val.warnings) {
        this.loggingService.logWarn(warning);
      }
      return val;
    });
  }

  /** Gets all the users from the backend and returns them */
  getAllDashboard(): Promise<DashPerformance[]> {
    return this.getAllDashResponse().then(val => {
      this.dashPerformanceEmitter.emit(Array.from(this.dashPerformances.values()));
      return val;
    }).then(val => val.data.performances).catch(err => {
      return [];
    });
  }

}
