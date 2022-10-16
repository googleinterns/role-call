/* eslint-disable @typescript-eslint/naming-convention */

import { MockBackend } from './mock-backend';
import * as APITypes from 'src/api-types';
import { Performance } from '../api/performance-api.service';
// import { CacheLoadReturn, CacheGetReturn, ItemStdReturn,
// } from '../utils/data-cache';

/** Mocks the unavailability backend responses. */
export class MockPerformanceBackend<IXT> extends MockBackend<IXT> {

  // shouldRejectSetRequest = false;

  constructor(
  ) {
    super();
    this.mockDb = [{
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
          perfSegments: [{
              id: '12',
              segment: '212',
              type: 'UNDEF',
              length: 600,
              selected_group: 1,
              custom_groups: [{
                  position_uuid: '213',
                  position_order: 0,
                  hasAbsence: false,
                  groups: [{
                      group_index: 0, members: [
                        { uuid: '184', position_number: 1, hasAbsence: false },
                        { uuid: '186', position_number: 3, hasAbsence: false },
                        { uuid: '183', position_number: 0, hasAbsence: false },
                        { uuid: '188', position_number: 5, hasAbsence: false },
                        { uuid: '185', position_number: 2, hasAbsence: false },
                        { uuid: '187', position_number: 4, hasAbsence: false },
                      ]
                    }, {
                      group_index: 2, members: [
                        {uuid: '196', position_number: 2, hasAbsence: false },
                        {uuid: '195', position_number: 0, hasAbsence: false },
                      ]
                    }, {
                      group_index: 1, members: [
                        { uuid: '193', position_number: 4, hasAbsence: false },
                        { uuid: '189', position_number: 0, hasAbsence: false },
                        { uuid: '194', position_number: 5, hasAbsence: false },
                        { uuid: '190', position_number: 1, hasAbsence: false },
                        { uuid: '192', position_number: 3, hasAbsence: false },
                        { uuid: '191', position_number: 2, hasAbsence: false },
                      ]
                    }
                  ],
                }
              ],
              name: '',
              hasAbsence: false,
            }, {
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
      }, {
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
          perfSegments: [{
              id: '15',
              segment: '212',
              type: 'UNDEF',
              length: 600,
              selected_group: 0,
              custom_groups: [{
                  position_uuid: '213',
                  position_order: 0,
                  hasAbsence: false,
                  groups: [{
                      group_index: 0, members: [
                        { uuid: '184', position_number: 1, hasAbsence: false },
                        { uuid: '186', position_number: 3, hasAbsence: false },
                        { uuid: '183', position_number: 0, hasAbsence: false },
                        { uuid: '188', position_number: 5, hasAbsence: false },
                        { uuid: '185', position_number: 2, hasAbsence: false },
                        { uuid: '187', position_number: 4, hasAbsence: false },
                      ]
                    }, {
                      group_index: 2, members: [
                        {uuid: '196', position_number: 2, hasAbsence: false },
                        {uuid: '195', position_number: 0, hasAbsence: false },
                      ]
                    }, {
                      group_index: 1, members: [
                        { uuid: '193', position_number: 4, hasAbsence: false },
                        { uuid: '189', position_number: 0, hasAbsence: false },
                        { uuid: '194', position_number: 5, hasAbsence: false },
                        { uuid: '190', position_number: 1, hasAbsence: false },
                        { uuid: '192', position_number: 3, hasAbsence: false },
                        { uuid: '191', position_number: 2, hasAbsence: false },
                      ]
                    }
                  ]
                }
              ],
              name: '',
              hasAbsence: false,
            }, {
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
    ] as Performance[];
  }

  // /** Mocks backend response */
  // override requestAllMocks = async (
  //   ): Promise<CacheLoadReturn> =>
  //     Promise.resolve({
  //       items: this.mockDb,
  //       warnings: []
  //     });

  // /** Mocks backend response */
  // override requestOneMock = async (
  //   ix: unknown,
  //   getIx: (item: unknown) => IXT,
  // ): Promise<CacheGetReturn> => {
  //   const uuid = ix as IXT;
  //   return Promise.resolve({
  //     ok: { successful: true },
  //     item: this.mockDb.find(itm => getIx(itm) === uuid),
  //     warnings: [],
  //   } as CacheGetReturn);
  // };

  // override requestMockSet = (
  //   item: unknown,
  //   _getIx: (item: unknown) => IXT,
  // ): Promise<ItemStdReturn> => {
  //   const performance = item as Performance;
  //   const pos =
  //     this.mockDb.findIndex(val =>
  //       ( val as Performance ).uuid === performance.uuid);
  //   if (pos === -1) {
  //     this.mockDb.push(performance);
  //   } else {
  //     this.mockDb[pos] = performance;
  //   }
  //   return Promise.resolve({
  //     data: performance,
  //     warnings: [],
  //   });
  // };

  // /** Mocks user delete response */
  // override requestMockDelete = (
  //   item: unknown,
  //   _getIx: (item: unknown) => IXT,
  // ): Promise<ItemStdReturn> => {
  //   const performance = item as Performance;
  //   this.mockDb =
  //     this.mockDb.filter(itm =>
  //       ( itm as Performance ).uuid !== performance.uuid);
  //   return Promise.resolve({
  //     data: performance,
  //     warnings: [],
  //   });
  // };

}
