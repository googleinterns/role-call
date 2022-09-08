/* eslint-disable @typescript-eslint/naming-convention */

import { HttpResponse } from '@angular/common/http';
import * as APITypes from 'src/api-types';

import { AllPerformancesResponse, OnePerformanceResponse, Performance,
} from '../api/performance-api.service';

/** Mocks the oerformance backend responses. */
export class MockPerformanceBackend {

  /** Mock performance database. */
  mockPerformanceDB: Performance[] = [
    {
      uuid: 'performance1:' + Date.now(),
      status: APITypes.PerformanceStatus.PUBLISHED,
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
        perfSegments: [
          {
            id: '12',
            segment: '212',
            type: 'UNDEF',
            length: 600,
            selected_group: 1,
            custom_groups: [{
                position_uuid: '213',
                position_order: 0,
                hasAbsence: false,
                groups: [
                  {
                    group_index: 0, members: [
                      {uuid: '184', position_number: 1, hasAbsence: false},
                      {uuid: '186', position_number: 3, hasAbsence: false},
                      {uuid: '183', position_number: 0, hasAbsence: false},
                      {uuid: '188', position_number: 5, hasAbsence: false},
                      {uuid: '185', position_number: 2, hasAbsence: false},
                      {uuid: '187', position_number: 4, hasAbsence: false},
                    ]
                  },
                  {
                    group_index: 2, members: [
                      {uuid: '196', position_number: 2, hasAbsence: false},
                      {uuid: '195', position_number: 0, hasAbsence: false},
                    ]
                  },
                  {
                    group_index: 1, members: [
                      {uuid: '193', position_number: 4, hasAbsence: false},
                      {uuid: '189', position_number: 0, hasAbsence: false},
                      {uuid: '194', position_number: 5, hasAbsence: false},
                      {uuid: '190', position_number: 1, hasAbsence: false},
                      {uuid: '192', position_number: 3, hasAbsence: false},
                      {uuid: '191', position_number: 2, hasAbsence: false},
                    ]
                  }
                ],
              }
            ],
            name: '',
            hasAbsence: false,
          },
          {
            id: '13',
            segment: 'intermission',
            type: 'UNDEF',
            selected_group: undefined,
            length: 300,
            custom_groups: [],
            name: '',
            hasAbsence: false,
          }
        ]
      }
    },
    {
      uuid: 'performance2:' + Date.now(),
      status: APITypes.PerformanceStatus.DRAFT,
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
        perfSegments: [
          {
            id: '15',
            segment: '212',
            type: 'UNDEF',
            length: 600,
            selected_group: 0,
            custom_groups: [
              {
                position_uuid: '213',
                position_order: 0,
                hasAbsence: false,
                groups: [
                  {
                    group_index: 0, members: [
                      {uuid: '184', position_number: 1, hasAbsence: false},
                      {uuid: '186', position_number: 3, hasAbsence: false},
                      {uuid: '183', position_number: 0, hasAbsence: false},
                      {uuid: '188', position_number: 5, hasAbsence: false},
                      {uuid: '185', position_number: 2, hasAbsence: false},
                      {uuid: '187', position_number: 4, hasAbsence: false},
                    ]
                  },
                  {
                    group_index: 2, members: [
                      {uuid: '196', position_number: 2, hasAbsence: false},
                      {uuid: '195', position_number: 0, hasAbsence: false},
                    ]
                  },
                  {
                    group_index: 1, members: [
                      {uuid: '193', position_number: 4, hasAbsence: false},
                      {uuid: '189', position_number: 0, hasAbsence: false},
                      {uuid: '194', position_number: 5, hasAbsence: false},
                      {uuid: '190', position_number: 1, hasAbsence: false},
                      {uuid: '192', position_number: 3, hasAbsence: false},
                      {uuid: '191', position_number: 2, hasAbsence: false},
                    ]
                  }
                ]
              }
            ],
            name: '',
            hasAbsence: false,
          },
          {
            id: '14',
            segment: 'intermission',
            type: 'UNDEF',
            length: 300,
            selected_group: undefined,
            custom_groups: [],
            name: '',
            hasAbsence: false,
          }
        ]
      }
    }
  ];
  shouldRejectSetRequest = false;

  /** Mocks backend response. */
  requestAllPerformances = (): Promise<AllPerformancesResponse> =>
    Promise.resolve({
      data: {
        performances: this.mockPerformanceDB
      },
      warnings: []
    });


  /** Mocks backend response. */
  requestOnePerformance = (
    uuid: APITypes.PerformanceUUID,
  ): Promise<OnePerformanceResponse> =>
    Promise.resolve({
      data: {
        performance: this.mockPerformanceDB.find(val =>
          val.uuid === uuid || val.uuid === uuid
        ),
      },
      warnings: []
    });


  /** Mocks performance create/edit response. */
  requestPerformanceSet = (
    performance: Performance,
  ): Promise<HttpResponse<any>> => {
    if (!this.shouldRejectSetRequest) {
      const perfInd = this.mockPerformanceDB.findIndex(
          val => val.uuid === performance.uuid);
      if (perfInd === -1) {
        this.mockPerformanceDB.push(performance);
      } else {
        this.mockPerformanceDB[perfInd] = performance;
      }
      return Promise.resolve({
        status: 200
      } as HttpResponse<any>);
    } else {
      return Promise.resolve({
        status: 400
      } as HttpResponse<any>);
    }
  };

  /** Mocks performance delete response. */
  requestPerformanceDelete = (
    performance: Performance,
  ): Promise<HttpResponse<any>> => {
    this.mockPerformanceDB =
        this.mockPerformanceDB.filter(val => val.uuid !== performance.uuid);
    return Promise.resolve({
      status: 200
    } as HttpResponse<any>);
  };
}
