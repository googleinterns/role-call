import { HttpResponse } from '@angular/common/http';
import { APITypes } from 'src/types';
import { AllPerformancesResponse, OnePerformanceResponse, Performance } from '../api/performance-api.service';

/**
 * Mocks the piece backend responses
 */
export class MockPerformanceBackend {

  /** Mock piece database */
  mockPerformanceDB: Performance[] = [];
  shouldRejectSetRequest = false;

  /** Mocks backend response */
  requestAllPerformances(): Promise<AllPerformancesResponse> {
    return Promise.resolve({
      data: {
        performances: this.mockPerformanceDB
      },
      warnings: []
    });
  }

  /** Mocks backend response */
  requestOnePerformance(uuid: APITypes.PerformanceUUID): Promise<OnePerformanceResponse> {
    return Promise.resolve({
      data: {
        performance: this.mockPerformanceDB.find(val => { return val.uuid == uuid || val.uuid === uuid })
      },
      warnings: []
    });
  };

  /** Mocks performance create/edit response */
  requestPerformanceSet(performance: Performance): Promise<HttpResponse<any>> {
    if (!this.shouldRejectSetRequest) {
      let pieceInd = this.mockPerformanceDB.findIndex((val) => val.uuid == performance.uuid);
      if (pieceInd == -1) {
        this.mockPerformanceDB.push(performance);
      } else {
        this.mockPerformanceDB[pieceInd] = performance;
      }
      return Promise.resolve({
        status: 200
      } as HttpResponse<any>);
    } else {
      return Promise.resolve({
        status: 400
      } as HttpResponse<any>);
    }
  }

  /** Mocks piece delete response */
  requestPerformanceDelete(performance: Performance): Promise<HttpResponse<any>> {
    this.mockPerformanceDB = this.mockPerformanceDB.filter(val => val.uuid != performance.uuid);
    return Promise.resolve({
      status: 200
    } as HttpResponse<any>);
  }

}