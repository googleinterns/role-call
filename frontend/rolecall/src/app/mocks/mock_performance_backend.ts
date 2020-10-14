import {HttpResponse} from '@angular/common/http';
import {APITypes, PerformanceStatus} from 'src/api_types';
import {AllPerformancesResponse, OnePerformanceResponse, Performance} from '../api/performance-api.service';

/**
 * Mocks the piece backend responses
 */
export class MockPerformanceBackend {

  /** Mock piece database */
  mockPerformanceDB: Performance[] = [
    {
      uuid: 'performance1:' + Date.now(),
      status: PerformanceStatus.PUBLISHED,
      step_1: {
        title: 'Test Title 1',
        date: (Date.now() - 600000),
        city: 'New York',
        country: 'USA',
        state: 'NY',
        venue: 'Apollo Theater',
        description: ''
      },
      step_2: {
        segments: ['212', 'intermission']
      },
      step_3: {
        segments: [
          {
            id: '12',
            segment: '212',
            length: 600,
            selected_group: 1,
            custom_groups: [
              {
                'position_uuid': '213',
                'position_order': 0,
                'groups': [
                  {
                    'group_index': 0, 'members': [
                      {'uuid': '184', 'position_number': 1},
                      {'uuid': '186', 'position_number': 3},
                      {'uuid': '183', 'position_number': 0},
                      {'uuid': '188', 'position_number': 5},
                      {'uuid': '185', 'position_number': 2},
                      {'uuid': '187', 'position_number': 4}
                    ]
                  },
                  {
                    'group_index': 2, 'members': [
                      {'uuid': '196', 'position_number': 2},
                      {'uuid': '195', 'position_number': 0}
                    ]
                  },
                  {
                    'group_index': 1, 'members': [
                      {'uuid': '193', 'position_number': 4},
                      {'uuid': '189', 'position_number': 0},
                      {'uuid': '194', 'position_number': 5},
                      {'uuid': '190', 'position_number': 1},
                      {'uuid': '192', 'position_number': 3},
                      {'uuid': '191', 'position_number': 2}
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: '13',
            segment: 'intermission',
            selected_group: undefined,
            length: 300,
            custom_groups: []
          }
        ]
      }
    },
    {
      uuid: 'performance2:' + Date.now(),
      status: PerformanceStatus.DRAFT,
      step_1: {
        title: 'Test Title 2',
        date: (Date.now() - 600000),
        city: 'New York',
        country: 'USA',
        state: 'NY',
        venue: 'Apollo Theater',
        description: ''
      },
      step_2: {
        segments: ['212', 'intermission']
      },
      step_3: {
        segments: [
          {
            id: '15',
            segment: '212',
            length: 600,
            selected_group: 0,
            custom_groups: [
              {
                'position_uuid': '213',
                'position_order': 0,
                'groups': [
                  {
                    'group_index': 0, 'members': [
                      {'uuid': '184', 'position_number': 1},
                      {'uuid': '186', 'position_number': 3},
                      {'uuid': '183', 'position_number': 0},
                      {'uuid': '188', 'position_number': 5},
                      {'uuid': '185', 'position_number': 2},
                      {'uuid': '187', 'position_number': 4}
                    ]
                  },
                  {
                    'group_index': 2, 'members': [
                      {'uuid': '196', 'position_number': 2},
                      {'uuid': '195', 'position_number': 0}
                    ]
                  },
                  {
                    'group_index': 1, 'members': [
                      {'uuid': '193', 'position_number': 4},
                      {'uuid': '189', 'position_number': 0},
                      {'uuid': '194', 'position_number': 5},
                      {'uuid': '190', 'position_number': 1},
                      {'uuid': '192', 'position_number': 3},
                      {'uuid': '191', 'position_number': 2}
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: '14',
            segment: 'intermission',
            length: 300,
            selected_group: undefined,
            custom_groups: []
          }
        ]
      }
    }
  ];
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
        performance: this.mockPerformanceDB.find(val => {
          return val.uuid == uuid || val.uuid === uuid;
        })
      },
      warnings: []
    });
  }

  /** Mocks performance create/edit response */
  requestPerformanceSet(performance: Performance): Promise<HttpResponse<any>> {
    if (!this.shouldRejectSetRequest) {
      const pieceInd = this.mockPerformanceDB.findIndex(
          (val) => val.uuid == performance.uuid);
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
    this.mockPerformanceDB =
        this.mockPerformanceDB.filter(val => val.uuid != performance.uuid);
    return Promise.resolve({
      status: 200
    } as HttpResponse<any>);
  }

}
