import {AllDashResponse, DashPerformance} from '../api/dashboard-api.service';


/**
 * Mocks the dashboard backend responses
 */
export class MockDashboardBackend {

  /** Mock dashboard database */
  mockDashPerformanceDB: DashPerformance[] = [];

  /** Mocks backend response */
  requestAllDashboard = (): Promise<AllDashResponse> =>
    Promise.resolve({
      data: {
        performances: this.mockDashPerformanceDB
      },
      warnings: []
    });


}
