import {AllDashResponse, DashPerformance} from '../api/dashboard_api.service';


/**
 * Mocks the dashboard backend responses
 */
export class MockDashboardBackend {

  /** Mock dashboard database */
  mockDashPerformanceDB: DashPerformance[] = [];

  /** Mocks backend response */
  requestAllDashboard(): Promise<AllDashResponse> {
    return Promise.resolve({
      data: {
        performances: this.mockDashPerformanceDB
      },
      warnings: []
    });
  }

}
